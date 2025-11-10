// ControlPanel.jsx - VERSIÓN COMPLETA CON DESTACADOS
import React, { useState } from 'react';
import { AREA_TYPES, FEATURE_FLAGS } from '../utils/constants';
import './../styles/ControlPanel.css';

const ControlPanel = ({
  modoEdicion,
  tipoActual,
  nombreArea,
  puntosTemporales,
  areas = [],
  points = [],
  origen,
  destino,
  rutaActual = [],
  zoomScale,
  isSnapEnabled,
  showDebugEdges,
  edgesCount,
  isRouteAnimating,
  selectedNode,
  floorTransitions = [],
  todosLosDatos = {},
  carreraActual,
  planoActual,
  planosCarreraActual = [],
  infoPlanoActual,
  carrerasDisponibles = [],
  onSavePasillo,
  onToggleEdit,
  onChangeType,
  onChangeName,
  onSaveArea,
  onSavePoints,
  onUndo,
  onCancel,
  onCalculateRoute,
  onOriginChange,
  onDestinationChange,
  onToggleSnap,
  onToggleDebugEdges,
  onStopAnimation,
  onCambiarPlano,
  onCambiarCarrera,
  onAvanzarPlano,
  onRetrocederPlano,
  onToggleRelationsPanel,
  onClearRoute,
  onExportAllData,
  onExportByType,
  onDescargarJSON,
  onCopiarJSON,
  onSimularGuardado,
  hideNames,
  onToggleHideNames,
  // 🔥 NUEVAS PROPS PARA DESTACADOS
  esDestacado = false,
  onToggleDestacado
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('navegacion');

  const togglePanel = () => {
    setIsCollapsed(!isCollapsed);
  };

  const panelClass = `control-panel ${
    isCollapsed ? 'control-panel--collapsed' : 'control-panel--expanded'
  }`;

  const contentClass = `control-panel__content ${
    isCollapsed ? 'control-panel__content--hidden' : 'control-panel__content--visible'
  }`;

  const collapsedInfoClass = `control-panel__collapsed-info ${
    isCollapsed ? 'control-panel__collapsed-info--visible' : 'control-panel__collapsed-info--hidden'
  }`;

  const getAllNodes = () => {
    const allAreas = [];
    const allPoints = [];
    
    Object.values(todosLosDatos).forEach(planoData => {
      if (planoData.areas) allAreas.push(...planoData.areas);
      if (planoData.points) allPoints.push(...planoData.points);
    });
    
    return [...allAreas, ...allPoints];
  };

  const todosLosNodos = getAllNodes();

  const getPointTypeName = (tipo) => {
    const nombres = {
      [AREA_TYPES.PUNTO]: 'Punto',
      [AREA_TYPES.EXTINTOR]: 'Matafuegos',
      [AREA_TYPES.SALIDA_EMERGENCIA]: 'Salida Emergencia',
      [AREA_TYPES.DESFIBRILADOR]: 'Desfibrilador',
      [AREA_TYPES.BOTIQUIN]: 'Botiquín',
      [AREA_TYPES.ALARMA]: 'Alarma',
      [AREA_TYPES.TOTEM]: 'Totem',
      [AREA_TYPES.AREA_GENERICA]: 'Área Genérica'
    };
    return nombres[tipo] || 'Elemento';
  };

  const stats = {
    totalNodos: todosLosNodos.length,
    areas: todosLosNodos.filter(n => n.tipo !== AREA_TYPES.PUNTO && n.tipo !== AREA_TYPES.PASILLO).length,
    puntos: todosLosNodos.filter(n => n.tipo === AREA_TYPES.PUNTO).length,
    escaleras: todosLosNodos.filter(n => n.tipo === AREA_TYPES.ESCALERA).length,
    pasillos: todosLosNodos.filter(n => n.tipo === AREA_TYPES.PASILLO).length,
    departamentos: todosLosNodos.filter(n => n.tipo === AREA_TYPES.DEPARTAMENTO).length,
    areasGenericas: todosLosNodos.filter(n => n.tipo === AREA_TYPES.AREA_GENERICA).length,
    // 🔥 NUEVA ESTADÍSTICA: Elementos destacados
    destacados: todosLosNodos.filter(n => n.destacado).length
  };

  return (
    <div className={panelClass}>
      <button
        onClick={togglePanel}
        className="control-panel__toggle-button"
        title={isCollapsed ? "Expandir panel" : "Contraer panel"}
      >
        {isCollapsed ? "→" : "←"}
      </button>

      <div className={contentClass}>
        <div className="control-panel__header">
          <h3 className="control-panel__title">
            🗺️ Panel de Control
          </h3>
          
          <div className="control-panel__tabs">
            <button
              className={`control-panel__tab ${activeTab === 'navegacion' ? 'control-panel__tab--active' : ''}`}
              onClick={() => setActiveTab('navegacion')}
            >
              🧭 Navegación
            </button>
            <button
              className={`control-panel__tab ${activeTab === 'edicion' ? 'control-panel__tab--active' : ''}`}
              onClick={() => setActiveTab('edicion')}
            >
              ✏️ Edición
            </button>
            <button
              className={`control-panel__tab ${activeTab === 'exportar' ? 'control-panel__tab--active' : ''}`}
              onClick={() => setActiveTab('exportar')}
            >
              💾 Exportar
            </button>
          </div>
        </div>

        {activeTab === 'navegacion' && (
          <div className="control-panel__tab-content">
            {/* Contenido de navegación (sin cambios) */}
            <div className="control-panel__section">
              <div className="control-panel__section-header">
                <span className="control-panel__section-icon">🏢</span>
                <h4 className="control-panel__section-title">Navegación entre Planos</h4>
              </div>
              
              <div className="control-panel__input-group">
                <label className="control-panel__label">Carrera:</label>
                <select
                  value={carreraActual}
                  onChange={(e) => onCambiarCarrera && onCambiarCarrera(e.target.value)}
                  className="control-panel__select"
                >
                  <option value="general">Planta Principal</option>
                  {Array.isArray(carrerasDisponibles) && carrerasDisponibles.map(carrera => (
                    <option key={carrera} value={carrera}>
                      {carrera.charAt(0).toUpperCase() + carrera.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {Array.isArray(planosCarreraActual) && planosCarreraActual.length > 0 && (
                <div className="control-panel__plano-selector-container">
                  <label className="control-panel__label">Plano Actual:</label>
                  <div className="control-panel__plano-selector">
                    <button
                      onClick={onRetrocederPlano}
                      disabled={!infoPlanoActual?.tieneAnterior}
                      className="control-panel__plano-nav control-panel__plano-nav--prev"
                      title="Plano anterior"
                    >
                      ◀
                    </button>
                    
                    <select
                      value={planoActual?.id || ''}
                      onChange={(e) => onCambiarPlano && onCambiarPlano(e.target.value)}
                      className="control-panel__select"
                    >
                      {planosCarreraActual.map(plano => (
                        <option key={plano.id} value={plano.id}>
                          {plano.nombre}
                        </option>
                      ))}
                    </select>
                    
                    <button
                      onClick={onAvanzarPlano}
                      disabled={!infoPlanoActual?.tieneSiguiente}
                      className="control-panel__plano-nav control-panel__plano-nav--next"
                      title="Siguiente plano"
                    >
                      ▶
                    </button>
                  </div>
                  
                  {infoPlanoActual && (
                    <div className="control-panel__plano-info">
                      Plano {infoPlanoActual.numero} de {infoPlanoActual.total}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="control-panel__section">
              <div className="control-panel__section-header">
                <span className="control-panel__section-icon">🌍</span>
                <h4 className="control-panel__section-title">Navegación GPS</h4>
              </div>

              <div className="control-panel__input-group">
                <label className="control-panel__label">Origen:</label>
                <select
                  value={origen || ''}
                  onChange={(e) => onOriginChange && onOriginChange(e.target.value)}
                  className="control-panel__select"
                >
                  <option value="">Seleccionar origen</option>
                  {todosLosNodos
                    .filter(node => 
                      node.tipo !== 'pasillo' && 
                      node.tipo !== 'punto'
                    )
                    .map(node => (
                      <option key={node.id} value={node.id}>
                        {node.nombre} ({node.carrera} {node.piso})
                      </option>
                    ))
                  }
                </select>
              </div>

              <div className="control-panel__input-group">
                <label className="control-panel__label">Destino:</label>
                <select
                  value={destino || ''}
                  onChange={(e) => onDestinationChange && onDestinationChange(e.target.value)}
                  className="control-panel__select"
                >
                  <option value="">Seleccionar destino</option>
                  {todosLosNodos
                    .filter(node => 
                      node.tipo !== 'pasillo' && 
                      node.tipo !== 'punto'
                    )
                    .map(node => (
                      <option key={node.id} value={node.id}>
                        {node.nombre} ({node.carrera} {node.piso})
                      </option>
                    ))
                  }
                </select>
              </div>

              <div className="control-panel__button-group--vertical">
                <button
                  onClick={onCalculateRoute}
                  disabled={!origen || !destino}
                  className={`control-panel__button control-panel__button--primary ${
                    origen && destino ? '' : 'control-panel__button--disabled'
                  }`}
                >
                  🚀 Calcular Ruta
                </button>

                <button
                  onClick={onClearRoute}
                  disabled={!origen && !destino && rutaActual.length === 0}
                  className={`control-panel__button control-panel__button--secondary ${
                    (origen || destino || rutaActual.length > 0) ? '' : 'control-panel__button--disabled'
                  }`}
                >
                  🗑️ Limpiar
                </button>

                {isRouteAnimating && (
                  <button
                    onClick={onStopAnimation}
                    className="control-panel__button control-panel__button--danger"
                  >
                    ⏹️ Detener Animación
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'edicion' && (
          <div className="control-panel__tab-content">
            {!modoEdicion ? (
              <div className="control-panel__section control-panel__section--edit-activation">
                <div className="control-panel__edit-activation-card">
                  <div className="control-panel__edit-icon">✏️</div>
                  <h4 className="control-panel__edit-title">Modo Edición</h4>
                  <p className="control-panel__edit-description">
                    Activa el modo edición para agregar áreas, puntos y pasillos al mapa
                  </p>
                  <button
                    onClick={onToggleEdit}
                    className="control-panel__button control-panel__button--primary control-panel__button--large"
                  >
                    Activar Edición
                  </button>
                </div>
              </div>
            ) : (
              <div className="control-panel__section control-panel__section--edit-active">
                <div className="control-panel__edit-header">
                  <span className="control-panel__edit-status">✏️ Editando</span>
                  <button
                    onClick={onCancel}
                    className="control-panel__button control-panel__button--danger control-panel__button--small"
                  >
                    ❌ Salir
                  </button>
                </div>
                           
                <div className="control-panel__input-group">
                  <label className="control-panel__label">Tipo de Elemento:</label>
                  <select
                    value={tipoActual}
                    onChange={(e) => onChangeType && onChangeType(e.target.value)}
                    className="control-panel__select"
                  >
                    <optgroup label="Áreas">
                      <option value={AREA_TYPES.AULA}>🏫 Aula</option>
                      <option value={AREA_TYPES.DEPARTAMENTO}>🏢 Departamento</option>
                      <option value={AREA_TYPES.BANO}>🚻 Baño</option>
                      <option value={AREA_TYPES.ESCALERA}>🪜 Escalera</option>
                      <option value={AREA_TYPES.PASILLO}>🛣️ Pasillo</option>
                      <option value={AREA_TYPES.AREA_GENERICA}>📦 Área Genérica</option>
                    </optgroup>
                    <optgroup label="Puntos y Elementos">
                      <option value={AREA_TYPES.PUNTO}>📍 Punto</option>
                      <option value={AREA_TYPES.EXTINTOR}>🧯 Matafuegos</option>
                      <option value={AREA_TYPES.SALIDA_EMERGENCIA}>🚪 Salida Emergencia</option>
                      <option value={AREA_TYPES.DESFIBRILADOR}>💓 Desfibrilador</option>
                      <option value={AREA_TYPES.BOTIQUIN}>🩹 Botiquín</option>
                      <option value={AREA_TYPES.ALARMA}>🚨 Alarma</option>
                      <option value={AREA_TYPES.TOTEM}>📟 Tótem</option>
                    </optgroup>
                  </select>
                </div>

                <div className="control-panel__input-group">
                  <label className="control-panel__label">Nombre:</label>
                  <input
                    type="text"
                    value={nombreArea || ''}
                    onChange={(e) => onChangeName && onChangeName(e.target.value)}
                    placeholder="Nombre del elemento..."
                    className="control-panel__input"
                  />
                </div>

                {/* 🔥 NUEVO: Checkbox para marcar como destacado */}
                <div className="control-panel__input-group control-panel__input-group--checkbox">
                  <label className="control-panel__checkbox-label control-panel__checkbox-label--destacado">
                    <input
                      type="checkbox"
                      checked={esDestacado}
                      onChange={(e) => onToggleDestacado && onToggleDestacado(e.target.checked)}
                      className="control-panel__checkbox"
                    />
                    <span className="control-panel__checkbox-custom control-panel__checkbox-custom--destacado">
                      {esDestacado ? '⭐' : '☆'}
                    </span>
                    <span className="control-panel__checkbox-text">
                      Marcar como <strong>Destacado</strong>
                    </span>
                  </label>
                  <div className="control-panel__checkbox-hint">
                    Los elementos destacados se muestran con un efecto especial en el mapa
                  </div>
                </div>

                <div className="control-panel__action-buttons">
                  {tipoActual === AREA_TYPES.PUNTO || 
                  tipoActual === AREA_TYPES.EXTINTOR ||
                  tipoActual === AREA_TYPES.SALIDA_EMERGENCIA ||
                  tipoActual === AREA_TYPES.DESFIBRILADOR ||
                  tipoActual === AREA_TYPES.BOTIQUIN ||
                  tipoActual === AREA_TYPES.TOTEM ||
                  tipoActual === AREA_TYPES.ALARMA ? (
                    <button
                      onClick={onSavePoints}
                      disabled={!puntosTemporales || puntosTemporales.length === 0}
                      className={`control-panel__button control-panel__button--success ${
                        puntosTemporales?.length > 0 ? '' : 'control-panel__button--disabled'
                      }`}
                    >
                      {esDestacado ? '⭐ ' : ''}💾 Guardar {getPointTypeName(tipoActual)}
                      {esDestacado ? ' Destacado' : ''}
                    </button>
                  ) : tipoActual === AREA_TYPES.PASILLO ? (
                    <button
                      onClick={onSavePasillo}
                      disabled={!selectedNode}
                      className={`control-panel__button control-panel__button--warning ${
                        selectedNode ? '' : 'control-panel__button--disabled'
                      }`}
                    >
                      🔗 {selectedNode ? `Conectar ${selectedNode.nombre}` : 'Selecciona un nodo'}
                    </button>
                  ) : (
                    <button
                      onClick={onSaveArea}
                      disabled={!puntosTemporales || puntosTemporales.length < 3}
                      className={`control-panel__button control-panel__button--success ${
                        puntosTemporales?.length >= 3 ? '' : 'control-panel__button--disabled'
                      }`}
                    >
                      {esDestacado ? '⭐ ' : ''}💾 Guardar Área
                      {esDestacado ? ' Destacada' : ''}
                    </button>
                  )}
                  
                  <button
                    onClick={onUndo}
                    disabled={!puntosTemporales || puntosTemporales.length === 0}
                    className={`control-panel__button control-panel__button--icon ${
                      puntosTemporales?.length > 0 ? '' : 'control-panel__button--disabled'
                    }`}
                    title="Deshacer último punto"
                  >
                    ↩️
                  </button>
                </div>

                <div className="control-panel__section">
                  <div className="control-panel__section-header">
                    <span className="control-panel__section-icon">⚙️</span>
                    <h4 className="control-panel__section-title">Herramientas</h4>
                  </div>
                  <div className="control-panel__section">
                    <label className="control-panel__checkbox-label">
                      <input
                        type="checkbox"
                        checked={hideNames}
                        onChange={(e) => onToggleHideNames && onToggleHideNames(e.target.checked)}
                        className="control-panel__checkbox"
                      />
                      <span className="control-panel__section-icon">👁️</span>
                      <h4 className="control-panel__section-title">Ocultar Nombres</h4>
                    </label>
                  </div>
                  <div className="control-panel__tools-grid">
                    <button
                      onClick={onToggleRelationsPanel}
                      className="control-panel__tool-button"
                      title="Ver relaciones entre nodos"
                    >
                      <span className="control-panel__tool-icon">🔗</span>
                      <span className="control-panel__tool-label">Relaciones</span>
                    </button>

                    <button
                      onClick={onToggleSnap}
                      className={`control-panel__tool-button ${isSnapEnabled ? 'control-panel__tool-button--active' : ''}`}
                      title="Activar/desactivar snap a pasillos"
                    >
                      <span className="control-panel__tool-icon">🧲</span>
                      <span className="control-panel__tool-label">Snap {isSnapEnabled ? 'ON' : 'OFF'}</span>
                    </button>

                    <button
                      onClick={onToggleDebugEdges}
                      className={`control-panel__tool-button ${showDebugEdges ? 'control-panel__tool-button--active' : ''}`}
                      title="Mostrar/ocultar debug de bordes"
                    >
                      <span className="control-panel__tool-icon">🐛</span>
                      <span className="control-panel__tool-label">Debug {showDebugEdges ? 'ON' : 'OFF'}</span>
                    </button>
                  </div>
                </div>

                <div className="control-panel__edit-info">
                  {puntosTemporales && puntosTemporales.length > 0 && (
                    <div className="control-panel__points-counter">
                      Puntos: {puntosTemporales.length}
                    </div>
                  )}
                  {esDestacado && (
                    <div className="control-panel__destacado-indicator">
                      ⭐ Este elemento será marcado como <strong>DESTACADO</strong>
                    </div>
                  )}
                  <div className="control-panel__edit-hint">
                    {tipoActual === AREA_TYPES.PUNTO && "Haz clic para agregar puntos"}
                    {(tipoActual === AREA_TYPES.EXTINTOR || 
                      tipoActual === AREA_TYPES.SALIDA_EMERGENCIA ||
                      tipoActual === AREA_TYPES.DESFIBRILADOR ||
                      tipoActual === AREA_TYPES.BOTIQUIN ||
                      tipoActual === AREA_TYPES.TOTEM ||
                      tipoActual === AREA_TYPES.ALARMA) && `Haz clic para agregar ${getPointTypeName(tipoActual).toLowerCase()}`}
                    {tipoActual === AREA_TYPES.PASILLO && "Haz clic en dos nodos para conectar"}
                    {tipoActual !== AREA_TYPES.PUNTO && 
                    tipoActual !== AREA_TYPES.PASILLO && 
                    tipoActual !== AREA_TYPES.EXTINTOR &&
                    tipoActual !== AREA_TYPES.SALIDA_EMERGENCIA &&
                    tipoActual !== AREA_TYPES.DESFIBRILADOR &&
                    tipoActual !== AREA_TYPES.BOTIQUIN &&
                    tipoActual !== AREA_TYPES.TOTEM &&
                    tipoActual !== AREA_TYPES.ALARMA && "Haz clic para crear el polígono"}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'exportar' && (
          <div className="control-panel__tab-content">
            <div className="control-panel__section">
              <div className="control-panel__section-header">
                <span className="control-panel__section-icon">💾</span>
                <h4 className="control-panel__section-title">Exportar Datos</h4>
              </div>

              <div className="control-panel__export-grid">
                <button
                  onClick={onExportAllData}
                  className="control-panel__export-button"
                >
                  <span className="control-panel__export-icon">📊</span>
                  <span className="control-panel__export-label">Mostrar en Consola</span>
                </button>

                <button
                  onClick={onExportByType}
                  className="control-panel__export-button"
                >
                  <span className="control-panel__export-icon">🗂️</span>
                  <span className="control-panel__export-label">Mostrar por Tipo</span>
                </button>

                <button
                  onClick={onDescargarJSON}
                  className="control-panel__export-button control-panel__export-button--primary"
                >
                  <span className="control-panel__export-icon">📥</span>
                  <span className="control-panel__export-label">Descargar JSON</span>
                </button>

                <button
                  onClick={onCopiarJSON}
                  className="control-panel__export-button control-panel__export-button--secondary"
                >
                  <span className="control-panel__export-icon">📋</span>
                  <span className="control-panel__export-label">Copiar JSON</span>
                </button>

                {process.env.NODE_ENV === 'development' && (
                  <button
                    onClick={onSimularGuardado}
                    className="control-panel__export-button control-panel__export-button--warning"
                  >
                    <span className="control-panel__export-icon">🗂️</span>
                    <span className="control-panel__export-label">Simular Guardado</span>
                  </button>
                )}
              </div>

              <div className="control-panel__export-info">
                Los datos se pueden descargar como archivo JSON para backup o importación.
              </div>
            </div>

            <div className="control-panel__section">
              <div className="control-panel__section-header">
                <span className="control-panel__section-icon">📈</span>
                <h4 className="control-panel__section-title">Estadísticas</h4>
              </div>

              <div className="control-panel__stats-grid">
                <div className="control-panel__stat-item">
                  <span className="control-panel__stat-value">{stats.totalNodos}</span>
                  <span className="control-panel__stat-label">Total Nodos</span>
                </div>
                <div className="control-panel__stat-item">
                  <span className="control-panel__stat-value">{stats.areas}</span>
                  <span className="control-panel__stat-label">Áreas</span>
                </div>
                <div className="control-panel__stat-item">
                  <span className="control-panel__stat-value">{stats.puntos}</span>
                  <span className="control-panel__stat-label">Puntos</span>
                </div>
                <div className="control-panel__stat-item">
                  <span className="control-panel__stat-value">{stats.escaleras}</span>
                  <span className="control-panel__stat-label">Escaleras</span>
                </div>
                <div className="control-panel__stat-item">
                  <span className="control-panel__stat-value">{stats.pasillos}</span>
                  <span className="control-panel__stat-label">Pasillos</span>
                </div>
                <div className="control-panel__stat-item">
                  <span className="control-panel__stat-value">{stats.departamentos}</span>
                  <span className="control-panel__stat-label">Departamentos</span>
                </div>
                <div className="control-panel__stat-item">
                  <span className="control-panel__stat-value">{stats.areasGenericas}</span>
                  <span className="control-panel__stat-label">Áreas Genéricas</span>
                </div>
                {/* 🔥 NUEVA ESTADÍSTICA: Elementos destacados */}
                <div className="control-panel__stat-item control-panel__stat-item--destacado">
                  <span className="control-panel__stat-value">{stats.destacados}</span>
                  <span className="control-panel__stat-label">⭐ Destacados</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="control-panel__status-bar">
          <div className="control-panel__status-item">
            <span className="control-panel__status-icon">🔍</span>
            <span>{Math.round(zoomScale * 100)}%</span>
          </div>
          <div className="control-panel__status-item">
            <span className="control-panel__status-icon">🧲</span>
            <span>{isSnapEnabled ? "ON" : "OFF"}</span>
          </div>
          <div className="control-panel__status-item">
            <span className="control-panel__status-icon">🎬</span>
            <span>{isRouteAnimating ? "Activa" : "Inactiva"}</span>
          </div>
          {/* 🔥 NUEVO: Indicador de modo destacado */}
          {esDestacado && (
            <div className="control-panel__status-item control-panel__status-item--destacado">
              <span className="control-panel__status-icon">⭐</span>
              <span>Destacado</span>
            </div>
          )}
        </div>
      </div>

      <div className={collapsedInfoClass}>
        <div className="control-panel__collapsed-icon">🗺️</div>
        <div className="control-panel__collapsed-text">GPS</div>
      </div>
    </div>
  );
};

export default ControlPanel;