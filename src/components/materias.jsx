import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Materias.css';
import Sidebar from '../components/sidebar.jsx';

const materias = [
  { nombre: 'Civil', color: '#228B22' },
  { nombre: 'Eléctrica', color: '#B22222' },
  { nombre: 'Industrial', color: '#FFA01C' },
  { nombre: 'Mecánica', color: '#20B2AA' },
  { nombre: 'Química', color: '#8A2BE2' },
  { nombre: 'Sistemas', color: '#4A89FF' }
];

export default function Materias() {
  const navigate = useNavigate();

  const handleClick = (nombre) => {
    navigate(`/materia/${nombre.toLowerCase()}`);
  };

  return (
    <>
      <Sidebar />
      <div className="materias-container">
        <h2 className="subtitle">Materias</h2>
        <p>Seleccionar la carrera para visualizar las materias correspondientes</p>
        <div className="grid">
          {materias.map((m) => (
            <button
              key={m.nombre}
              className="materia-btn"
              style={{ backgroundColor: m.color }}
              onClick={() => handleClick(m.nombre)}
            >
              {m.nombre}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}