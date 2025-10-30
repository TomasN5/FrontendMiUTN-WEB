import React, { useState, useEffect } from 'react';
import { CARRERAS, PISOS } from '../utils/constants';

const StairConfigModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData = {},
  todasLasEscaleras = [] // Nueva prop: lista de todas las escaleras existentes
}) => {
  const [config, setConfig] = useState({
    carreraActual: CARRERAS.SISTEMAS,
    pisoActual: PISOS.PISO1,
    carreraDestino: CARRERAS.SISTEMAS,
    pisoDestino: PISOS.PISO2,
    nombre: "Escalera",
    direccion: "ambos",
    escaleraConectadaId: "" // Nueva: ID de la escalera con la que se conecta
  });

  useEffect(() => {
    if (initialData) {
      setConfig({
        carreraActual: initialData.carreraActual || CARRERAS.SISTEMAS,
        pisoActual: initialData.pisoActual || PISOS.PISO1,
        carreraDestino: initialData.carreraDestino || CARRERAS.SISTEMAS,
        pisoDestino: initialData.pisoDestino || PISOS.PISO2,
        nombre: initialData.nombre || "Escalera",
        direccion: initialData.direccion || "ambos",
        escaleraConectadaId: initialData.escaleraConectadaId || ""
      });
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(config);
  };

  // Filtrar escaleras que pueden conectarse (misma carrera, pisos opuestos)
  const escalerasConectables = todasLasEscaleras.filter(escalera => 
    escalera.carreraActual === config.carreraDestino &&
    escalera.pisoActual === config.pisoDestino &&
    escalera.carreraDestino === config.carreraActual &&
    escalera.pisoDestino === config.pisoActual
  );

  // También incluir escaleras en el mismo destino (para conexión directa)
  const escalerasMismoDestino = todasLasEscaleras.filter(escalera =>
    escalera.carreraActual === config.carreraDestino &&
    escalera.pisoActual === config.pisoDestino &&
    escalera.id !== initialData?.id // Excluir esta misma escalera
  );

  const modalStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000
  };

  const contentStyle = {
    background: "white",
    padding: "24px",
    borderRadius: "12px",
    width: "500px",
    maxWidth: "90vw",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
    fontFamily: "Inter, Arial, sans-serif"
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    marginBottom: "12px",
    fontFamily: "Inter, Arial, sans-serif",
    fontSize: "14px"
  };

  const labelStyle = {
    display: "block",
    marginBottom: "6px",
    fontWeight: "600",
    color: "#374151",
    fontSize: "14px"
  };

  const buttonStyle = (backgroundColor) => ({
    padding: "10px 16px",
    background: backgroundColor,
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    marginRight: "8px",
    fontSize: "14px"
  });

  const getCarreraNombre = (carreraKey) => {
    const nombres = {
      [CARRERAS.SISTEMAS]: "Sistemas",
      [CARRERAS.QUIMICA]: "Química",
      [CARRERAS.MECANICA]: "Mecánica",
      [CARRERAS.CIVIL]: "Civil",
      [CARRERAS.INDUSTRIAL]: "Industrial",
      [CARRERAS.ELECTRICA]: "Eléctrica"
    };
    return nombres[carreraKey] || carreraKey;
  };

  return (
    <div style={modalStyle}>
      <div style={contentStyle}>
        <h3 style={{ margin: "0 0 20px 0", color: "#1f2937" }}>
          ⬆️⬇️ Configurar Escalera
        </h3>
        
        <div>
          <label style={labelStyle}>Nombre de la escalera:</label>
          <input
            type="text"
            value={config.nombre}
            onChange={(e) => setConfig({...config, nombre: e.target.value})}
            style={inputStyle}
            placeholder="Ej: Escalera Principal Sistemas"
          />
        </div>

        {/* CONFIGURACIÓN ORIGEN */}
        <div style={{ marginBottom: "16px", padding: "12px", background: "#f8fafc", borderRadius: "8px" }}>
          <h4 style={{ margin: "0 0 12px 0", color: "#475569", fontSize: "14px" }}>📍 Origen</h4>
          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Carrera:</label>
              <select
                value={config.carreraActual}
                onChange={(e) => setConfig({...config, carreraActual: e.target.value})}
                style={inputStyle}
              >
                {Object.values(CARRERAS).map(carrera => (
                  <option key={carrera} value={carrera}>
                    {getCarreraNombre(carrera)}
                  </option>
                ))}
              </select>
            </div>
            
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Piso:</label>
              <select
                value={config.pisoActual}
                onChange={(e) => setConfig({...config, pisoActual: e.target.value})}
                style={inputStyle}
              >
                {Object.values(PISOS).map(piso => (
                  <option key={piso} value={piso}>
                    {piso}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* CONFIGURACIÓN DESTINO */}
        <div style={{ marginBottom: "16px", padding: "12px", background: "#f8fafc", borderRadius: "8px" }}>
          <h4 style={{ margin: "0 0 12px 0", color: "#475569", fontSize: "14px" }}>🎯 Destino</h4>
          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Carrera:</label>
              <select
                value={config.carreraDestino}
                onChange={(e) => setConfig({...config, carreraDestino: e.target.value})}
                style={inputStyle}
              >
                {Object.values(CARRERAS).map(carrera => (
                  <option key={carrera} value={carrera}>
                    {getCarreraNombre(carrera)}
                  </option>
                ))}
              </select>
            </div>
            
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Piso:</label>
              <select
                value={config.pisoDestino}
                onChange={(e) => setConfig({...config, pisoDestino: e.target.value})}
                style={inputStyle}
              >
                {Object.values(PISOS).map(piso => (
                  <option key={piso} value={piso}>
                    {piso}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* SELECTOR DE CONEXIÓN CON OTRA ESCALERA */}
        <div style={{ marginBottom: "16px", padding: "12px", background: "#e0f2fe", borderRadius: "8px" }}>
          <h4 style={{ margin: "0 0 12px 0", color: "#0369a1", fontSize: "14px" }}>🔗 Conectar con Escalera Existente</h4>
          
          {escalerasConectables.length > 0 ? (
            <div>
              <label style={labelStyle}>Escalera gemela (conexión automática):</label>
              <select
                value={config.escaleraConectadaId}
                onChange={(e) => setConfig({...config, escaleraConectadaId: e.target.value})}
                style={inputStyle}
              >
                <option value="">Seleccionar escalera gemela...</option>
                {escalerasConectables.map(escalera => (
                  <option key={escalera.id} value={escalera.id}>
                    {escalera.nombre} ({getCarreraNombre(escalera.carreraActual)} {escalera.pisoActual})
                  </option>
                ))}
              </select>
              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                ⚡ Conexión bidireccional automática
              </div>
            </div>
          ) : escalerasMismoDestino.length > 0 ? (
            <div>
              <label style={labelStyle}>Conectar con escalera en destino:</label>
              <select
                value={config.escaleraConectadaId}
                onChange={(e) => setConfig({...config, escaleraConectadaId: e.target.value})}
                style={inputStyle}
              >
                <option value="">Seleccionar escalera en destino...</option>
                {escalerasMismoDestino.map(escalera => (
                  <option key={escalera.id} value={escalera.id}>
                    {escalera.nombre} ({getCarreraNombre(escalera.carreraActual)} {escalera.pisoActual})
                  </option>
                ))}
              </select>
              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                🔄 Conexión manual - verificar configuración
              </div>
            </div>
          ) : (
            <div style={{ fontSize: "12px", color: "#64748b", textAlign: "center" }}>
              No hay escaleras disponibles para conectar en el destino
            </div>
          )}
        </div>

        <div>
          <label style={labelStyle}>Dirección:</label>
          <select
            value={config.direccion}
            onChange={(e) => setConfig({...config, direccion: e.target.value})}
            style={inputStyle}
          >
            <option value="ambos">⬆️⬇️ Ambos sentidos</option>
            <option value="subida">⬆️ Solo subida</option>
            <option value="bajada">⬇️ Solo bajada</option>
          </select>
        </div>

        {/* Resumen de la conexión */}
        <div style={{ 
          marginTop: "16px", 
          padding: "12px", 
          background: config.escaleraConectadaId ? "#dbeafe" : "#fef3c7", 
          borderRadius: "8px",
          border: config.escaleraConectadaId ? "1px solid #93c5fd" : "1px solid #fcd34d"
        }}>
          <div style={{ fontSize: "12px", color: config.escaleraConectadaId ? "#1e40af" : "#92400e", fontWeight: "600" }}>
            {config.escaleraConectadaId ? "🔗 CONEXIÓN CONFIGURADA" : "⚠️ CONEXIÓN PENDIENTE"}
          </div>
          <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
            {getCarreraNombre(config.carreraActual)} {config.pisoActual} → {getCarreraNombre(config.carreraDestino)} {config.pisoDestino}
            {config.escaleraConectadaId && " • Conectada con escalera existente"}
          </div>
        </div>

        <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
          <button 
            onClick={onClose}
            style={buttonStyle("#6b7280")}
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            style={buttonStyle("#dc2626")}
          >
            💾 Guardar Escalera
          </button>
        </div>
      </div>
    </div>
  );
};

export default StairConfigModal;