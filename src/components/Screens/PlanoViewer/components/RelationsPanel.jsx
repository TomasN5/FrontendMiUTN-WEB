import React, { useState, useMemo } from 'react';
import { AREA_TYPES } from '../utils/constants';
import { geometryUtils } from '../utils/geometry';
import './../styles/RelationsPanel.css';

 const isSpecialType = (tipo) => [
        AREA_TYPES.EXTINTOR,
        AREA_TYPES.SALIDA_EMERGENCIA,
        AREA_TYPES.DESFIBRILADOR, 
        AREA_TYPES.BOTIQUIN,
        AREA_TYPES.ALARMA
      ].includes(tipo);

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
  connectionLines,
  onDeleteNode, // 🔥 NUEVA PROP: función para eliminar nodos
  onDeleteConnection // 🔥 NUEVA PROP: función para eliminar conexiones
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredNode, setHoveredNode] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null); // { type: 'node' | 'connection', id: string }

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
                planoId: pasillo.planoId,
                connectionId: pasillo.id, // 🔥 ID de la conexión para poder eliminarla
                connectionData: pasillo // 🔥 Datos completos de la conexión
              });
            }
            if (pasillo.to && pasillo.to.id === nodeId) {
              connections.push({
                type: 'pasillo',
                node: pasillo.from,
                direction: 'entrada',
                planoId: pasillo.planoId,
                connectionId: pasillo.id, // 🔥 ID de la conexión
                connectionData: pasillo // 🔥 Datos completos
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
        areas: allNodes.filter(n => 
          n.tipo !== AREA_TYPES.PUNTO && 
          n.tipo !== AREA_TYPES.PASILLO &&
          !isSpecialType(n.tipo) // 🔥 EXCLUIR TIPOS ESPECIALES
        ).length,
        puntos: allNodes.filter(n => n.tipo === AREA_TYPES.PUNTO).length,
        pasillos: allNodes.filter(n => n.tipo === AREA_TYPES.PASILLO).length,
        escaleras: allNodes.filter(n => n.tipo === AREA_TYPES.ESCALERA).length,
        // 🔥 NUEVAS ESTADÍSTICAS
        seguridad: allNodes.filter(n => isSpecialType(n.tipo)).length,
        extintores: allNodes.filter(n => n.tipo === AREA_TYPES.EXTINTOR).length,
        salidas: allNodes.filter(n => n.tipo === AREA_TYPES.SALIDA_EMERGENCIA).length,
        desfibriladores: allNodes.filter(n => n.tipo === AREA_TYPES.DESFIBRILADOR).length
      }), [allNodes]);

      // Función auxiliar
     

      // En RelationsPanel.jsx - mejora las funciones de hover
    const handleNodeMouseEnter = (node) => {
      console.log("🖱️ HOVER ENTER - Nodo:", node.nombre, node.id);
      setHoveredNode(node);
      if (onNodeHover) {
        onNodeHover(node);
      } else {
        console.log("❌ onNodeHover no está definido");
      }
    };

    const handleNodeMouseLeave = () => {
      console.log("🖱️ HOVER LEAVE");
      setHoveredNode(null);
      if (onNodeLeave) {
        onNodeLeave();
      } else {
        console.log("❌ onNodeLeave no está definido");
      }
    };

