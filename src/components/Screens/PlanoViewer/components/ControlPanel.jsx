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
  onToggleEdit,
  onChangeType,
  onChangeName,
  onSaveArea,
  onSavePoints,
  onUndo,
  onCancel,
  onCalculateRoute,
  onOriginChange,
  onDestinationChange
}) => {
  const nodes = [...areas.filter(a => a.tipo !== AREA_TYPES.PASILLO), ...points];

  return (
    <div style={CONTROL_PANEL_STYLE}>
      <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>
        Acciones
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
          <option value={AREA_TYPES.PUNTO}>Punto</option>
          <option value={AREA_TYPES.PASILLO}>Pasillo</option>
        </select>

        {modoEdicion && tipoActual !== AREA_TYPES.PASILLO && (
          <input
            type="text"
            placeholder="Nombre"
            value={nombreArea}
            onChange={(e) => onChangeName(e.target.value)}
            style={inputStyle}
          />
        )}
      </div>

      {!modoEdicion ? (
        <button onClick={onToggleEdit} style={buttonStyle("#2563eb")}>
          ✏️ Entrar en edición
        </button>
      ) : (
        <EditModeActions
          tipoActual={tipoActual}
          puntosTemporales={puntosTemporales}
          onSaveArea={onSaveArea}
          onSavePoints={onSavePoints}
          onUndo={onUndo}
          onCancel={onCancel}
        />
      )}

      <GPSPanel
        origen={origen}
        destino={destino}
        nodes={nodes}
        onOriginChange={onOriginChange}
        onDestinationChange={onDestinationChange}
        onCalculateRoute={onCalculateRoute}
      />
    </div>
  );
};

const EditModeActions = ({
  tipoActual,
  puntosTemporales,
  onSaveArea,
  onSavePoints,
  onUndo,
  onCancel
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
    {tipoActual !== AREA_TYPES.PASILLO && tipoActual !== AREA_TYPES.PUNTO && (
      <button
        onClick={onSaveArea}
        disabled={puntosTemporales.length < 3}
        style={buttonStyle(
          puntosTemporales.length < 3 ? "#94a3b8" : "#10b981",
          puntosTemporales.length < 3
        )}
      >
        💾 Guardar área
      </button>
    )}

    {tipoActual === AREA_TYPES.PUNTO && (
      <button
        onClick={onSavePoints}
        disabled={puntosTemporales.length === 0}
        style={buttonStyle(
          puntosTemporales.length === 0 ? "#94a3b8" : "#10b981",
          puntosTemporales.length === 0
        )}
      >
        💾 Guardar puntos
      </button>
    )}

    {tipoActual !== AREA_TYPES.PASILLO && tipoActual !== AREA_TYPES.PUNTO && (
      <button
        onClick={onUndo}
        disabled={puntosTemporales.length === 0}
        style={buttonStyle(
          puntosTemporales.length === 0 ? "#94a3b8" : "#f59e0b",
          puntosTemporales.length === 0
        )}
      >
        ↩️ Deshacer punto
      </button>
    )}

    <button onClick={onCancel} style={buttonStyle("#ef4444")}>
      ❌ Cancelar
    </button>
  </div>
);

const GPSPanel = ({
  origen,
  destino,
  nodes,
  onOriginChange,
  onDestinationChange,
  onCalculateRoute
}) => (
  <>
    <h3 style={{ margin: "6px 0 0 0", fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
      GPS
    </h3>
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <select
        value={origen}
        onChange={(e) => onOriginChange(e.target.value)}
        style={selectStyle(false)}
      >
        <option value="">Origen</option>
        {nodes.map((n) => (
          <option key={n.id} value={n.id}>
            {n.nombre}
          </option>
        ))}
      </select>

      <select
        value={destino}
        onChange={(e) => onDestinationChange(e.target.value)}
        style={selectStyle(false)}
      >
        <option value="">Destino</option>
        {nodes.map((n) => (
          <option key={n.id} value={n.id}>
            {n.nombre}
          </option>
        ))}
      </select>

      <button
        onClick={onCalculateRoute}
        disabled={!origen || !destino}
        style={buttonStyle(
          !origen || !destino ? "#94a3b8" : "#0ea5e9",
          !origen || !destino
        )}
      >
        📍 Calcular ruta
      </button>
    </div>
  </>
);

// Estilos reutilizables
const selectStyle = (disabled) => ({
  flex: 1,
  padding: "8px",
  borderRadius: "10px",
  border: "1px solid #e6e9ef",
  background: disabled ? "#f3f4f6" : "white",
  color: "#0f172a",
  appearance: "none",
  WebkitAppearance: "none",
  MozAppearance: "none",
});

const inputStyle = {
  flex: 1,
  padding: "8px",
  borderRadius: "10px",
  border: "1px solid #e6e9ef",
  background: "white",
  color: "#0f172a"
};

const buttonStyle = (backgroundColor, disabled = false) => ({
  padding: "10px",
  background: backgroundColor,
  color: "white",
  border: "none",
  borderRadius: "10px",
  cursor: disabled ? "not-allowed" : "pointer",
  fontWeight: 700
});

export default ControlPanel;