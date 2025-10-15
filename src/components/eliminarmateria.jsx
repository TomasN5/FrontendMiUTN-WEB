import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Materias.css';

export default function EliminarMateria({ onConfirm, onCancel }) {

      const { nombre } = useParams();
      const navigate = useNavigate();
    
      const colorMateria =
        {
          industrial: '#FFA01C',
          sistemas: '#4A89FF',
          química: '#8A2BE2',
          eléctrica: '#B22222',
          mecánica: '#20B2AA',
          civil: '#228B22'
        }[nombre.toLowerCase()] || '#4A89FF';
    
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <p className="modal-text">¿Confirma eliminar la materia seleccionada?</p>
        <div className="modal-actions">
            <button
            style={{ backgroundColor: colorMateria }}
            onClick={onConfirm}
            >
                Aceptar
            </button>
          <button
          style={{
            color: colorMateria,
            border: `2px solid ${colorMateria}`,
            backgroundColor: 'white'
        }}
        onClick={onCancel}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}