// 🔥 NUEVA FUNCIÓN: Hover en conexiones
    const handleConnectionMouseEnter = (connection) => {
      if (onNodeHover) {
        // Destacar ambos nodos de la conexión
        onNodeHover(connection.connectionData, 'connection');
      }
    };

    const handleConnectionMouseLeave = () => {
      if (onNodeLeave) {
        onNodeLeave();
      }
    };
  // 🔥 NUEVAS FUNCIONES PARA ELIMINAR
  const handleDeleteNode = (nodeId) => {
    if (onDeleteNode) {
      onDeleteNode(nodeId);
      setShowDeleteConfirm(null);
    }
  };

  const handleDeleteConnection = (connectionId) => {
    if (onDeleteConnection) {
      onDeleteConnection(connectionId);
      setShowDeleteConfirm(null);
    }
  };

  const confirmDelete = (type, id, name) => {
    setShowDeleteConfirm({ type, id, name });
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(null);
  };

  const getTypeDisplayName = (tipo) => {
    const names = {
      [AREA_TYPES.AULA]: 'Aula',
      [AREA_TYPES.SALON]: 'Salón',
      [AREA_TYPES.HALL]: 'Hall',
      [AREA_TYPES.BANO]: 'Baño',
      [AREA_TYPES.ESCALERA]: 'Escalera',
      [AREA_TYPES.PUNTO]: 'Punto',
      [AREA_TYPES.PASILLO]: 'Pasillo',
      [AREA_TYPES.EXTINTOR]: '🧯 Matafuegos',
      [AREA_TYPES.SALIDA_EMERGENCIA]: '🚪 Salida Emergencia',
      [AREA_TYPES.DESFIBRILADOR]: '💓 Desfibrilador',
      [AREA_TYPES.BOTIQUIN]: '🩹 Botiquín',
      [AREA_TYPES.ALARMA]: '🚨 Alarma',
      [AREA_TYPES.TOTEM]: '📟 Tótem'
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

      {/* 🔥 MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
      {showDeleteConfirm && (
        <div className="relations-panel__delete-modal">
          <div className="relations-panel__delete-content">
            <h4>¿Estás seguro?</h4>
            <p>
              {showDeleteConfirm.type === 'node' 
                ? `Vas a eliminar el nodo "${showDeleteConfirm.name}". Esta acción no se puede deshacer.`
                : `Vas a eliminar esta conexión. Esta acción no se puede deshacer.`
              }
            </p>
            <div className="relations-panel__delete-actions">
              <button 
                onClick={cancelDelete}
                className="relations-panel__delete-cancel"
              >
                Cancelar
              </button>
              <button 
                onClick={() => 
                  showDeleteConfirm.type === 'node' 
                    ? handleDeleteNode(showDeleteConfirm.id)
                    : handleDeleteConnection(showDeleteConfirm.id)
                }
                className="relations-panel__delete-confirm"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

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
                  onMouseEnter={() => {
                    console.log("🖱️ Hover en nodo del panel:", node.nombre);
                    if (onNodeHover) {
                      onNodeHover(node); // ← Esto debería activar el highlight en el mapa
                    }
                  }}
                  onMouseLeave={() => {
                    console.log("🖱️ Leave del nodo del panel");
                    if (onNodeLeave) {
                      onNodeLeave();
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="relations-panel__node-header">
                    <div className="relations-panel__node-title">
                      <h4 className="relations-panel__node-name">{node.nombre}</h4>
                      <span className={`relations-panel__node-type relations-panel__node-type--${node.tipo}`}>
                        {getTypeDisplayName(node.tipo)}
                      </span>
                    </div>
                    
                    {/* 🔥 BOTÓN ELIMINAR NODO */}
                    {onDeleteNode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmDelete('node', node.id, node.nombre);
                        }}
                        className="relations-panel__delete-button"
                        title={`Eliminar ${node.nombre}`}
                      >
                        🗑️
                      </button>
                    )}
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
                          <div 
                            key={index} 
                            className="relations-panel__connection-item"
                            onMouseEnter={() => handleConnectionMouseEnter(conn)}
                            onMouseLeave={handleConnectionMouseLeave}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="relations-panel__connection-info">
                              <span className="relations-panel__connection-icon">
                                {conn.direction === 'salida' ? '➡️' : '⬅️'}
                              </span>
                              <span>
                                {conn.node.nombre} ({getTypeDisplayName(conn.node.tipo)})
                              </span>
                            </div>
                            
                            {/* Botón eliminar conexión */}
                            {onDeleteConnection && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  confirmDelete('connection', conn.connectionId, `Conexión ${conn.node.nombre}`);
                                }}
                                className="relations-panel__delete-connection-button"
                                title="Eliminar conexión"
                              >
                                ×
                              </button>
                            )}
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