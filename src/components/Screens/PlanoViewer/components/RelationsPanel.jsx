// RelationsPanel.jsx - VERSIÓN OPTIMIZADA
import React, { useState, useMemo } from 'react';
import { AREA_TYPES } from '../utils/constants';
import './../styles/RelationsPanel.css';

// Función auxiliar para tipos especiales
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
  todosLosDatos = {},
  onNodeHover,
  onNodeLeave,
  highlightedNode,
  onDeleteNode,
  onDeleteConnection,
  onNavigateToNode,
  planoActual
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('todos');
  const [isLocating, setIsLocating] = useState(false);
  const [navigatingNode, setNavigatingNode] = useState(null);

  // Combinar todos los nodos de todos los planos
  const allNodes = useMemo(() => {
    const nodes = [];
    
    Object.values(todosLosDatos).forEach(planoData => {
      if (planoData.areas) nodes.push(...planoData.areas);
      if (planoData.points) nodes.push(...planoData.points);
    });
    
    return nodes;
  }, [todosLosDatos]);

  // Filtrar nodos basado en búsqueda y filtro activo
  const filteredNodes = useMemo(() => {
    let filtered = allNodes;
    
    if (activeFilter !== 'todos') {
      filtered = filtered.filter(node => {
        switch (activeFilter) {
          case 'areas':
            return node.tipo !== AREA_TYPES.PUNTO && 
                   node.tipo !== AREA_TYPES.PASILLO &&
                   !isSpecialType(node.tipo);
          case 'puntos':
            return node.tipo === AREA_TYPES.PUNTO;
          case 'escaleras':
            return node.tipo === AREA_TYPES.ESCALERA;
          case 'pasillos':
            return node.tipo === AREA_TYPES.PASILLO;
          case 'seguridad':
            return isSpecialType(node.tipo);
          default:
            return true;
        }
      });
    }
    
    if (searchTerm) {
      filtered = filtered.filter(node => 
        node.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (node.carrera && node.carrera.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (node.piso && node.piso.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return filtered;
  }, [allNodes, searchTerm, activeFilter]);

  // Encontrar conexiones para un nodo
  const getNodeConnections = (nodeId) => {
    const connections = [];
    
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
                connectionId: pasillo.id,
              });
            }
            if (pasillo.to && pasillo.to.id === nodeId) {
              connections.push({
                type: 'pasillo',
                node: pasillo.from,
                direction: 'entrada',
                connectionId: pasillo.id,
              });
            }
          });
      }
    });

    return connections;
  };

  // Estadísticas
  const stats = useMemo(() => ({
    total: allNodes.length,
    areas: allNodes.filter(n => 
      n.tipo !== AREA_TYPES.PUNTO && 
      n.tipo !== AREA_TYPES.PASILLO &&
      !isSpecialType(n.tipo)
    ).length,
    puntos: allNodes.filter(n => n.tipo === AREA_TYPES.PUNTO).length,
    pasillos: allNodes.filter(n => n.tipo === AREA_TYPES.PASILLO).length,
    escaleras: allNodes.filter(n => n.tipo === AREA_TYPES.ESCALERA).length,
    seguridad: allNodes.filter(n => isSpecialType(n.tipo)).length
  }), [allNodes]);

  // 🔥 Determinar si el nodo está en el plano actual
  const isNodeInCurrentPlano = (node) => {
    return node.planoId === planoActual?.id;
  };

  // 🔥 NUEVA FUNCIÓN: Navegar al nodo (SOLO si está en plano actual)
  const handleNodeClick = (node) => {
    console.log("🎯 Navegando al nodo:", node.nombre, "en plano:", node.planoId);
    
    // 🔥 SOLO navegar si el nodo está en el plano actual
    if (!isNodeInCurrentPlano(node)) {
      console.log("⚠️ Nodo no está en el plano actual, no se puede navegar");
      return;
    }
    
    // Mostrar estado de navegación
    setNavigatingNode(node);
    
    if (onNavigateToNode) {
      onNavigateToNode(node);
    }
    
    // También aplicar highlight
    if (onNodeHover) {
      onNodeHover(node);
    }
    
    // Quitar estado de navegación después de un tiempo
    setTimeout(() => {
      setNavigatingNode(null);
    }, 2000);
  };

  // 🔥 NUEVA FUNCIÓN: Navegar a conexión (SOLO si está en plano actual)
  const handleConnectionClick = (connection) => {
    console.log("🎯 Navegando a conexión:", connection.node.nombre);
    
    // 🔥 SOLO navegar si el nodo de la conexión está en el plano actual
    if (!isNodeInCurrentPlano(connection.node)) {
      console.log("⚠️ Nodo de conexión no está en el plano actual, no se puede navegar");
      return;
    }
    
    setNavigatingNode(connection.node);
    
    if (onNavigateToNode) {
      onNavigateToNode(connection.node);
    }
    
    if (onNodeHover) {
      onNodeHover(connection.node);
    }
    
    setTimeout(() => {
      setNavigatingNode(null);
    }, 2000);
  };

  // 🔥 OPTIMIZADO: Handlers de hover (SOLO si está en plano actual)
  const handleNodeMouseEnter = (node) => {
    // 🔥 SOLO hacer highlight si el nodo está en el plano actual
    if (!isNodeInCurrentPlano(node)) {
      return;
    }
    
    setIsLocating(true);
    
    if (onNodeHover) {
      onNodeHover(node);
    }
  };

  const handleNodeMouseLeave = () => {
    setIsLocating(false);
    
    if (onNodeLeave) {
      onNodeLeave();
    }
  };

  const handleConnectionMouseEnter = (connection) => {
    // 🔥 SOLO hacer highlight si el nodo de la conexión está en el plano actual
    if (!isNodeInCurrentPlano(connection.node)) {
      return;
    }
    
    setIsLocating(true);
    
    if (onNodeHover) {
      onNodeHover(connection.node);
    }
  };

  const handleConnectionMouseLeave = () => {
    setIsLocating(false);
    
    if (onNodeLeave) {
      onNodeLeave();
    }
  };

  // Funciones para eliminar
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

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const confirmDelete = (type, id, name) => {
    setShowDeleteConfirm({ type, id, name });
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(null);
  };

  const getTypeDisplayName = (tipo) => {
    const names = {
      [AREA_TYPES.AULA]: 'Aula',
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

  const getTypeIcon = (tipo) => {
    const icons = {
      [AREA_TYPES.AULA]: '🏫',
      [AREA_TYPES.HALL]: '🏢',
      [AREA_TYPES.BANO]: '🚻',
      [AREA_TYPES.ESCALERA]: '🪜',
      [AREA_TYPES.PUNTO]: '📍',
      [AREA_TYPES.PASILLO]: '🛣️',
      [AREA_TYPES.EXTINTOR]: '🧯',
      [AREA_TYPES.SALIDA_EMERGENCIA]: '🚪',
      [AREA_TYPES.DESFIBRILADOR]: '💓',
      [AREA_TYPES.BOTIQUIN]: '🩹',
      [AREA_TYPES.ALARMA]: '🚨',
      [AREA_TYPES.TOTEM]: '📟'
    };
    return icons[tipo] || '📁';
  };

  if (!isVisible) return null;

  return (
    <div className={`relations-panel ${isLocating ? 'relations-panel--locating' : ''}`}>
      {/* Overlay de navegación */}
      {navigatingNode && (
        <div className="relations-panel__location-overlay">
          <div className="relations-panel__location-pulse"></div>
          <div className="relations-panel__location-text">
            🎯 Navegando a {navigatingNode.nombre}...
          </div>
        </div>
      )}

      <div className="relations-panel__header">
        <div className="relations-panel__header-content">
          <h3 className="relations-panel__title">
            🔗 Gestor de Relaciones
          </h3>
          <p className="relations-panel__subtitle">
            👆 Haz clic en cualquier nodo para navegar a su ubicación
          </p>
        </div>
        <button
          onClick={onClose}
          className="relations-panel__close-button"
          title="Cerrar panel de relaciones"
        >
          ×
        </button>
      </div>

      {/* Filtros y búsqueda */}
      <div className="relations-panel__filters">
        <div className="relations-panel__search-container">
          <input
            type="text"
            placeholder="🔍 Buscar nodos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="relations-panel__search"
          />
        </div>
        
        <div className="relations-panel__filter-tabs">
          {[
            { key: 'todos', label: 'Todos', count: stats.total },
            { key: 'areas', label: 'Áreas', count: stats.areas },
            { key: 'puntos', label: 'Puntos', count: stats.puntos },
            { key: 'escaleras', label: 'Escaleras', count: stats.escaleras },
            { key: 'pasillos', label: 'Pasillos', count: stats.pasillos },
            { key: 'seguridad', label: 'Seguridad', count: stats.seguridad }
          ].map(filter => (
            <button
              key={filter.key}
              className={`relations-panel__filter-tab ${
                activeFilter === filter.key ? 'relations-panel__filter-tab--active' : ''
              }`}
              onClick={() => setActiveFilter(filter.key)}
            >
              <span className="relations-panel__filter-label">{filter.label}</span>
              <span className="relations-panel__filter-count">{filter.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="relations-panel__delete-modal">
          <div className="relations-panel__delete-content">
            <div className="relations-panel__delete-icon">⚠️</div>
            <h4>Confirmar Eliminación</h4>
            <p>
              {showDeleteConfirm.type === 'node' 
                ? `¿Estás seguro de eliminar "${showDeleteConfirm.name}"?`
                : `¿Estás seguro de eliminar esta conexión?`
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

      {/* Lista de nodos */}
      <div className="relations-panel__content">
        <div className="relations-panel__nodes-header">
          <span className="relations-panel__nodes-count">
            {filteredNodes.length} nodo{filteredNodes.length !== 1 ? 's' : ''} encontrado{filteredNodes.length !== 1 ? 's' : ''}
          </span>
          {isLocating && (
            <div className="relations-panel__locating-indicator">
              <div className="relations-panel__locating-dot"></div>
              Localizando...
            </div>
          )}
        </div>

        {filteredNodes.length === 0 ? (
          <div className="relations-panel__empty-state">
            <div className="relations-panel__empty-icon">🔍</div>
            <p>No se encontraron nodos</p>
            <small>Intenta cambiar los filtros o términos de búsqueda</small>
          </div>
        ) : (
          <div className="relations-panel__node-list">
            {filteredNodes.map(node => {
              const connections = getNodeConnections(node.id);
              const isHighlighted = highlightedNode?.id === node.id;
              const isInCurrentPlano = isNodeInCurrentPlano(node);
              
              return (
                <div
                  key={node.id}
                  className={`relations-panel__node-item ${
                    isHighlighted && isInCurrentPlano ? 'relations-panel__node-item--highlighted' : ''
                  } ${isInCurrentPlano ? 'relations-panel__node-item--current-plano' : 'relations-panel__node-item--other-plano'}`}
                  onMouseEnter={() => handleNodeMouseEnter(node)}
                  onMouseLeave={handleNodeMouseLeave}
                  onClick={() => handleNodeClick(node)}
                >
                  <div className="relations-panel__node-header">
                    <div className="relations-panel__node-icon">
                      {getTypeIcon(node.tipo)}
                      {isInCurrentPlano ? (
                        <span title="En plano actual" style={{marginLeft: '5px', fontSize: '12px'}}>📍</span>
                      ) : (
                        <span title="En otro plano" style={{marginLeft: '5px', fontSize: '12px', opacity: 0.5}}>🔗</span>
                      )}
                    </div>
                    <div className="relations-panel__node-info">
                      <h4 className="relations-panel__node-name">
                        {node.nombre}
                        {isInCurrentPlano ? (
                          <span style={{fontSize: '12px', color: '#10b981', marginLeft: '8px'}}>
                            (en este plano)
                          </span>
                        ) : (
                          <span style={{fontSize: '12px', color: '#6b7280', marginLeft: '8px'}}>
                            (en otro plano)
                          </span>
                        )}
                      </h4>
                      <div className="relations-panel__node-meta">
                        <span className={`relations-panel__node-type relations-panel__node-type--${node.tipo}`}>
                          {getTypeDisplayName(node.tipo)}
                        </span>
                        <span className="relations-panel__node-location">
                          {node.carrera && `${node.carrera} • `}{node.piso}
                        </span>
                        <span className="relations-panel__node-plano" style={{fontSize: '11px', color: '#6b7280'}}>
                          Plano: {node.planoId || 'N/A'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Botones de acción */}
                    <div className="relations-panel__node-actions">
                      {connections.length > 0 && (
                        <span className="relations-panel__connections-badge">
                          {connections.length} 🔗
                        </span>
                      )}
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
                  </div>

                  {/* Conexiones */}
                  {connections.length > 0 && (
                    <div className="relations-panel__connections">
                      <div className="relations-panel__connections-title">
                        Conexiones ({connections.length})
                      </div>
                      <div className="relations-panel__connection-list">
                        {connections.map((conn, index) => {
                          const isConnectionInCurrentPlano = isNodeInCurrentPlano(conn.node);
                          
                          return (
                            <div 
                              key={index} 
                              className={`relations-panel__connection-item ${
                                isConnectionInCurrentPlano ? '' : 'relations-panel__connection-item--other-plano'
                              }`}
                              onMouseEnter={() => handleConnectionMouseEnter(conn)}
                              onMouseLeave={handleConnectionMouseLeave}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleConnectionClick(conn);
                              }}
                            >
                              <div className="relations-panel__connection-info">
                                <span className="relations-panel__connection-icon">
                                  {conn.direction === 'salida' ? '➡️' : '⬅️'}
                                </span>
                                <span className="relations-panel__connection-node">
                                  {conn.node.nombre}
                                </span>
                                <span className="relations-panel__connection-type">
                                  {getTypeDisplayName(conn.node.tipo)}
                                </span>
                                {isConnectionInCurrentPlano ? (
                                  <span style={{fontSize: '10px', color: '#10b981'}}>📍</span>
                                ) : (
                                  <span style={{fontSize: '10px', color: '#6b7280', opacity: 0.5}}>🔗</span>
                                )}
                              </div>
                              
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
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer con estadísticas */}
      <div className="relations-panel__footer">
        <div className="relations-panel__stats">
          <div className="relations-panel__stat">
            <span className="relations-panel__stat-value">{stats.total}</span>
            <span className="relations-panel__stat-label">Total</span>
          </div>
          <div className="relations-panel__stat">
            <span className="relations-panel__stat-value">{stats.areas}</span>
            <span className="relations-panel__stat-label">Áreas</span>
          </div>
          <div className="relations-panel__stat">
            <span className="relations-panel__stat-value">{stats.puntos}</span>
            <span className="relations-panel__stat-label">Puntos</span>
          </div>
          <div className="relations-panel__stat">
            <span className="relations-panel__stat-value">{stats.escaleras}</span>
            <span className="relations-panel__stat-label">Escaleras</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RelationsPanel;