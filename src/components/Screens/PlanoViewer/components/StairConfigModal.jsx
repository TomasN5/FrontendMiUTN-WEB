// En StairConfigModal.jsx - REEMPLAZAR el componente completo
import React, { useState, useEffect } from 'react';
import { CARRERAS, PISOS, TIPOS_DESTINO_ESCALERA } from '../utils/constants';
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
    tipoDestino: TIPOS_DESTINO_ESCALERA.UNICO,
    // Para destino único (compatibilidad hacia atrás)
    carreraDestino: CARRERAS.SISTEMAS,
    pisoDestino: PISOS.PISO2,
    // Para destinos múltiples
    destinosMultiples: [
      { carrera: CARRERAS.SISTEMAS, piso: PISOS.PISO2, direccion: "subida" }
    ],
    nombre: "Escalera",
    direccion: "ambos"
  });

  useEffect(() => {
    if (initialData) {
      // Detectar si es una escalera con destinos múltiples
      const tieneDestinosMultiples = Array.isArray(initialData.destinos) && initialData.destinos.length > 0;
      
      setConfig({
        carreraActual: initialData.carreraActual || CARRERAS.SISTEMAS,
        pisoActual: initialData.pisoActual || PISOS.PISO1,
        tipoDestino: tieneDestinosMultiples ? TIPOS_DESTINO_ESCALERA.MULTIPLE : TIPOS_DESTINO_ESCALERA.UNICO,
        carreraDestino: initialData.carreraDestino || CARRERAS.SISTEMAS,
        pisoDestino: initialData.pisoDestino || PISOS.PISO2,
        destinosMultiples: tieneDestinosMultiples ? initialData.destinos : [
          { 
            carrera: initialData.carreraDestino || CARRERAS.SISTEMAS, 
            piso: initialData.pisoDestino || PISOS.PISO2, 
            direccion: initialData.direccion || "ambos" 
          }
        ],
        nombre: initialData.nombre || "Escalera",
        direccion: initialData.direccion || "ambos"
      });
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleSave = () => {
    // Preparar datos para guardar
    const datosGuardar = {
      ...config,
      // Para compatibilidad, mantener carreraDestino y pisoDestino
      carreraDestino: config.tipoDestino === TIPOS_DESTINO_ESCALERA.UNICO ? 
        config.carreraDestino : config.destinosMultiples[0]?.carrera,
      pisoDestino: config.tipoDestino === TIPOS_DESTINO_ESCALERA.UNICO ? 
        config.pisoDestino : config.destinosMultiples[0]?.piso,
      // Nuevo campo para destinos múltiples
      destinos: config.tipoDestino === TIPOS_DESTINO_ESCALERA.MULTIPLE ? 
        config.destinosMultiples : null
    };
    
    onSave(datosGuardar);
  };

  const agregarDestino = () => {
    setConfig(prev => ({
      ...prev,
      destinosMultiples: [
        ...prev.destinosMultiples,
        { carrera: CARRERAS.SISTEMAS, piso: PISOS.PISO1, direccion: "ambos" }
      ]
    }));
  };

  const eliminarDestino = (index) => {
    setConfig(prev => ({
      ...prev,
      destinosMultiples: prev.destinosMultiples.filter((_, i) => i !== index)
    }));
  };

  const actualizarDestino = (index, campo, valor) => {
    setConfig(prev => ({
      ...prev,
      destinosMultiples: prev.destinosMultiples.map((destino, i) => 
        i === index ? { ...destino, [campo]: valor } : destino
      )
    }));
  };

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

        <div className="stair-modal__section stair-modal__section--destination-type">
          <h4 className="stair-modal__section-title">🎯 Tipo de Destino</h4>
          <div className="stair-modal__radio-group">
            <label className="stair-modal__radio-label">
              <input
                type="radio"
                value={TIPOS_DESTINO_ESCALERA.UNICO}
                checked={config.tipoDestino === TIPOS_DESTINO_ESCALERA.UNICO}
                onChange={(e) => setConfig({...config, tipoDestino: e.target.value})}
                className="stair-modal__radio"
              />
              <span className="stair-modal__radio-text">Destino Único</span>
            </label>
            
            <label className="stair-modal__radio-label">
              <input
                type="radio"
                value={TIPOS_DESTINO_ESCALERA.MULTIPLE}
                checked={config.tipoDestino === TIPOS_DESTINO_ESCALERA.MULTIPLE}
                onChange={(e) => setConfig({...config, tipoDestino: e.target.value})}
                className="stair-modal__radio"
              />
              <span className="stair-modal__radio-text">Múltiples Destinos</span>
            </label>
          </div>
        </div>

        {config.tipoDestino === TIPOS_DESTINO_ESCALERA.UNICO ? (
          <div className="stair-modal__section stair-modal__section--single-destination">
            <h4 className="stair-modal__section-title">🎯 Destino Único</h4>
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
        ) : (
          <div className="stair-modal__section stair-modal__section--multiple-destinations">
            <h4 className="stair-modal__section-title">
              🎯 Destinos Múltiples ({config.destinosMultiples.length})
            </h4>
            
            {config.destinosMultiples.map((destino, index) => (
              <div key={index} className="stair-modal__destination-item">
                <div className="stair-modal__destination-header">
                  <h5>Destino {index + 1}</h5>
                  {config.destinosMultiples.length > 1 && (
                    <button
                      type="button"
                      onClick={() => eliminarDestino(index)}
                      className="stair-modal__delete-destination"
                    >
                      🗑️
                    </button>
                  )}
                </div>
                
                <div className="stair-modal__row">
                  <div className="stair-modal__column">
                    <label className="stair-modal__label">Carrera:</label>
                    <select
                      value={destino.carrera}
                      onChange={(e) => actualizarDestino(index, 'carrera', e.target.value)}
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
                      value={destino.piso}
                      onChange={(e) => actualizarDestino(index, 'piso', e.target.value)}
                      className="stair-modal__select"
                    >
                      {Object.values(PISOS).map(piso => (
                        <option key={piso} value={piso}>
                          {piso}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="stair-modal__column">
                    <label className="stair-modal__label">Dirección:</label>
                    <select
                      value={destino.direccion}
                      onChange={(e) => actualizarDestino(index, 'direccion', e.target.value)}
                      className="stair-modal__select"
                    >
                      <option value="ambos">⬆️⬇️ Ambos</option>
                      <option value="subida">⬆️ Solo subida</option>
                      <option value="bajada">⬇️ Solo bajada</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
            
            <button
              type="button"
              onClick={agregarDestino}
              className="stair-modal__add-destination"
            >
              ➕ Agregar otro destino
            </button>
          </div>
        )}

        <div className="stair-modal__summary">
          <div className="stair-modal__summary-title">
            Resumen de Conexiones:
          </div>
          <div className="stair-modal__summary-content">
            <strong>Origen:</strong> {getCarreraNombre(config.carreraActual)} {config.pisoActual}
            <br />
            <strong>Destinos:</strong>
            {config.tipoDestino === TIPOS_DESTINO_ESCALERA.UNICO ? (
              <span> {getCarreraNombre(config.carreraDestino)} {config.pisoDestino}</span>
            ) : (
              <ul>
                {config.destinosMultiples.map((destino, index) => (
                  <li key={index}>
                    {getCarreraNombre(destino.carrera)} {destino.piso} 
                    {destino.direccion !== "ambos" && ` (${destino.direccion})`}
                  </li>
                ))}
              </ul>
            )}
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