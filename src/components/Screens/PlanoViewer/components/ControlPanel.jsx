import React from 'react';
import { AREA_TYPES } from '../utils/constants';

const ControlPanel = ({
  modoEdicion,
  tipoActual,
  nombreArea,
  puntosTemporales,
  origen,
  destino,
  areas = [],
  points = [],
  zoomScale,
  isSnapEnabled,
  showDebugEdges,
  edgesCount,
  isRouteAnimating,
  selectedNode,
  floorTransitions = [],
  todosLosDatos = {},
  rutaActual = [],
  carreraActual = 'general',
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
  onRetrocederPlano
}) => {
  const panelStyle = {
    position: "absolute",
    top: 20,
    left: 20,
    background: "rgba(255,255,255,0.85)",
    backdropFilter: "blur(8px)",
    padding: "20px",
    borderRadius: "16px",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.12)",
    zIndex: 10,
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    width: "320px",
    fontFamily: "Inter, Arial, sans-serif",
  };

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

  return (
    <div style={panelStyle}>
      <h3 style={{ margin: "0 0 10px 0", color: "#1f2937" }}>
        🗺️ Navegación GPS Multi-Piso
      </h3>
      
      {/* Selector de Carrera y Plano */}
      <div style={{ 
        padding: "12px", 
        background: "rgba(248, 250, 252, 0.8)", 
        borderRadius: "8px",
        border: "1px solid rgba(226, 232, 240, 0.8)",
        marginBottom: "12px"
      }}>
        <div style={{ fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "8px" }}>
          🏢 Navegación entre Planos
        </div>
        
        {/* Selector de Carrera */}
        <div style={{ marginBottom: "8px" }}>
          <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#64748b", marginBottom: "4px" }}>
            Carrera:
          </label>
          <select
            value={carreraActual}
            onChange={(e) => onCambiarCarrera && onCambiarCarrera(e.target.value)}
            style={{
              width: "100%",
              padding: "6px 8px",
              borderRadius: "6px",
              border: "1px solid #e2e8f0",
              fontSize: "11px",
              background: "white"
            }}
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
            <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#64748b", marginBottom: "4px" }}>
              Plano Actual:
            </label>
            <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
              <button
                onClick={onRetrocederPlano}
                disabled={!infoPlanoActual?.tieneAnterior}
                style={{
                  padding: "4px 8px",
                  background: infoPlanoActual?.tieneAnterior ? "#3b82f6" : "#cbd5e1",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "10px",
                  cursor: infoPlanoActual?.tieneAnterior ? "pointer" : "not-allowed"
                }}
                title="Plano anterior"
              >
                ◀
              </button>
              
              <select
                value={planoActual?.id || ''}
                onChange={(e) => onCambiarPlano && onCambiarPlano(e.target.value)}
                style={{
                  flex: 1,
                  padding: "6px 8px",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                  fontSize: "11px",
                  background: "white"
                }}
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
                style={{
                  padding: "4px 8px",
                  background: infoPlanoActual?.tieneSiguiente ? "#3b82f6" : "#cbd5e1",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "10px",
                  cursor: infoPlanoActual?.tieneSiguiente ? "pointer" : "not-allowed"
                }}
                title="Siguiente plano"
              >
                ▶
              </button>
            </div>
            
            {/* Información del plano actual */}
            {infoPlanoActual && (
              <div style={{ 
                fontSize: "10px", 
                color: "#64748b", 
                marginTop: "6px",
                textAlign: "center"
              }}>
                Plano {infoPlanoActual.numero} de {infoPlanoActual.total}
              </div>
            )}
          </div>
        )}
      </div>

      {/* CONTROLES DE EDICIÓN */}
      {!modoEdicion ? (
        /* Botón para activar modo edición */
        <div style={{ 
          padding: "12px", 
          background: "rgba(59, 130, 246, 0.1)", 
          borderRadius: "8px",
          border: "1px solid rgba(59, 130, 246, 0.3)",
          textAlign: "center"
        }}>
          <button
            onClick={onToggleEdit}
            style={{
              padding: "10px 16px",
              background: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer",
              width: "100%"
            }}
          >
            ✏️ Activar Modo Edición
          </button>
          <div style={{ fontSize: "10px", color: "#64748b", marginTop: "6px" }}>
            Para agregar áreas, puntos y pasillos
          </div>
        </div>
      ) : (
        /* Controles de edición activos */
        <div style={{ 
          padding: "12px", 
          background: "rgba(34, 197, 94, 0.1)", 
          borderRadius: "8px",
          border: "1px solid rgba(34, 197, 94, 0.3)"
        }}>
          <div style={{ fontSize: "12px", fontWeight: "600", color: "#16a34a", marginBottom: "8px" }}>
            ✏️ Modo Edición Activo
          </div>
          
          {/* Selector de tipo de área */}
          <div style={{ marginBottom: "8px" }}>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#64748b", marginBottom: "4px" }}>
              Tipo de Elemento:
            </label>
            <select
              value={tipoActual}
              onChange={(e) => onChangeType && onChangeType(e.target.value)}
              style={{
                width: "100%",
                padding: "6px 8px",
                borderRadius: "6px",
                border: "1px solid #e2e8f0",
                fontSize: "11px",
                background: "white"
              }}
            >
              <option value={AREA_TYPES.AULA}>Aula</option>
              <option value={AREA_TYPES.SALON}>Salón</option>
              <option value={AREA_TYPES.HALL}>Hall</option>
              <option value={AREA_TYPES.BANO}>Baño</option>
              <option value={AREA_TYPES.ESCALERA}>Escalera</option>
              <option value={AREA_TYPES.PUNTO}>Punto</option>
              <option value={AREA_TYPES.PASILLO}>Pasillo</option>
            </select>
          </div>

          {/* Nombre del área */}
          <div style={{ marginBottom: "8px" }}>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#64748b", marginBottom: "4px" }}>
              Nombre:
            </label>
            <input
              type="text"
              value={nombreArea || ''}
              onChange={(e) => onChangeName && onChangeName(e.target.value)}
              placeholder="Nombre del área..."
              style={{
                width: "100%",
                padding: "6px 8px",
                borderRadius: "6px",
                border: "1px solid #e2e8f0",
                fontSize: "11px",
                background: "white"
              }}
            />
          </div>

          {/* Botones de acción de edición */}
          <div style={{ display: "flex", gap: "6px", marginBottom: "8px" }}>
            {tipoActual === AREA_TYPES.PUNTO ? (
              <button
                onClick={onSavePoints}
                disabled={!puntosTemporales || puntosTemporales.length === 0}
                style={{
                  flex: 1,
                  padding: "8px",
                  background: puntosTemporales?.length > 0 ? "#10b981" : "#cbd5e1",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontWeight: "600",
                  cursor: puntosTemporales?.length > 0 ? "pointer" : "not-allowed"
                }}
              >
                💾 Guardar Puntos
              </button>
            ) : tipoActual === AREA_TYPES.PASILLO ? (
              <button
                onClick={onSavePasillo}
                disabled={!selectedNode}
                style={{
                  flex: 1,
                  padding: "8px",
                  background: selectedNode ? "#f59e0b" : "#cbd5e1",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontWeight: "600",
                  cursor: selectedNode ? "pointer" : "not-allowed"
                }}
              >
                🔗 {selectedNode ? `Conectar ${selectedNode.nombre}` : 'Selecciona un nodo'}
              </button>
            ) : (
              <button
                onClick={onSaveArea}
                disabled={!puntosTemporales || puntosTemporales.length < 3}
                style={{
                  flex: 1,
                  padding: "8px",
                  background: puntosTemporales?.length >= 3 ? "#10b981" : "#cbd5e1",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontWeight: "600",
                  cursor: puntosTemporales?.length >= 3 ? "pointer" : "not-allowed"
                }}
              >
                💾 Guardar Área
              </button>
            )}
            
            <button
              onClick={onUndo}
              disabled={!puntosTemporales || puntosTemporales.length === 0}
              style={{
                padding: "8px 12px",
                background: puntosTemporales?.length > 0 ? "#ef4444" : "#cbd5e1",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "11px",
                fontWeight: "600",
                cursor: puntosTemporales?.length > 0 ? "pointer" : "not-allowed"
              }}
            >
              ↩️
            </button>
          </div>

          {/* Información de edición */}
          <div style={{ fontSize: "10px", color: "#64748b", textAlign: "center" }}>
            {tipoActual === AREA_TYPES.PUNTO && "Haz clic para agregar puntos"}
            {tipoActual === AREA_TYPES.PASILLO && "Haz clic en dos nodos para conectar"}
            {tipoActual !== AREA_TYPES.PUNTO && tipoActual !== AREA_TYPES.PASILLO && "Haz clic para crear el polígono"}
            {puntosTemporales && puntosTemporales.length > 0 && ` • Puntos: ${puntosTemporales.length}`}
          </div>

          {/* Botón cancelar edición */}
          <button
            onClick={onCancel}
            style={{
              width: "100%",
              padding: "6px",
              background: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "10px",
              fontWeight: "600",
              cursor: "pointer",
              marginTop: "6px"
            }}
          >
            ❌ Cancelar Edición
          </button>
        </div>
      )}

      {/* Controles de Navegación GPS */}
      <div>
        <div style={{ fontSize: "11px", fontWeight: "600", color: "#475569", marginBottom: "8px", textAlign: "center" }}>
          🌍 Navegación Multi-Piso
        </div>

        <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#64748b", marginBottom: "4px" }}>
          Origen:
        </label>
        <select
          value={origen || ''}
          onChange={(e) => onOriginChange && onOriginChange(e.target.value)}
          style={{
            width: "100%",
            padding: "6px 8px",
            borderRadius: "6px",
            border: "1px solid #e2e8f0",
            fontSize: "11px",
            background: "white",
            marginBottom: "8px"
          }}
        >
          <option value="">Seleccionar origen</option>
          {todosLosNodos.map(node => (
            <option key={node.id} value={node.id}>
              {node.nombre} ({node.carrera} {node.piso})
            </option>
          ))}
        </select>

        <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#64748b", marginBottom: "4px" }}>
          Destino:
        </label>
        <select
          value={destino || ''}
          onChange={(e) => onDestinationChange && onDestinationChange(e.target.value)}
          style={{
            width: "100%",
            padding: "6px 8px",
            borderRadius: "6px",
            border: "1px solid #e2e8f0",
            fontSize: "11px",
            background: "white",
            marginBottom: "8px"
          }}
        >
          <option value="">Seleccionar destino</option>
          {todosLosNodos.map(node => (
            <option key={node.id} value={node.id}>
              {node.nombre} ({node.carrera} {node.piso})
            </option>
          ))}
        </select>

        <button
          onClick={onCalculateRoute}
          disabled={!origen || !destino}
          style={{
            width: "100%",
            padding: "8px",
            background: origen && destino ? "#10b981" : "#cbd5e1",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "11px",
            fontWeight: "600",
            cursor: origen && destino ? "pointer" : "not-allowed"
          }}
        >
          🚀 Calcular Ruta Multi-Piso
        </button>

        {isRouteAnimating && (
          <button
            onClick={onStopAnimation}
            style={{
              width: "100%",
              padding: "6px",
              background: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "10px",
              fontWeight: "600",
              cursor: "pointer",
              marginTop: "4px"
            }}
          >
            ⏹️ Detener Animación
          </button>
        )}

        {/* Información de la ruta calculada */}
        {rutaActual && rutaActual.length > 0 && (
          <div style={{ 
            padding: "8px", 
            background: "rgba(34, 197, 94, 0.1)", 
            borderRadius: "6px",
            border: "1px solid rgba(34, 197, 94, 0.3)",
            marginTop: "8px"
          }}>
            <div style={{ fontSize: "10px", fontWeight: "600", color: "#16a34a", marginBottom: "4px" }}>
              🗺️ Ruta Calculada
            </div>
            <div style={{ fontSize: "9px", color: "#64748b" }}>
              {rutaActual.length} pasos • Ruta multi-piso lista
            </div>
          </div>
        )}

        {/* Información de transiciones entre pisos */}
        {floorTransitions && floorTransitions.length > 0 && (
          <div style={{ 
            padding: "8px", 
            background: "rgba(59, 130, 246, 0.1)", 
            borderRadius: "6px",
            border: "1px solid rgba(59, 130, 246, 0.3)",
            marginTop: "8px"
          }}>
            <div style={{ fontSize: "10px", fontWeight: "600", color: "#1e40af", marginBottom: "4px" }}>
              🏢 Cambios de Piso
            </div>
            {floorTransitions.map((transition, index) => (
              <div key={index} style={{ fontSize: "9px", color: "#374151" }}>
                {transition.fromFloor} → {transition.toFloor}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Información de Debug */}
      <div style={{ 
        padding: "8px", 
        background: "rgba(248, 250, 252, 0.8)", 
        borderRadius: "6px",
        border: "1px solid rgba(226, 232, 240, 0.8)"
      }}>
        <div style={{ fontSize: "10px", color: "#64748b" }}>
          🔍 Bordes detectados: {edgesCount || 0}
        </div>
        <div style={{ fontSize: "10px", color: "#64748b" }}>
          📏 Zoom: {Math.round(zoomScale * 100)}%
        </div>
        <div style={{ fontSize: "10px", color: "#64748b" }}>
          🧲 Snap: {isSnapEnabled ? "Activado" : "Desactivado"}
        </div>
        <div style={{ fontSize: "10px", color: "#64748b" }}>
          🎬 Animación: {isRouteAnimating ? "Activa" : "Inactiva"}
        </div>
        <div style={{ fontSize: "10px", color: "#64748b" }}>
          📍 Nodos totales: {todosLosNodos.length}
        </div>
      </div>

      {/* Botones de Configuración */}
      <div style={{ display: "flex", gap: "6px" }}>
        <button
          onClick={onToggleSnap}
          style={{
            flex: 1,
            padding: "6px",
            background: isSnapEnabled ? "#10b981" : "#ef4444",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "10px",
            fontWeight: "600",
            cursor: "pointer"
          }}
        >
          🧲 {isSnapEnabled ? "Snap ON" : "Snap OFF"}
        </button>
        
        <button
          onClick={onToggleDebugEdges}
          style={{
            flex: 1,
            padding: "6px",
            background: showDebugEdges ? "#f59e0b" : "#6b7280",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "10px",
            fontWeight: "600",
            cursor: "pointer"
          }}
        >
          🐛 {showDebugEdges ? "Debug ON" : "Debug OFF"}
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;