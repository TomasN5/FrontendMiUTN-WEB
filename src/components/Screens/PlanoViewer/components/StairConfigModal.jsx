import React, { useState, useEffect } from 'react';
import { CARRERAS, PISOS } from '../utils/constants';
import './../styles/StairConfigModal.css';

const StairConfigModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData = {},
  todasLasEscaleras = []
}) => {
  const [config, setConfig] = useState({
    carreraActual: CARRERAS.SISTEMAS,
    pisoActual: PISOS.PISO1,
    carreraDestino: CARRERAS.SISTEMAS,
    pisoDestino: PISOS.PISO2,
    nombre: "Escalera",
    direccion: "ambos",
    escaleraConectadaId: ""
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

  const escalerasConectables = todasLasEscaleras.filter(escalera => 
    escalera.carreraActual === config.carreraDestino &&
    escalera.pisoActual === config.pisoDestino &&
    escalera.carreraDestino === config.carreraActual &&
    escalera.pisoDestino === config.pisoActual
  );

  const escalerasMismoDestino = todasLasEscaleras.filter(escalera =>
    escalera.carreraActual === config.carreraDestino &&
    escalera.pisoActual === config.pisoDestino &&
    escalera.id !== initialData?.id
  );

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

  const summaryClass = `stair-modal__summary ${
    config.escaleraConectadaId ? 'stair-modal__summary--connected' : 'stair-modal__summary--pending'
  }`;

  return (
    <div className="stair-modal">
      <div className="stair-modal__content">
        <h3 className="stair-modal__title">
          ⬆️⬇️ Configurar Escalera
        </h3>
        
        <div className="stair-modal__input-group">
          <label className="stair-modal__label">Nombre de la escalera:</label>
          <input
            type="text"
            value={config.nombre}
            onChange={(e) => setConfig({...config, nombre: e.target.value})}
            className="stair-modal__input"
            placeholder="Ej: Escalera Principal Sistemas"
          />
        </div>

        <div className="stair-modal__section stair-modal__section--origin">
          <h4 className="stair-modal__section-title">📍 Origen</h4>
          <div className="stair-modal__row">
            <div className="stair-modal__column">
              <label className="stair-modal__label">Carrera:</label>
              <select
                value={config.carreraActual}
                onChange={(e) => setConfig({...config, carreraActual: e.target.value})}
                className="stair-modal__select"
              >
                {Object.values(CARRERAS).map(carrera => (
                  <option key={carrera} value={carrera}>
                    {getCarreraNombre(carrera)}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="stair-modal__column">
              <label className="stair-modal__label">Piso:</label>
              <select
                value={config.pisoActual}
                onChange={(e) => setConfig({...config, pisoActual: e.target.value})}
                className="stair-modal__select"
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

        <div className="stair-modal__section stair-modal__section--destination">
          <h4 className="stair-modal__section-title">🎯 Destino</h4>
          <div className="stair-modal__row">
            <div className="stair-modal__column">
              <label className="stair-modal__label">Carrera:</label>
              <select
                value={config.carreraDestino}
                onChange={(e) => setConfig({...config, carreraDestino: e.target.value})}
                className="stair-modal__select"
              >
                {Object.values(CARRERAS).map(carrera => (
                  <option key={carrera} value={carrera}>
                    {getCarreraNombre(carrera)}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="stair-modal__column">
              <label className="stair-modal__label">Piso:</label>
              <select
                value={config.pisoDestino}
                onChange={(e) => setConfig({...config, pisoDestino: e.target.value})}
                className="stair-modal__select"
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

        <div className="stair-modal__section stair-modal__section--connection">
          <h4 className="stair-modal__section-title">🔗 Conectar con Escalera Existente</h4>
          
          {escalerasConectables.length > 0 ? (
            <div>
              <label className="stair-modal__label">Escalera gemela (conexión automática):</label>
              <select
                value={config.escaleraConectadaId}
                onChange={(e) => setConfig({...config, escaleraConectadaId: e.target.value})}
                className="stair-modal__select"
              >
                <option value="">Seleccionar escalera gemela...</option>
                {escalerasConectables.map(escalera => (
                  <option key={escalera.id} value={escalera.id}>
                    {escalera.nombre} ({getCarreraNombre(escalera.carreraActual)} {escalera.pisoActual})
                  </option>
                ))}
              </select>
              <div className="stair-modal__connection-info stair-modal__connection-info--success">
                ⚡ Conexión bidireccional automática
              </div>
            </div>
          ) : escalerasMismoDestino.length > 0 ? (
            <div>
              <label className="stair-modal__label">Conectar con escalera en destino:</label>
              <select
                value={config.escaleraConectadaId}
                onChange={(e) => setConfig({...config, escaleraConectadaId: e.target.value})}
                className="stair-modal__select"
              >
                <option value="">Seleccionar escalera en destino...</option>
                {escalerasMismoDestino.map(escalera => (
                  <option key={escalera.id} value={escalera.id}>
                    {escalera.nombre} ({getCarreraNombre(escalera.carreraActual)} {escalera.pisoActual})
                  </option>
                ))}
              </select>
              <div className="stair-modal__connection-info stair-modal__connection-info--warning">
                🔄 Conexión manual - verificar configuración
              </div>
            </div>
          ) : (
            <div className="stair-modal__empty-state">
              No hay escaleras disponibles para conectar en el destino
            </div>
          )}
        </div>

        <div className="stair-modal__input-group">
          <label className="stair-modal__label">Dirección:</label>
          <select
            value={config.direccion}
            onChange={(e) => setConfig({...config, direccion: e.target.value})}
            className="stair-modal__select"
          >
            <option value="ambos">⬆️⬇️ Ambos sentidos</option>
            <option value="subida">⬆️ Solo subida</option>
            <option value="bajada">⬇️ Solo bajada</option>
          </select>
        </div>

        <div className={summaryClass}>
          <div>
            {config.escaleraConectadaId ? "🔗 CONEXIÓN CONFIGURADA" : "⚠️ CONEXIÓN PENDIENTE"}
          </div>
          <div className="stair-modal__summary-details">
            {getCarreraNombre(config.carreraActual)} {config.pisoActual} → {getCarreraNombre(config.carreraDestino)} {config.pisoDestino}
            {config.escaleraConectadaId && " • Conectada con escalera existente"}
          </div>
        </div>

        <div className="stair-modal__actions">
          <button 
            onClick={onClose}
            className="stair-modal__button stair-modal__button--cancel"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            className="stair-modal__button stair-modal__button--save"
          >
            💾 Guardar Escalera
          </button>
        </div>
      </div>
    </div>
  );
};

export default StairConfigModal;