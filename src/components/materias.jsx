import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Styles/materias.css';
import Sidebar from './Layouts/Sidebar';

const materias = [
  { nombre: 'Civil', clase: 'civil' },
  { nombre: 'Eléctrica', clase: 'electrica' },
  { nombre: 'Industrial', clase: 'industrial' },
  { nombre: 'Mecánica', clase: 'mecanica' },
  { nombre: 'Química', clase: 'quimica' },
  { nombre: 'Sistemas', clase: 'sistemas' }
];

export default function Materias() {
  const navigate = useNavigate();
  const [activeMenuItem, setActiveMenuItem] = useState('materias');


  const handleClick = (nombre) => {
    navigate(`/materia/${nombre.toLowerCase()}`);
  };
  const handleBackToDashboard = () => {
      navigate('/dashboard');
    };
    const handleMenuItemClick = (itemId) => {
    setActiveMenuItem(itemId);
  };
    const handleLogout = () => {
    navigate('/login');
  };


  return (
    <>
      <Sidebar
        activeItem={activeMenuItem}
        onItemClick={handleMenuItemClick}
        onBack={handleBackToDashboard}
        onLogout={handleLogout}
      />
      <div className="materias-container">
        <h2 className="subtitle">Materias</h2>
        <p>Seleccionar la carrera para visualizar las materias correspondientes</p>
        <div className="grid">
          {materias.map((m) => (
            <button
              key={m.nombre}
              className={`materia-btn ${m.clase}`}
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