import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './buttonconfirm.css';

export default function EliminarMateria({ onConfirm, onCancel }) {
  const { nombre } = useParams();
  const navigate = useNavigate();

  const colorMateria = {
    industrial: '#FFA01C',
    sistemas: '#4A89FF',
    química: '#8A2BE2',
    eléctrica: '#B22222',
    mecánica: '#20B2AA',
    civil: '#228B22'
  }[nombre.toLowerCase()] || '#4A89FF';

  return (
    <div className="eliminar-modal-overlay">
      <div className="eliminar-modal-content">
        <div className="eliminar-modal-header">
          <h3>Confirmar Eliminación</h3>
        </div>
        <div className="eliminar-modal-body">
          <p>¿Confirma eliminar la materia seleccionada?</p>
        </div>
        <div className="eliminar-modal-actions">
          <button
            className="eliminar-btn accept"
            style={{ 
              background: `linear-gradient(135deg, ${colorMateria} 0%, ${getDarkerColor(colorMateria)} 100%)`
            }}
            onClick={onConfirm}
          >
            Aceptar
          </button>
          <button
            className="eliminar-btn cancel"
            onClick={onCancel}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

// Función auxiliar para oscurecer el color (puedes ponerla en un archivo de utilidades)
function getDarkerColor(color) {
  // Simple función para oscurecer el color en un 20%
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  const darkerR = Math.floor(r * 0.8).toString(16).padStart(2, '0');
  const darkerG = Math.floor(g * 0.8).toString(16).padStart(2, '0');
  const darkerB = Math.floor(b * 0.8).toString(16).padStart(2, '0');
  
  return `#${darkerR}${darkerG}${darkerB}`;
}