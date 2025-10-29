import React from 'react';
import { CONTROL_PANEL_STYLE, AREA_TYPES } from '../utils/constants';

const ControlPanel = ({
  modoEdicion,
  tipoActual,
  nombreArea,
  puntosTemporales,
  origen,
  destino,
  areas,
  points,
  zoomScale,
  isSnapEnabled,
  showDebugEdges,
  edgesCount,
  isRouteAnimating,
  selectedNode,  // ← NUEVA PROP
  onToggleEdit,
  onChangeType,
  onChangeName,
  onSaveArea,
  onSavePoints,
  onSavePasillo,
  onUndo,
  onCancel,
  onCalculateRoute,
  onOriginChange,
  onDestinationChange,
  onToggleSnap,
  onToggleDebugEdges,
  onStopAnimation
}) => {
  const nodes = [...areas.filter(a => a.tipo !== AREA_TYPES.PASILLO), ...points];

  // Estilos inline
  const selectStyle = (disabled) => ({
    flex: 1,
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    background: disabled ? "#f8fafc" : "white",
    color: "#0f172a",
    fontFamily: "Inter, Arial, sans-serif",
    fontSize: "14px",
    cursor: disabled ? "not-allowed" : "pointer",
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
    opacity: disabled ? 0.6 : 1
  });

  const inputStyle = {
    flex: 1,
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    background: "white",
    color: "#0f172a",
    fontFamily: "Inter, Arial, sans-serif",
    fontSize: "14px"
  };

  const buttonStyle = (backgroundColor, disabled = false) => ({
    padding: "12px 16px",
    background: disabled ? "#94a3b8" : backgroundColor,
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: disabled ? "not-allowed" : "pointer",
    fontWeight: "600",
    fontSize: "14px",
    fontFamily: "Inter, Arial, sans-serif",
    transition: "all 0.2s ease",
    opacity: disabled ? 0.6 : 1
  });

  const panelStyle = {
    ...CONTROL_PANEL_STYLE,
    maxHeight: "90vh",
    overflowY: "auto"
  };

  return (
    <div style={panelStyle}>
      <h3 style={{ 
        margin: 0, 
        fontSize: "18px", 
        fontWeight: 700, 
        color: "#0f172a",
        fontFamily: "Inter, Arial, sans-serif"
      }}>
        Editor de Planos
      </h3>

      <div style={{ display: "flex", gap: "10px" }}>
        <select
          value={tipoActual}
          onChange={(e) => onChangeType(e.target.value)}
          disabled={!modoEdicion}
          style={selectStyle(!modoEdicion)}
        >
          <option value={AREA_TYPES.AULA}>Aula</option>
          <option value={AREA_TYPES.SALON}>Salón</option>
          <option value={AREA_TYPES.HALL}>Hall</option>
          <option value={AREA_TYPES.BANO}>Baño</option>
          <option value={AREA_TYPES.ESCALERA}>Escalera</option>
          <option value={AREA_TYPES.PUNTO}>Punto</option>
          <option value={AREA_TYPES.PASILLO}>Pasillo</option>
        </select>

        {modoEdicion && tipoActual !== AREA_TYPES.PASILLO && (
          <input
            type="text"
            placeholder="Nombre del área"
            value={nombreArea}
            onChange={(e) => onChangeName(e.target.value)}
            style={inputStyle}
          />
        )}
      </div>

      {/* Info de zoom y estado */}
      <div style={{
        padding: "8px 12px",
        background: modoEdicion ? "#dbeafe" : "#f1f5f9",
        borderRadius: "8px",
        fontSize: "12px",
        color: modoEdicion ? "#1e40af" : "#475569",
        textAlign: "center",
        fontFamily: "Inter, Arial, sans-serif",
        border: modoEdicion ? "1px solid #93c5fd" : "1px solid #e2e8f0"
      }}>
        <div>Zoom: {Math.round(zoomScale * 100)}%</div>
        <div>
          {modoEdicion ? "✏️ Modo edición activo" : "📍 Modo navegación"} • 
          {modoEdicion ? " Pasillos visibles" : " Pasillos ocultos"}
        </div>
      </div>

      {/* Control de Snap y Debug - Solo visible en modo edición */}
      {modoEdicion && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Snap Control */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px', 
            padding: '8px 12px', 
            background: '#f8fafc', 
            borderRadius: '8px', 
            border: '1px solid #e2e8f0' 
          }}>
            <button
              onClick={onToggleSnap}
              style={{
                padding: '8px 12px',
                background: isSnapEnabled ? '#10b981' : '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                flex: 1,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-1px)";
                e.target.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0px)";
                e.target.style.boxShadow = "none";
              }}
            >
              {isSnapEnabled ? '🔗 Snap: ON' : '🔓 Snap: OFF'}
            </button>
            <div style={{
              fontSize: '10px',
              color: '#64748b',
              textAlign: 'center',
              flex: 1
            }}>
              {isSnapEnabled ? 'Imantación activa' : 'Imantación desactivada'}
            </div>
          </div>

          {/* Debug Control */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px', 
            padding: '8px 12px', 
            background: showDebugEdges ? '#fef3c7' : '#f8fafc', 
            borderRadius: '8px', 
            border: showDebugEdges ? '1px solid #f59e0b' : '1px solid #e2e8f0' 
          }}>
            <button
              onClick={onToggleDebugEdges}
              style={{
                padding: '8px 12px',
                background: showDebugEdges ? '#f59e0b' : '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                flex: 1,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-1px)";
                e.target.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0px)";
                e.target.style.boxShadow = "none";
              }}
            >
              {showDebugEdges ? '🔴 Debug ON' : '⚪ Debug OFF'}
            </button>
            <div style={{
              fontSize: '10px',
              color: showDebugEdges ? '#92400e' : '#64748b',
              textAlign: 'center',
              flex: 1
            }}>
              {edgesCount} bordes detectados
            </div>
          </div>
        </div>
      )}

      {/* BOTÓN PARA ENTRAR EN MODO EDICIÓN */}
      {!modoEdicion ? (
        <button
          onClick={onToggleEdit}
          style={buttonStyle("#2563eb")}
          onMouseEnter={(e) => {
            if (!e.target.disabled) {
              e.target.style.transform = "translateY(-1px)";
              e.target.style.boxShadow = "0 4px 12px rgba(37, 99, 235, 0.3)";
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0px)";
            e.target.style.boxShadow = "none";
          }}
        >
          ✏️ Entrar en modo edición
        </button>
      ) : (
       <EditModeActions
          tipoActual={tipoActual}
          puntosTemporales={puntosTemporales}
          selectedNode={selectedNode}
          onSaveArea={onSaveArea}
          onSavePoints={onSavePoints}
          onSavePasillo={onSavePasillo}  // ← NUEVA PROP
          onUndo={onUndo}
          onCancel={onCancel}
          buttonStyle={buttonStyle}
        />
      )}

      <GPSPanel
        origen={origen}
        destino={destino}
        nodes={nodes}
        onOriginChange={onOriginChange}
        onDestinationChange={onDestinationChange}
        onCalculateRoute={onCalculateRoute}
        onStopAnimation={onStopAnimation}
        isRouteAnimating={isRouteAnimating}
        buttonStyle={buttonStyle}
      />
    </div>
  );
};

