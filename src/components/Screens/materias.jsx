import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './materias.css';
import Sidebar from '../Layouts/Sidebar';
import { checkAuth,logout } from './../CheckAuth';

const materias = [
  { nombre: 'Civil', clase: 'civil', id: 'civil' },
  { nombre: 'Eléctrica', clase: 'electrica', id: 'electrica' },
  { nombre: 'Industrial', clase: 'industrial', id: 'industrial' },
  { nombre: 'Mecánica', clase: 'mecanica', id: 'mecanica' },
  { nombre: 'Química', clase: 'quimica', id: 'quimica' },
  { nombre: 'Sistemas', clase: 'sistemas', id: 'sistemas' }
];

export default function Materias() {
  const navigate = useNavigate();
  const [activeMenuItem, setActiveMenuItem] = useState('materias');


  useEffect(() => {
      if (!checkAuth()) {
            // Si no hay token, redirigimos al login
            logout()
      }});
  // Cambiar esta función para navegar a detallemateria
  const handleClick = (carreraId) => {
    navigate(`/materias/${carreraId}`);
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
          {materias.map((materia) => (
            <button
              key={materia.id}
              className={`materia-btn ${materia.clase}`}
              onClick={() => handleClick(materia.id)}
            >
              {materia.nombre}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}