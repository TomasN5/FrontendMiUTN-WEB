import React, { useState, useMemo } from 'react';
import { AREA_TYPES } from '../utils/constants';
import { geometryUtils } from '../utils/geometry';
import './../styles/RelationsPanel.css';

const RelationsPanel = ({
  isVisible,
  onClose,
  areas = [],
  points = [],
  todosLosDatos = {},
  planoActual,
  onNodeHover,
  onNodeLeave,
  highlightedNode,
  connectionLines
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredNode, setHoveredNode] = useState(null);

  // Combinar todos los nodos de todos los planos
  const allNodes = useMemo(() => {
    const nodes = [];
    
    Object.values(todosLosDatos).forEach(planoData => {
      if (planoData.areas) nodes.push(...planoData.areas);
      if (planoData.points) nodes.push(...planoData.points);
    });
    
    return nodes;
  }, [todosLosDatos]);

  // Encontrar conexiones para un nodo
  const getNodeConnections = (nodeId) => {
    const connections = [];
    
    // Buscar en pasillos
    Object.values(todosLosDatos).forEach(planoData => {
      if (planoData.areas) {
        planoData.areas
          .filter(area => area.tipo === AREA_TYPES.PASILLO)
          .forEach(pasillo => {
            if (pasillo.from && pasillo.from.id === nodeId) {
              connections.push({
                type: 'pasillo',
                node: pasillo.to,
                direction: 'salida',
                planoId: pasillo.planoId
              });
            }
            if (pasillo.to && pasillo.to.id === nodeId) {
              connections.push({
                type: 'pasillo',
                node: pasillo.from,
                direction: 'entrada',
                planoId: pasillo.planoId
              });
            }
          });
      }
    });

    return connections;
  };

  // Filtrar nodos basado en búsqueda
  const filteredNodes = useMemo(() => {
    if (!searchTerm) return allNodes;
    
    return allNodes.filter(node => 
      node.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (node.carrera && node.carrera.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (node.piso && node.piso.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [allNodes, searchTerm]);

  // Estadísticas
  const stats = useMemo(() => ({
    total: allNodes.length,
    areas: allNodes.filter(n => n.tipo !== AREA_TYPES.PUNTO && n.tipo !== AREA_TYPES.PASILLO).length,
    puntos: allNodes.filter(n => n.tipo === AREA_TYPES.PUNTO).length,
    pasillos: allNodes.filter(n => n.tipo === AREA_TYPES.PASILLO).length,
    escaleras: allNodes.filter(n => n.tipo === AREA_TYPES.ESCALERA).length
  }), [allNodes]);

  const handleNodeMouseEnter = (node) => {
      setHoveredNode(node);
      if (onNodeHover) {
        onNodeHover(node);
      }
    };

  const handleNodeMouseLeave = () => {
    setHoveredNode(null);
    if (onNodeLeave) {
      onNodeLeave();
    }
  };

  const getTypeDisplayName = (tipo) => {
    const names = {
      [AREA_TYPES.AULA]: 'Aula',
      [AREA_TYPES.SALON]: 'Salón',
      [AREA_TYPES.HALL]: 'Hall',
      [AREA_TYPES.BANO]: 'Baño',
      [AREA_TYPES.ESCALERA]: 'Escalera',
      [AREA_TYPES.PUNTO]: 'Punto',
      [AREA_TYPES.PASILLO]: 'Pasillo'
    };
    return names[tipo] || tipo;
  };

  if (!isVisible) return null;

  return (
    <div className="relations-panel">
      <div className="relations-panel__header">
        <h3 className="relations-panel__title">🔗 Relaciones y Conexiones</h3>
        <button
          onClick={onClose}
          className="relations-panel__close-button"
          title="Cerrar panel de relaciones"
        >
          ×
        </button>
      </div>

      <div className="relations-panel__description">
        Explora las conexiones entre nodos. Pasa el cursor sobre cualquier elemento para ver sus relaciones en el mapa.
      </div>

      <div className="relations-panel__section">
        <div className="relations-panel__section-title">
          🔍 Buscar Nodos
        </div>
        <input
          type="text"
          placeholder="Buscar por nombre, tipo, carrera..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="relations-panel__search"
        />
      </div>

      <div className="relations-panel__section">
        <div className="relations-panel__section-title">
          📍 Todos los Nodos ({filteredNodes.length})
        </div>
        
        {filteredNodes.length === 0 ? (
          <div className="relations-panel__empty-state">
            {searchTerm ? 'No se encontraron nodos' : 'No hay nodos creados'}
          </div>
        ) : (
          <div className="relations-panel__node-list">
            {filteredNodes.map(node => {
              const connections = getNodeConnections(node.id);
              const isHighlighted = highlightedNode?.id === node.id;
              const isHovered = hoveredNode?.id === node.id;
              
              return (
                <div
                key={node.id}
                className={`relations-panel__node-item ${
                  isHighlighted ? 'relations-panel__node-item--highlighted' : ''
                }`}
                onMouseEnter={() => handleNodeMouseEnter(node)}
                onMouseLeave={handleNodeMouseLeave}
                style={{ cursor: 'pointer' }} // Agrega cursor pointer para indicar que es interactivo
              >
                  <div className="relations-panel__node-header">
                    <h4 className="relations-panel__node-name">{node.nombre}</h4>
                    <span className={`relations-panel__node-type relations-panel__node-type--${node.tipo}`}>
                      {getTypeDisplayName(node.tipo)}
                    </span>
                  </div>
                  
                  <div className="relations-panel__node-info">
                    {node.carrera && `${node.carrera} • `}{node.piso}
                    {node.planoId && ` • Plano: ${node.planoId}`}
                  </div>

                  {connections.length > 0 && (
                    <div className="relations-panel__connections">
                      <div className="relations-panel__connections-title">
                        🔗 {connections.length} conexión{connections.length !== 1 ? 'es' : ''}
                      </div>
                      <div className="relations-panel__connection-list">
                        {connections.slice(0, 3).map((conn, index) => (
                          <div key={index} className="relations-panel__connection-item">
                            <span className="relations-panel__connection-icon">
                              {conn.direction === 'salida' ? '➡️' : '⬅️'}
                            </span>
                            <span>
                              {conn.node.nombre} ({getTypeDisplayName(conn.node.tipo)})
                            </span>
                          </div>
                        ))}
                        {connections.length > 3 && (
                          <div className="relations-panel__connection-item">
                            +{connections.length - 3} más...
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="relations-panel__stats">
        <span>📊 Total: {stats.total}</span>
        <span>🏢 Áreas: {stats.areas}</span>
        <span>📍 Puntos: {stats.puntos}</span>
        <span>🪜 Escaleras: {stats.escaleras}</span>
      </div>
    </div>
  );
};

export default RelationsPanel;