const EditModeActions = ({
  tipoActual,
  puntosTemporales,
  selectedNode,
  onSaveArea,
  onSavePoints,
  onSavePasillo,  // ← NUEVA PROP
  onUndo,
  onCancel,
  buttonStyle
}) => {
  // Para pasillos, mostrar controles específicos
  if (tipoActual === "pasillo") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {/* Estado del modo pasillo */}
        <div style={{
          padding: "8px 12px",
          background: selectedNode ? "#fef3c7" : "#f1f5f9",
          borderRadius: "8px",
          fontSize: "12px",
          color: selectedNode ? "#92400e" : "#475569",
          textAlign: "center",
          border: selectedNode ? "1px solid #f59e0b" : "1px solid #e2e8f0"
        }}>
          {selectedNode 
            ? `🔗 Seleccionado: ${selectedNode.nombre} - Haz clic en otro nodo para conectar`
            : "🔗 Haz clic en un nodo para iniciar la conexión"
          }
        </div>

        {/* NUEVO: Botón Guardar Pasillo Manual */}
        <button
          onClick={onSavePasillo}
          disabled={!selectedNode}
          style={buttonStyle("#10b981", !selectedNode)}
          onMouseEnter={(e) => {
            if (!e.target.disabled) {
              e.target.style.transform = "translateY(-1px)";
              e.target.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.3)";
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0px)";
            e.target.style.boxShadow = "none";
          }}
        >
          💾 Guardar Conexión Actual
        </button>

        {/* Botón Deshacer para pasillos */}
        <button
          onClick={onUndo}
          disabled={!selectedNode}
          style={buttonStyle("#f59e0b", !selectedNode)}
          onMouseEnter={(e) => {
            if (!e.target.disabled) {
              e.target.style.transform = "translateY(-1px)";
              e.target.style.boxShadow = "0 4px 12px rgba(245, 158, 11, 0.3)";
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0px)";
            e.target.style.boxShadow = "none";
          }}
        >
          ↩️ Deshacer selección
        </button>

        {/* Botón Cancelar para pasillos */}
        <button
          onClick={onCancel}
          style={buttonStyle("#ef4444")}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-1px)";
            e.target.style.boxShadow = "0 4px 12px rgba(239, 68, 68, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0px)";
            e.target.style.boxShadow = "none";
          }}
        >
          ❌ Cancelar modo pasillo
        </button>
      </div>
    );
  }


  // Para otros tipos (áreas, puntos, etc.) - MANTENER IGUAL
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {/* Botón Guardar Área (para polígonos) */}
      {tipoActual !== AREA_TYPES.PASILLO && tipoActual !== AREA_TYPES.PUNTO && (
        <button
          onClick={onSaveArea}
          disabled={puntosTemporales.length < 3}
          style={buttonStyle("#10b981", puntosTemporales.length < 3)}
          onMouseEnter={(e) => {
            if (!e.target.disabled) {
              e.target.style.transform = "translateY(-1px)";
              e.target.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.3)";
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0px)";
            e.target.style.boxShadow = "none";
          }}
        >
          💾 Guardar área ({puntosTemporales.length} puntos)
        </button>
      )}

      {/* Botón Guardar Puntos */}
      {tipoActual === AREA_TYPES.PUNTO && (
        <button
          onClick={onSavePoints}
          disabled={puntosTemporales.length === 0}
          style={buttonStyle("#10b981", puntosTemporales.length === 0)}
          onMouseEnter={(e) => {
            if (!e.target.disabled) {
              e.target.style.transform = "translateY(-1px)";
              e.target.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.3)";
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0px)";
            e.target.style.boxShadow = "none";
          }}
        >
          💾 Guardar {puntosTemporales.length} punto{puntosTemporales.length !== 1 ? 's' : ''}
        </button>
      )}

      {/* Botón Deshacer (para áreas y puntos) */}
      {tipoActual !== AREA_TYPES.PASILLO && tipoActual !== AREA_TYPES.PUNTO && (
        <button
          onClick={onUndo}
          disabled={puntosTemporales.length === 0}
          style={buttonStyle("#f59e0b", puntosTemporales.length === 0)}
          onMouseEnter={(e) => {
            if (!e.target.disabled) {
              e.target.style.transform = "translateY(-1px)";
              e.target.style.boxShadow = "0 4px 12px rgba(245, 158, 11, 0.3)";
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0px)";
            e.target.style.boxShadow = "none";
          }}
        >
          ↩️ Deshacer último punto
        </button>
      )}

      {/* Botón Cancelar (para todos los tipos excepto pasillo) */}
      <button
        onClick={onCancel}
        style={buttonStyle("#ef4444")}
        onMouseEnter={(e) => {
          e.target.style.transform = "translateY(-1px)";
          e.target.style.boxShadow = "0 4px 12px rgba(239, 68, 68, 0.3)";
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = "translateY(0px)";
          e.target.style.boxShadow = "none";
        }}
      >
        ❌ Cancelar edición
      </button>
    </div>
  );
};

