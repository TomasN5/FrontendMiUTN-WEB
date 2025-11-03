import React, { useState, useMemo } from 'react';
import './../styles/RelationsPanel.css';

const RelationsPanel = ({
  isVisible,
  onClose,
  areas = [],
  points = [],
  todosLosDatos = {},
  planoActual,
  onNodeClick,
  onNodeLeave,
  highlightedNode,
  connectionLines,
  onDeleteNode,
  onDeleteConnection,
  onNavigateToNode
}) => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [activeTab, setActiveTab] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCarrera, setFilterCarrera] = useState('todas');
  const [filterPiso, setFilterPiso] = useState('todos');

  // Obtener todos los nodos de todos los planos - SIEMPRE se ejecuta
  const todosLosNodos = useMemo(() => {
    const allAreas = [];
    const allPoints = [];
    
    Object.values(todosLosDatos).forEach(planoData => {
      if (planoData.areas) allAreas.push(...planoData.areas);
      if (planoData.points) allPoints.push(...planoData.points);
    });
    
    return [...allAreas, ...allPoints];
  }, [todosLosDatos]);

  // Obtener carreras y pisos únicos para los filtros - SIEMPRE se ejecuta
  const carrerasUnicas = useMemo(() => {
    const carreras = [...new Set(todosLosNodos.map(nodo => nodo.carrera).filter(Boolean))];
    return ['todas', ...carreras];
  }, [todosLosNodos]);

  const pisosUnicos = useMemo(() => {
    const pisos = [...new Set(todosLosNodos.map(nodo => nodo.piso).filter(Boolean))];
    return ['todos', ...pisos];
  }, [todosLosNodos]);

  // Filtrar nodos según búsqueda y filtros - SIEMPRE se ejecuta
  const nodosFiltrados = useMemo(() => {
    return todosLosNodos.filter(nodo => {
      const coincideBusqueda = !searchTerm || 
        nodo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nodo.tipo.toLowerCase().includes(searchTerm.toLowerCase());
      
      const coincideCarrera = filterCarrera === 'todas' || nodo.carrera === filterCarrera;
      const coincidePiso = filterPiso === 'todos' || nodo.piso === filterPiso;
      
      return coincideBusqueda && coincideCarrera && coincidePiso;
    });
  }, [todosLosNodos, searchTerm, filterCarrera, filterPiso]);

  // Agrupar nodos por tipo - SIEMPRE se ejecuta
  const nodosPorTipo = useMemo(() => {
    const agrupados = {
      aulas: nodosFiltrados.filter(n => n.tipo === 'aula'),
      halls: nodosFiltrados.filter(n => n.tipo === 'hall'),
      banos: nodosFiltrados.filter(n => n.tipo === 'bano'),
      escaleras: nodosFiltrados.filter(n => n.tipo === 'escalera'),
      pasillos: nodosFiltrados.filter(n => n.tipo === 'pasillo'),
      puntos: nodosFiltrados.filter(n => n.tipo === 'punto'),
      extintores: nodosFiltrados.filter(n => n.tipo === 'extintor'),
      salidas: nodosFiltrados.filter(n => n.tipo === 'salida_emergencia'),
      desfibriladores: nodosFiltrados.filter(n => n.tipo === 'desfibrilador'),
      botiquines: nodosFiltrados.filter(n => n.tipo === 'botiquin'),
      alarmas: nodosFiltrados.filter(n => n.tipo === 'alarma'),
      totems: nodosFiltrados.filter(n => n.tipo === 'totem')
    };
    
    // Filtrar tipos vacíos
    return Object.fromEntries(
      Object.entries(agrupados).filter(([_, nodos]) => nodos.length > 0)
    );
  }, [nodosFiltrados]);

  // Estadísticas - SIEMPRE se ejecuta
  const stats = useMemo(() => {
    const isNodeInCurrentPlano = (node) => node.planoId === planoActual?.id;
    
    return {
      total: nodosFiltrados.length,
      enPlanoActual: nodosFiltrados.filter(n => isNodeInCurrentPlano(n)).length,
      enOtrosPlanos: nodosFiltrados.filter(n => !isNodeInCurrentPlano(n)).length
    };
  }, [nodosFiltrados, planoActual]);

  if (!isVisible) return null;

  // Handler para click en nodo - AHORA INCLUYE TODOS LOS TIPOS
  const handleNodeClick = (node) => {
    console.log("🎯 Click en nodo desde RelationsPanel:", node.nombre, "Tipo:", node.tipo);
    
    // Si ya está seleccionado, deseleccionar
    if (selectedNode && selectedNode.id === node.id) {
      setSelectedNode(null);
      if (onNodeLeave) {
        onNodeLeave();
      }
    } else {
      // Seleccionar nuevo nodo
      setSelectedNode(node);
      
      // 🔥 ACTUALIZADO: Activar highlight en el mapa para TODOS los tipos de nodos
      // Incluye: botiquines, totems, desfibriladores, extintores, alarmas, salidas, etc.
      if (onNodeClick) {
        // Si está en el plano actual, hacer highlight inmediato
        if (node.planoId === planoActual?.id) {
          console.log("✅ Nodo en plano actual - Activando highlight");
          onNodeClick(node);
        } else {
          console.log("🔄 Nodo no está en plano actual - Navegando primero");
          // Si no está en el plano actual, navegar primero y luego hacer highlight
          if (onNavigateToNode) {
            onNavigateToNode(node);
            // El highlight se activará automáticamente después de la navegación
          }
        }
      }
    }
  };

  // Handler para limpiar selección
  const handleClearSelection = () => {
    console.log("🧹 Limpiando selección");
    setSelectedNode(null);
    if (onNodeLeave) {
      onNodeLeave();
    }
  };

  // Handler para navegar al nodo
  const handleNavigateToNode = (node) => {
    console.log("🧭 Navegando a nodo:", node.nombre);
    if (onNavigateToNode) {
      onNavigateToNode(node);
    }
  };

  // Encontrar conexiones de un nodo - CORREGIDO para evitar duplicados
  const findNodeConnections = (nodeId) => {
    const connections = [];
    const connectionIds = new Set(); // Para evitar duplicados
    
    Object.values(todosLosDatos).forEach(planoData => {
      if (planoData.areas) {
        planoData.areas
          .filter(area => area.tipo === 'pasillo')
          .forEach(pasillo => {
            // 🔥 CORREGIDO: Evitar duplicados en conexiones bidireccionales
            const connectionKey = [pasillo.from?.id, pasillo.to?.id].sort().join('-');
            
            if (pasillo.from && pasillo.from.id === nodeId && !connectionIds.has(connectionKey)) {
              connections.push({ 
                node: pasillo.to, 
                connection: pasillo,
                type: 'pasillo',
                direction: 'bidireccional', // 🔥 Cambiado a bidireccional
                connectionKey: connectionKey
              });
              connectionIds.add(connectionKey);
            }
            
            if (pasillo.to && pasillo.to.id === nodeId && !connectionIds.has(connectionKey)) {
              connections.push({ 
                node: pasillo.from, 
                connection: pasillo,
                type: 'pasillo',
                direction: 'bidireccional', // 🔥 Cambiado a bidireccional
                connectionKey: connectionKey
              });
              connectionIds.add(connectionKey);
            }
          });
      }
    });
    
    console.log(`🔗 Conexiones encontradas para ${nodeId}:`, connections.length, "sin duplicados");
    return connections;
  };

  const getNodeIcon = (tipo) => {
    const iconos = {
      'aula': '🏫',
      'hall': '🏢',
      'bano': '🚻',
      'escalera': '🪜',
      'pasillo': '🛣️',
      'punto': '📍',
      'extintor': '🧯',
      'salida_emergencia': '🚪',
      'desfibrilador': '💓',
      'botiquin': '🩹',
      'alarma': '🚨',
      'totem': '📟'
    };
    return iconos[tipo] || '📁';
  };

  const getTipoNombre = (tipo) => {
    const nombres = {
      'aula': 'Aula',
      'hall': 'Hall',
      'bano': 'Baño',
      'escalera': 'Escalera',
      'pasillo': 'Pasillo',
      'punto': 'Punto',
      'extintor': 'Matafuegos',
      'salida_emergencia': 'Salida Emergencia',
      'desfibrilador': 'Desfibrilador',
      'botiquin': 'Botiquín',
      'alarma': 'Alarma',
      'totem': 'Tótem'
    };
    return nombres[tipo] || tipo;
  };

  // Verificar si un nodo está en el plano actual
  const isNodeInCurrentPlano = (node) => {
    return node.planoId === planoActual?.id;
  };

  // Renderizar lista de nodos
  const renderNodeList = (nodos) => {
    if (nodos.length === 0) {
      return (
        <div className="relations-panel__empty-state">
          No se encontraron nodos con los filtros actuales
        </div>
      );
    }

    return nodos.map(node => (
      <div
        key={node.id}
        className={`relations-panel__node-item ${
          selectedNode && selectedNode.id === node.id ? 'relations-panel__node-item--selected' : ''
        } ${
          highlightedNode && highlightedNode.id === node.id ? 'relations-panel__node-item--highlighted' : ''
        } ${
          !isNodeInCurrentPlano(node) ? 'relations-panel__node-item--other-floor' : ''
        }`}
        onClick={() => handleNodeClick(node)}
      >
        <div className="relations-panel__node-icon">
          {getNodeIcon(node.tipo)}
          {!isNodeInCurrentPlano(node) && (
            <span className="relations-panel__node-floor-indicator" title={`En ${node.piso}`}>
              🏢
            </span>
          )}
        </div>
        <div className="relations-panel__node-info">
          <div className="relations-panel__node-name">
            {node.nombre}
            {!isNodeInCurrentPlano(node) && (
              <span className="relations-panel__node-floor-badge">
                {node.piso}
              </span>
            )}
          </div>
          <div className="relations-panel__node-details">
            {getTipoNombre(node.tipo)} • {node.carrera} • {node.piso}
            {node.tipo === 'escalera' && node.destinos && (
              <span className="relations-panel__node-destinos">
                • {node.destinos.length} destinos
              </span>
            )}
            {/* 🔥 NUEVO: Mostrar información específica para elementos especiales */}
            {node.tipo === 'botiquin' && (
              <span className="relations-panel__node-special-info">
                • 🩹 Elemento de primeros auxilios
              </span>
            )}
            {node.tipo === 'totem' && (
              <span className="relations-panel__node-special-info">
                • 📟 Punto de información
              </span>
            )}
            {node.tipo === 'desfibrilador' && (
              <span className="relations-panel__node-special-info">
                • 💓 DEA - Desfibrilador
              </span>
            )}
            {node.tipo === 'extintor' && (
              <span className="relations-panel__node-special-info">
                • 🧯 Equipo contra incendios
              </span>
            )}
            {node.tipo === 'alarma' && (
              <span className="relations-panel__node-special-info">
                • 🚨 Sistema de emergencia
              </span>
            )}
            {node.tipo === 'salida_emergencia' && (
              <span className="relations-panel__node-special-info">
                • 🚪 Vía de evacuación
              </span>
            )}
          </div>
        </div>
        <div className="relations-panel__node-actions">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNavigateToNode(node);
            }}
            className="relations-panel__action-button relations-panel__action-button--navigate"
            title="Navegar a este nodo"
          >
            🧭
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(`¿Eliminar ${node.nombre}?`)) {
                onDeleteNode(node.id);
              }
            }}
            className="relations-panel__action-button relations-panel__action-button--delete"
            title="Eliminar nodo"
          >
            🗑️
          </button>
        </div>
      </div>
    ));
  };

  // Renderizar conexiones del nodo seleccionado - MEJORADO
  const renderConnections = () => {
    if (!selectedNode) return null;

    const connections = findNodeConnections(selectedNode.id);
    
    return (
      <div className="relations-panel__connections">
        <div className="relations-panel__connections-header">
          <h4 className="relations-panel__connections-title">
            🔗 Conexiones de {selectedNode.nombre}
          </h4>
          <span className="relations-panel__connections-count">
            {connections.length} conexiones
          </span>
        </div>
        {connections.length === 0 ? (
          <div className="relations-panel__no-connections">
            <div className="relations-panel__no-connections-icon">🔗</div>
            <div className="relations-panel__no-connections-text">
              Este nodo no tiene conexiones
            </div>
          </div>
        ) : (
          <div className="relations-panel__connections-list">
            {connections.map((conn, index) => (
              <div key={conn.connectionKey || index} className="relations-panel__connection-item">
                <div className="relations-panel__connection-info">
                  <span className="relations-panel__connection-icon">
                    {getNodeIcon(conn.node.tipo)}
                  </span>
                  <div className="relations-panel__connection-details">
                    <span className="relations-panel__connection-name">
                      {conn.node.nombre}
                    </span>
                    <span className="relations-panel__connection-meta">
                      {getTipoNombre(conn.node.tipo)} • {conn.node.piso}
                      {/* 🔥 NUEVO: Mostrar que la conexión es bidireccional */}
                      {conn.direction === 'bidireccional' && (
                        <span className="relations-panel__connection-bidirectional">
                          • 🔄 Bidireccional
                        </span>
                      )}
                    </span>
                  </div>
                </div>
                <div className="relations-panel__connection-actions">
                  <button
                    onClick={() => handleNavigateToNode(conn.node)}
                    className="relations-panel__action-button relations-panel__action-button--navigate"
                    title="Navegar a este nodo"
                  >
                    🧭
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('¿Eliminar esta conexión bidireccional?')) {
                        onDeleteConnection(conn.connection.id);
                      }
                    }}
                    className="relations-panel__action-button relations-panel__action-button--delete"
                    title="Eliminar conexión"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relations-panel">
      <div className="relations-panel__header">
        <div className="relations-panel__header-content">
          <h2 className="relations-panel__title">
            <span className="relations-panel__title-icon">🔗</span>
            Panel de Relaciones
          </h2>
          <button
            onClick={onClose}
            className="relations-panel__close-button"
            title="Cerrar panel"
          >
            <span className="relations-panel__close-icon">✕</span>
          </button>
        </div>
        
        {/* Barra de búsqueda */}
        <div className="relations-panel__search">
          <div className="relations-panel__search-icon">🔍</div>
          <input
            type="text"
            placeholder="Buscar nodos por nombre o tipo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="relations-panel__search-input"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="relations-panel__search-clear"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filtros */}
        <div className="relations-panel__filters">
          <div className="relations-panel__filter-group">
            <label className="relations-panel__filter-label">Carrera:</label>
            <select
              value={filterCarrera}
              onChange={(e) => setFilterCarrera(e.target.value)}
              className="relations-panel__filter-select"
            >
              {carrerasUnicas.map(carrera => (
                <option key={carrera} value={carrera}>
                  {carrera === 'todas' ? 'Todas las carreras' : carrera}
                </option>
              ))}
            </select>
          </div>
          
          <div className="relations-panel__filter-group">
            <label className="relations-panel__filter-label">Piso:</label>
            <select
              value={filterPiso}
              onChange={(e) => setFilterPiso(e.target.value)}
              className="relations-panel__filter-select"
            >
              {pisosUnicos.map(piso => (
                <option key={piso} value={piso}>
                  {piso === 'todos' ? 'Todos los pisos' : piso}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="relations-panel__tabs">
        <button
          className={`relations-panel__tab ${activeTab === 'todos' ? 'relations-panel__tab--active' : ''}`}
          onClick={() => setActiveTab('todos')}
        >
          <span className="relations-panel__tab-icon">📋</span>
          Todos ({stats.total})
        </button>
        <button
          className={`relations-panel__tab ${activeTab === 'areas' ? 'relations-panel__tab--active' : ''}`}
          onClick={() => setActiveTab('areas')}
        >
          <span className="relations-panel__tab-icon">🏢</span>
          Áreas
        </button>
        <button
          className={`relations-panel__tab ${activeTab === 'puntos' ? 'relations-panel__tab--active' : ''}`}
          onClick={() => setActiveTab('puntos')}
        >
          <span className="relations-panel__tab-icon">📍</span>
          Puntos
        </button>
        <button
          className={`relations-panel__tab ${activeTab === 'especiales' ? 'relations-panel__tab--active' : ''}`}
          onClick={() => setActiveTab('especiales')}
        >
          <span className="relations-panel__tab-icon">🛡️</span>
          Especiales
        </button>
      </div>

      <div className="relations-panel__content">
        {/* Estadísticas rápidas */}
        <div className="relations-panel__quick-stats">
          <div className="relations-panel__stat-item">
            <span className="relations-panel__stat-value">{stats.enPlanoActual}</span>
            <span className="relations-panel__stat-label">En este plano</span>
          </div>
          <div className="relations-panel__stat-item">
            <span className="relations-panel__stat-value">{stats.enOtrosPlanos}</span>
            <span className="relations-panel__stat-label">En otros planos</span>
          </div>
        </div>

        {activeTab === 'todos' && (
          <div className="relations-panel__section">
            <h3 className="relations-panel__section-title">
              Todos los Nodos ({stats.total})
            </h3>
            <div className="relations-panel__node-list">
              {renderNodeList(nodosFiltrados)}
            </div>
          </div>
        )}

        {activeTab === 'areas' && (
          <div className="relations-panel__section">
            <h3 className="relations-panel__section-title">Áreas</h3>
            {Object.entries(nodosPorTipo).map(([tipo, nodos]) => {
              if (['aulas', 'halls', 'banos', 'escaleras', 'pasillos'].includes(tipo) && nodos.length > 0) {
                return (
                  <div key={tipo} className="relations-panel__category">
                    <div className="relations-panel__category-header">
                      <h4 className="relations-panel__category-title">
                        {getTipoNombre(tipo)}
                      </h4>
                      <span className="relations-panel__category-count">
                        {nodos.length}
                      </span>
                    </div>
                    <div className="relations-panel__node-list">
                      {renderNodeList(nodos)}
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>
        )}

        {activeTab === 'puntos' && (
          <div className="relations-panel__section">
            <h3 className="relations-panel__section-title">Puntos</h3>
            {Object.entries(nodosPorTipo).map(([tipo, nodos]) => {
              if (['puntos'].includes(tipo) && nodos.length > 0) {
                return (
                  <div key={tipo} className="relations-panel__category">
                    <div className="relations-panel__category-header">
                      <h4 className="relations-panel__category-title">
                        {getTipoNombre(tipo)}
                      </h4>
                      <span className="relations-panel__category-count">
                        {nodos.length}
                      </span>
                    </div>
                    <div className="relations-panel__node-list">
                      {renderNodeList(nodos)}
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>
        )}

        {/* 🔥 NUEVA PESTAÑA: Elementos Especiales */}
        {activeTab === 'especiales' && (
          <div className="relations-panel__section">
            <h3 className="relations-panel__section-title">Elementos Especiales</h3>
            {Object.entries(nodosPorTipo).map(([tipo, nodos]) => {
              if (['extintores', 'salidas', 'desfibriladores', 'botiquines', 'alarmas', 'totems'].includes(tipo) && nodos.length > 0) {
                return (
                  <div key={tipo} className="relations-panel__category">
                    <div className="relations-panel__category-header">
                      <h4 className="relations-panel__category-title">
                        {getTipoNombre(tipo)}
                      </h4>
                      <span className="relations-panel__category-count">
                        {nodos.length}
                      </span>
                    </div>
                    <div className="relations-panel__node-list">
                      {renderNodeList(nodos)}
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>
        )}

        {/* Conexiones del nodo seleccionado */}
        {selectedNode && renderConnections()}

        {/* Información del nodo seleccionado */}
        {selectedNode && (
          <div className="relations-panel__selected-info">
            <div className="relations-panel__selected-header">
              <h3 className="relations-panel__selected-title">
                <span className="relations-panel__selected-icon">🎯</span>
                Nodo Seleccionado
              </h3>
              <button
                onClick={handleClearSelection}
                className="relations-panel__clear-button"
                title="Limpiar selección"
              >
                ✕
              </button>
            </div>
            <div className="relations-panel__selected-details">
              <div className="relations-panel__detail-row">
                <strong>Nombre:</strong> {selectedNode.nombre}
              </div>
              <div className="relations-panel__detail-row">
                <strong>Tipo:</strong> {getTipoNombre(selectedNode.tipo)}
              </div>
              <div className="relations-panel__detail-row">
                <strong>Ubicación:</strong> {selectedNode.carrera} • {selectedNode.piso}
              </div>
              <div className="relations-panel__detail-row">
                <strong>Plano:</strong> {selectedNode.planoId}
              </div>
              {selectedNode.tipo === 'escalera' && selectedNode.destinos && (
                <div className="relations-panel__detail-row">
                  <strong>Destinos:</strong> {selectedNode.destinos.length} conexiones
                </div>
              )}
              {/* 🔥 NUEVO: Información específica para elementos especiales */}
              {['botiquin', 'totem', 'desfibrilador', 'extintor', 'alarma', 'salida_emergencia'].includes(selectedNode.tipo) && (
                <div className="relations-panel__detail-row relations-panel__detail-row--special">
                  <strong>💡 Tipo:</strong> Elemento de seguridad y emergencia
                </div>
              )}
              {!isNodeInCurrentPlano(selectedNode) && (
                <div className="relations-panel__detail-row relations-panel__detail-row--warning">
                  <strong>⚠️ No está en este plano:</strong> Para ver este nodo, navega a su plano
                </div>
              )}
            </div>
            <div className="relations-panel__selected-actions">
              <button
                onClick={() => handleNavigateToNode(selectedNode)}
                className="relations-panel__action-button relations-panel__action-button--primary"
              >
                🧭 Navegar a este nodo
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="relations-panel__footer">
        <div className="relations-panel__footer-stats">
          <div className="relations-panel__footer-stat">
            <span className="relations-panel__footer-stat-value">{stats.total}</span>
            <span className="relations-panel__footer-stat-label">nodos totales</span>
          </div>
          <div className="relations-panel__footer-stat">
            <span className="relations-panel__footer-stat-value">
              {Object.keys(nodosPorTipo).length}
            </span>
            <span className="relations-panel__footer-stat-label">categorías</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RelationsPanel;