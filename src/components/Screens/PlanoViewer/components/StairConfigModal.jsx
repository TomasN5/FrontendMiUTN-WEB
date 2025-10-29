import React, { useState, useEffect } from 'react';
import { CARRERAS, PISOS } from '../utils/constants';

const StairConfigModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData = {} 
}) => {
  const [config, setConfig] = useState({
    carreraActual: CARRERAS.SISTEMAS,
    pisoActual: PISOS.PISO1,
    carreraDestino: CARRERAS.SISTEMAS,
    pisoDestino: PISOS.PISO2,
    nombre: "Escalera",
    direccion: "ambos"
  });

  useEffect(() => {
    if (initialData) {
      setConfig({
        carreraActual: initialData.carreraActual || CARRERAS.SISTEMAS,
        pisoActual: initialData.pisoActual || PISOS.PISO1,
        carreraDestino: initialData.carreraDestino || CARRERAS.SISTEMAS,
        pisoDestino: initialData.pisoDestino || PISOS.PISO2,
        nombre: initialData.nombre || "Escalera",
        direccion: initialData.direccion || "ambos"
      });
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(config);
  };

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
    width: "450px",
    maxWidth: "90vw",
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

  // Función para obtener el nombre completo de la carrera
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
          background: "#dbeafe", 
          borderRadius: "8px",
          border: "1px solid #93c5fd"
        }}>
          <div style={{ fontSize: "12px", color: "#1e40af", fontWeight: "600" }}>
            Conexión: {getCarreraNombre(config.carreraActual)} {config.pisoActual} → {getCarreraNombre(config.carreraDestino)} {config.pisoDestino}
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