// Componente para el panel GPS (mantener igual)
const GPSPanel = ({
  origen,
  destino,
  nodes,
  onOriginChange,
  onDestinationChange,
  onCalculateRoute,
  onStopAnimation,
  isRouteAnimating,
  buttonStyle
}) => (
  <>
    <h3 style={{ 
      margin: "16px 0 8px 0", 
      fontSize: "16px", 
      fontWeight: 700, 
      color: "#0f172a",
      fontFamily: "Inter, Arial, sans-serif"
    }}>
      🧭 Navegación GPS
    </h3>
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <select
        value={origen}
        onChange={(e) => onOriginChange(e.target.value)}
        style={{
          padding: "10px 12px",
          borderRadius: "10px",
          border: "1px solid #e2e8f0",
          background: "white",
          color: "#0f172a",
          fontFamily: "Inter, Arial, sans-serif",
          fontSize: "14px",
          appearance: "none",
          WebkitAppearance: "none",
          MozAppearance: "none",
        }}
      >
        <option value="">📍 Origen</option>
        {nodes.map((n) => (
          <option key={n.id} value={n.id}>
            {n.nombre}
          </option>
        ))}
      </select>

      <select
        value={destino}
        onChange={(e) => onDestinationChange(e.target.value)}
        style={{
          padding: "10px 12px",
          borderRadius: "10px",
          border: "1px solid #e2e8f0",
          background: "white",
          color: "#0f172a",
          fontFamily: "Inter, Arial, sans-serif",
          fontSize: "14px",
          appearance: "none",
          WebkitAppearance: "none",
          MozAppearance: "none",
        }}
      >
        <option value="">🎯 Destino</option>
        {nodes.map((n) => (
          <option key={n.id} value={n.id}>
            {n.nombre}
          </option>
        ))}
      </select>

      <button
        onClick={onCalculateRoute}
        disabled={!origen || !destino}
        style={buttonStyle("#0ea5e9", !origen || !destino)}
        onMouseEnter={(e) => {
          if (!e.target.disabled) {
            e.target.style.transform = "translateY(-1px)";
            e.target.style.boxShadow = "0 4px 12px rgba(14, 165, 233, 0.3)";
          }
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = "translateY(0px)";
          e.target.style.boxShadow = "none";
        }}
      >
        📍 Calcular ruta más corta
      </button>

      {/* Botón para parar animación */}
      {isRouteAnimating && (
        <button
          onClick={onStopAnimation}
          style={buttonStyle("#ef4444", false)}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-1px)";
            e.target.style.boxShadow = "0 4px 12px rgba(239, 68, 68, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0px)";
            e.target.style.boxShadow = "none";
          }}
        >
          ⏹️ Parar Animación
        </button>
      )}

      {/* Indicador de animación */}
      {isRouteAnimating && (
        <div style={{
          padding: "6px",
          background: "#d1fae5",
          borderRadius: "6px",
          fontSize: "11px",
          color: "#065f46",
          textAlign: "center",
          fontWeight: "600",
          border: "1px solid #a7f3d0"
        }}>
          🎬 Animando ruta...
        </div>
      )}
    </div>
  </>
);

export default ControlPanel;