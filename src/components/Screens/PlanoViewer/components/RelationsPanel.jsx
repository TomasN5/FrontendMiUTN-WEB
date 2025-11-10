// RelationsPanel.jsx - VERSIÓN CON PANEL MÁS ANCHO
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
  onNavigateToNode,
  // 🔥 NUEVA PROP: Función para destacar nodos
  onToggleDestacado
}) => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [activeTab, setActiveTab] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCarrera, setFilterCarrera] = useState('todas');
  const [filterPiso, setFilterPiso] = useState('todos');

  // Obtener todos los nodos de todos los planos
  const todosLosNodos = useMemo(() => {
    const allAreas = [];
    const allPoints = [];
    
    Object.values(todosLosDatos).forEach(planoData => {
      if (planoData.areas) allAreas.push(...planoData.areas);
      if (planoData.points) allPoints.push(...planoData.points);
    });
    
    return [...allAreas, ...allPoints];
  }, [todosLosDatos]);

  // Obtener carreras y pisos únicos para los filtros
  const carrerasUnicas = useMemo(() => {
    const carreras = [...new Set(todosLosNodos.map(nodo => nodo.carrera).filter(Boolean))];
    return ['todas', ...carreras];
  }, [todosLosNodos]);

  const pisosUnicos = useMemo(() => {
    const pisos = [...new Set(todosLosNodos.map(nodo => nodo.piso).filter(Boolean))];
    return ['todos', ...pisos];
  }, [todosLosNodos]);

  // Filtrar nodos según búsqueda y filtros
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

  // Agrupar nodos por tipo
  const nodosPorTipo = useMemo(() => {
    const agrupados = {
      aulas: nodosFiltrados.filter(n => n.tipo === 'aula'),
      departamentos: nodosFiltrados.filter(n => n.tipo === 'departamento'),
      banos: nodosFiltrados.filter(n => n.tipo === 'bano'),
      escaleras: nodosFiltrados.filter(n => n.tipo === 'escalera'),
      pasillos: nodosFiltrados.filter(n => n.tipo === 'pasillo'),
      puntos: nodosFiltrados.filter(n => n.tipo === 'punto'),
      extintores: nodosFiltrados.filter(n => n.tipo === 'extintor'),
      salidas: nodosFiltrados.filter(n => n.tipo === 'salida_emergencia'),
      desfibriladores: nodosFiltrados.filter(n => n.tipo === 'desfibrilador'),
      botiquines: nodosFiltrados.filter(n => n.tipo === 'botiquin'),
      alarmas: nodosFiltrados.filter(n => n.tipo === 'alarma'),
      totems: nodosFiltrados.filter(n => n.tipo === 'totem'),
      areas_genericas: nodosFiltrados.filter(n => n.tipo === 'area_generica')
    };
    
    // Filtrar tipos vacíos
    return Object.fromEntries(
      Object.entries(agrupados).filter(([_, nodos]) => nodos.length > 0)
    );
  }, [nodosFiltrados]);

  // Estadísticas
  const stats = useMemo(() => {
    const isNodeInCurrentPlano = (node) => node.planoId === planoActual?.id;
    
    return {
      total: nodosFiltrados.length,
      enPlanoActual: nodosFiltrados.filter(n => isNodeInCurrentPlano(n)).length,
      enOtrosPlanos: nodosFiltrados.filter(n => !isNodeInCurrentPlano(n)).length,
      destacados: nodosFiltrados.filter(n => n.destacado).length // 🔥 NUEVA ESTADÍSTICA
    };
  }, [nodosFiltrados, planoActual]);

  if (!isVisible) return null;

  // Handler para click en nodo
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
      
      // Activar highlight en el mapa para TODOS los tipos de nodos
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

  // 🔥 NUEVO HANDLER: Toggle destacado
  const handleToggleDestacado = (node) => {
    console.log("⭐ Toggle destacado para:", node.nombre, "Estado actual:", node.destacado);
    if (onToggleDestacado) {
      onToggleDestacado(node.id, !node.destacado);
      
      // Actualizar el estado local del nodo seleccionado si es el mismo
      if (selectedNode && selectedNode.id === node.id) {
        setSelectedNode({
          ...selectedNode,
          destacado: !selectedNode.destacado
        });
      }
    }
  };

  // Encontrar conexiones de un nodo
  const findNodeConnections = (nodeId) => {
    const connections = [];
    const connectionIds = new Set(); // Para evitar duplicados
    
    Object.values(todosLosDatos).forEach(planoData => {
      if (planoData.areas) {
        planoData.areas
          .filter(area => area.tipo === 'pasillo')
          .forEach(pasillo => {
            // Evitar duplicados en conexiones bidireccionales
            const connectionKey = [pasillo.from?.id, pasillo.to?.id].sort().join('-');
            
            if (pasillo.from && pasillo.from.id === nodeId && !connectionIds.has(connectionKey)) {
              connections.push({ 
                node: pasillo.to, 
                connection: pasillo,
                type: 'pasillo',
                direction: 'bidireccional',
                connectionKey: connectionKey
              });
              connectionIds.add(connectionKey);
            }
            
            if (pasillo.to && pasillo.to.id === nodeId && !connectionIds.has(connectionKey)) {
              connections.push({ 
                node: pasillo.from, 
                connection: pasillo,
                type: 'pasillo',
                direction: 'bidireccional',
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
      'departamento': '🏢',
      'bano': '🚻',
      'escalera': '🪜',
      'pasillo': '🛣️',
      'punto': '📍',
      'area_generica': '📦',
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
      'departamento': 'Departamento',
      'area_generica': 'Área Genérica',
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
        } ${
          node.destacado ? 'relations-panel__node-item--destacado' : ''
        }`}
        onClick={() => handleNodeClick(node)}
      >
        <div className="relations-panel__node-icon">
          {getNodeIcon(node.tipo)}
          {node.destacado && (
            <span className="relations-panel__node-destacado-indicator" title="Elemento destacado">
              ⭐
            </span>
          )}
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
            {/* Información específica para elementos especiales */}
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
          {/* 🔥 NUEVO BOTÓN: Destacar */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleDestacado(node);
            }}
            className={`relations-panel__action-button relations-panel__action-button--destacar ${
              node.destacado ? 'relations-panel__action-button--destacado-active' : ''
            }`}
            title={node.destacado ? "Quitar destacado" : "Marcar como destacado"}
          >
            {node.destacado ? '⭐' : '☆'}
          </button>

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

  // Renderizar conexiones del nodo seleccionado
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
                      {conn.direction === 'bidireccional' && (
                        <span className="relations-panel__connection-bidirectional">
                          • 🔄 Bidireccional
                        </span>
                      )}
                    </span>
                  </div>
                </div>
                <div className="relations-panel__connection-actions">
                  {/* 🔥 BOTÓN DESTACAR EN CONEXIONES TAMBIÉN */}
                  <button
                    onClick={() => handleToggleDestacado(conn.node)}
                    className={`relations-panel__action-button relations-panel__action-button--destacar ${
                      conn.node.destacado ? 'relations-panel__action-button--destacado-active' : ''
                    }`}
                    title={conn.node.destacado ? "Quitar destacado" : "Marcar como destacado"}
                  >
                    {conn.node.destacado ? '⭐' : '☆'}
                  </button>

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
        {/* 🔥 NUEVA PESTAÑA: Destacados */}
        <button
          className={`relations-panel__tab ${activeTab === 'destacados' ? 'relations-panel__tab--active' : ''}`}
          onClick={() => setActiveTab('destacados')}
        >
          <span className="relations-panel__tab-icon">⭐</span>
          Destacados ({stats.destacados})
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
          {/* 🔥 NUEVA ESTADÍSTICA: Destacados */}
          <div className="relations-panel__stat-item relations-panel__stat-item--destacados">
            <span className="relations-panel__stat-value">{stats.destacados}</span>
            <span className="relations-panel__stat-label">⭐ Destacados</span>
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
              if (['aulas', 'departamentos', 'banos', 'escaleras', 'pasillos','areas_genericas'].includes(tipo) && nodos.length > 0) {
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

        {/* 🔥 NUEVA PESTAÑA: Destacados */}
        {activeTab === 'destacados' && (
          <div className="relations-panel__section">
            <h3 className="relations-panel__section-title">
              ⭐ Elementos Destacados ({stats.destacados})
            </h3>
            {stats.destacados === 0 ? (
              <div className="relations-panel__empty-state relations-panel__empty-state--destacados">
                <div className="relations-panel__empty-icon">⭐</div>
                <div className="relations-panel__empty-text">
                  No hay elementos destacados
                </div>
                <div className="relations-panel__empty-hint">
                  Usa el botón ☆ en cualquier elemento para marcarlo como destacado
                </div>
              </div>
            ) : (
              <div className="relations-panel__node-list">
                {renderNodeList(nodosFiltrados.filter(node => node.destacado))}
              </div>
            )}
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
                {selectedNode.destacado && (
                  <span className="relations-panel__destacado-badge">⭐ Destacado</span>
                )}
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
              {/* Información específica para elementos especiales */}
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
              {/* 🔥 BOTÓN DESTACAR EN INFORMACIÓN DEL NODO */}
              <button
                onClick={() => handleToggleDestacado(selectedNode)}
                className={`relations-panel__action-button relations-panel__action-button--primary ${
                  selectedNode.destacado ? 'relations-panel__action-button--destacado-active' : ''
                }`}
              >
                {selectedNode.destacado ? '⭐ Quitar Destacado' : '☆ Marcar como Destacado'}
              </button>

              <button
                onClick={() => handleNavigateToNode(selectedNode)}
                className="relations-panel__action-button relations-panel__action-button--secondary"
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
          {/* 🔥 NUEVA ESTADÍSTICA EN FOOTER */}
          <div className="relations-panel__footer-stat relations-panel__footer-stat--destacados">
            <span className="relations-panel__footer-stat-value">{stats.destacados}</span>
            <span className="relations-panel__footer-stat-label">destacados</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RelationsPanel;