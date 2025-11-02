import React, { useState } from 'react';
import { AREA_TYPES } from '../utils/constants';
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
  onSimularGuardado
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

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

  // OBTENER TODOS LOS NODOS DE TODOS LOS PLANOS
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
    [AREA_TYPES.TOTEM]: 'Totem'
  };
  return nombres[tipo] || 'Elemento';
};

  return (
    <div className={panelClass}>
      {/* Botón de toggle */}
      <button
        onClick={togglePanel}
        className="control-panel__toggle-button"
        title={isCollapsed ? "Expandir panel" : "Contraer panel"}
      >
        {isCollapsed ? "→" : "←"}
      </button>

      {/* Contenido del panel */}
      <div className={contentClass}>
        <h3 className="control-panel__title">
          🗺️ Navegación GPS
        </h3>
        
        {/* Selector de Carrera y Plano */}
        <div className="control-panel__section">
          <div className="control-panel__section-title">
            🏢 Navegación entre Planos
          </div>
          
          {/* Selector de Carrera */}
          <div className="control-panel__input-group">
            <label className="control-panel__label">
              Carrera:
            </label>
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

          {/* Selector de Plano */}
          {Array.isArray(planosCarreraActual) && planosCarreraActual.length > 0 && (
            <div>
              <label className="control-panel__label">
                Plano Actual:
              </label>
              <div className="control-panel__plano-selector">
                <button
                  onClick={onRetrocederPlano}
                  disabled={!infoPlanoActual?.tieneAnterior}
                  className={`control-panel__plano-button ${
                    infoPlanoActual?.tieneAnterior ? 'control-panel__plano-button--active' : 'control-panel__plano-button--disabled'
                  }`}
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
                  className={`control-panel__plano-button ${
                    infoPlanoActual?.tieneSiguiente ? 'control-panel__plano-button--active' : 'control-panel__plano-button--disabled'
                  }`}
                  title="Siguiente plano"
                >
                  ▶
                </button>
              </div>
              
              {/* Información del plano actual */}
              {infoPlanoActual && (
                <div className="control-panel__plano-info">
                  Plano {infoPlanoActual.numero} de {infoPlanoActual.total}
                </div>
              )}
            </div>
          )}
        </div>

        {/* CONTROLES DE EDICIÓN */}
        {!modoEdicion ? (
          /* Botón para activar modo edición */
          <div className="control-panel__section control-panel__section--edit-activation">
            <button
              onClick={onToggleEdit}
              className="control-panel__button control-panel__button--primary control-panel__button--large"
            >
              ✏️ Activar Modo Edición
            </button>
            <div className="control-panel__info-text">
              Para agregar áreas, puntos y pasillos
            </div>
          </div>
        ) : (
         <div className="control-panel__section control-panel__section--edit-active">
            <div className="control-panel__edit-header">
              ✏️ Modo Edición Activo
            </div>
            
            {/* Selector de tipo de área */}
            <div className="control-panel__input-group">
              <label className="control-panel__label">
                Tipo de Elemento:
              </label>
             <select
                value={tipoActual}
                onChange={(e) => onChangeType && onChangeType(e.target.value)}
                className="control-panel__select"
              >
                <option value={AREA_TYPES.AULA}>🏫 Aula</option>
                {/* ❌ QUITAMOS SALÓN <option value={AREA_TYPES.SALON}>🏛️ Salón</option> */}
                <option value={AREA_TYPES.HALL}>🏢 Hall</option>
                <option value={AREA_TYPES.BANO}>🚻 Baño</option>
                <option value={AREA_TYPES.ESCALERA}>🪜 Escalera</option>
                <option value={AREA_TYPES.PUNTO}>📍 Punto</option>
                <option value={AREA_TYPES.PASILLO}>🛣️ Pasillo</option>
                <option value={AREA_TYPES.EXTINTOR}>🧯 Matafuegos</option>
                <option value={AREA_TYPES.SALIDA_EMERGENCIA}>🚪 Salida Emergencia</option>
                <option value={AREA_TYPES.DESFIBRILADOR}>💓 Desfibrilador</option>
                <option value={AREA_TYPES.BOTIQUIN}>🩹 Botiquín</option>
                <option value={AREA_TYPES.ALARMA}>🚨 Alarma</option>
                <option value={AREA_TYPES.TOTEM}>📟 Tótem</option>
              </select>
            </div>

            {/* Nombre del área */}
            <div className="control-panel__input-group">
              <label className="control-panel__label">
                Nombre:
              </label>
              <input
                type="text"
                value={nombreArea || ''}
                onChange={(e) => onChangeName && onChangeName(e.target.value)}
                placeholder="Nombre del área..."
                className="control-panel__input"
              />
            </div>

            {/* Botones de acción de edición */}
            <div className="control-panel__button-group">
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
                  className={`control-panel__button ${
                    puntosTemporales?.length > 0 ? 'control-panel__button--success' : 'control-panel__button--disabled'
                  }`}
                >
                  💾 Guardar {getPointTypeName(tipoActual)}
                </button>
              ) : tipoActual === AREA_TYPES.PASILLO ? (
                <button
                  onClick={onSavePasillo}
                  disabled={!selectedNode}
                  className={`control-panel__button ${
                    selectedNode ? 'control-panel__button--warning' : 'control-panel__button--disabled'
                  }`}
                >
                  🔗 {selectedNode ? `Conectar ${selectedNode.nombre}` : 'Selecciona un nodo'}
                </button>
              ) : (
                <button
                  onClick={onSaveArea}
                  disabled={!puntosTemporales || puntosTemporales.length < 3}
                  className={`control-panel__button ${
                    puntosTemporales?.length >= 3 ? 'control-panel__button--success' : 'control-panel__button--disabled'
                  }`}
                >
                  💾 Guardar Área
                </button>
              )}
              
              <button
                onClick={onUndo}
                disabled={!puntosTemporales || puntosTemporales.length === 0}
                className={`control-panel__button control-panel__button--icon ${
                  puntosTemporales?.length > 0 ? 'control-panel__button--danger' : 'control-panel__button--disabled'
                }`}
              >
                ↩️
              </button>
            </div>

            {/* BOTÓN VER RELACIONES - AGREGADO AQUÍ */}
            <button
              onClick={onToggleRelationsPanel}
              className="control-panel__button control-panel__button--secondary"
              style={{ marginBottom: '8px' }}
            >
              🔗 Ver Relaciones
            </button>

            {/* Información de edición */}
           <div className="control-panel__edit-info">
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
              {puntosTemporales && puntosTemporales.length > 0 && ` • Puntos: ${puntosTemporales.length}`}
            </div>

            {/* Botón cancelar edición */}
            <button
              onClick={onCancel}
              className="control-panel__button control-panel__button--danger control-panel__button--small"
            >
              ❌ Cancelar Edición
            </button>
          </div>
        )}

        {/* Controles de Navegación GPS */}
        <div className="control-panel__section">
          <div className="control-panel__section-title">
            🌍 Navegación Multi-Piso
          </div>

          <div className="control-panel__input-group">
            <label className="control-panel__label">
              Origen:
            </label>
            <select
              value={origen || ''}
              onChange={(e) => onOriginChange && onOriginChange(e.target.value)}
              className="control-panel__select"
            >
              <option value="">Seleccionar origen</option>
              {todosLosNodos.map(node => (
                <option key={node.id} value={node.id}>
                  {node.nombre} ({node.carrera} {node.piso})
                </option>
              ))}
            </select>
          </div>

          <div className="control-panel__input-group">
            <label className="control-panel__label">
              Destino:
            </label>
            <select
              value={destino || ''}
              onChange={(e) => onDestinationChange && onDestinationChange(e.target.value)}
              className="control-panel__select"
            >
              <option value="">Seleccionar destino</option>
              {todosLosNodos.map(node => (
                <option key={node.id} value={node.id}>
                  {node.nombre} ({node.carrera} {node.piso})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onCalculateRoute}
            disabled={!origen || !destino}
            className={`control-panel__button ${
              origen && destino ? 'control-panel__button--success' : 'control-panel__button--disabled'
            }`}
          >
            🚀 Calcular Ruta Multi-Piso
          </button>

          {/* 🔥 NUEVO BOTÓN LIMPIAR BÚSQUEDA */}
        <button
           onClick={onClearRoute}
          disabled={!origen && !destino && rutaActual.length === 0}
          className={`control-panel__button control-panel__button--danger ${
            (origen || destino || rutaActual.length > 0) ? '' : 'control-panel__button--disabled'
          }`}
          style={{ marginTop: "8px" }}
        >
          🗑️ Limpiar Búsqueda
        </button>

          {isRouteAnimating && (
            <button
              onClick={onStopAnimation}
              className="control-panel__button control-panel__button--danger control-panel__button--small"
              style={{ marginTop: "4px" }}
            >
              ⏹️ Detener Animación
            </button>
          )}

          {/* Información de la ruta calculada */}
          {rutaActual && rutaActual.length > 0 && (
            <div className="control-panel__route-info">
              <div className="control-panel__route-info-title">
                🗺️ Ruta Calculada
              </div>
              <div className="control-panel__route-info-details">
                {rutaActual.length} pasos • Ruta multi-piso lista
              </div>
            </div>
          )}

          {/* Información de transiciones entre pisos */}
          {floorTransitions && floorTransitions.length > 0 && (
            <div className="control-panel__transitions-info">
              <div className="control-panel__transitions-title">
                🏢 Cambios de Piso
              </div>
              {floorTransitions.map((transition, index) => (
                <div key={index} className="control-panel__transition-item">
                  {transition.fromFloor} → {transition.toFloor}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Información de Debug */}
        <div className="control-panel__debug-info">
          <div className="control-panel__debug-item">
            🔍 Bordes detectados: {edgesCount || 0}
          </div>
          <div className="control-panel__debug-item">
            📏 Zoom: {Math.round(zoomScale * 100)}%
          </div>
          <div className="control-panel__debug-item">
            🧲 Snap: {isSnapEnabled ? "Activado" : "Desactivado"}
          </div>
          <div className="control-panel__debug-item">
            🎬 Animación: {isRouteAnimating ? "Activa" : "Inactiva"}
          </div>
          <div className="control-panel__debug-item">
            📍 Nodos totales: {todosLosNodos.length}
          </div>
        </div>

          <div className="control-panel__section">
          <div className="control-panel__section-title">
            💾 Exportar Datos
          </div>
          
          <button
            onClick={onExportAllData}
            className="control-panel__button control-panel__button--secondary"
            style={{ marginBottom: '8px', width: '100%' }}
          >
            📊 Mostrar en Consola
          </button>
          
          <button
            onClick={onExportByType}
            className="control-panel__button control-panel__button--secondary"
            style={{ marginBottom: '8px', width: '100%' }}
          >
            🗂️ Mostrar por Tipo
          </button>
          
          <button
            onClick={onDescargarJSON}
            className="control-panel__button control-panel__button--success"
            style={{ marginBottom: '8px', width: '100%' }}
          >
            📥 Descargar JSON
          </button>
          
          <button
            onClick={onCopiarJSON}
            className="control-panel__button control-panel__button--info"
            style={{ marginBottom: '8px', width: '100%' }}
          >
            📋 Copiar JSON
          </button>
          
          {/* Solo en desarrollo */}
          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={onSimularGuardado}
              className="control-panel__button control-panel__button--warning"
              style={{ marginBottom: '8px', width: '100%' }}
            >
              🗂️ Simular Guardado en Hooks
            </button>
          )}
          
          <div className="control-panel__info-text" style={{ fontSize: '12px', textAlign: 'center' }}>
            Los datos se pueden descargar como archivo JSON
          </div>
        </div>
        {/* Botones de Configuración */}
        <div className="control-panel__config-buttons">
          <button
            onClick={onToggleSnap}
            className={`control-panel__button control-panel__button--config ${
              isSnapEnabled ? 'control-panel__button--success' : 'control-panel__button--danger'
            }`}
          >
            🧲 {isSnapEnabled ? "Snap ON" : "Snap OFF"}
          </button>
          
          <button
            onClick={onToggleDebugEdges}
            className={`control-panel__button control-panel__button--config ${
              showDebugEdges ? 'control-panel__button--warning' : 'control-panel__button--secondary'
            }`}
          >
            🐛 {showDebugEdges ? "Debug ON" : "Debug OFF"}
          </button>
        </div>
      </div>

      

    

      {/* Información en estado colapsado */}
      <div className={collapsedInfoClass}>
        <div>🗺️</div>
        <div>GPS</div>
      </div>
    </div>

  );
};

export default ControlPanel;