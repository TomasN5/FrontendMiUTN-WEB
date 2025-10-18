import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Styles/sidebar.css';
import { FaBullhorn, FaFileAlt, FaUser } from 'react-icons/fa';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  // Función para determinar si un botón está activo
  const isActive = (path) => location.pathname === path;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>MiUTN</h2>
      </div>

      <nav className="sidebar-nav">
        {/* Botón Volver arriba */}
        <button className="nav-item back-item">
          <span className="nav-icon">←</span>
          <span className="nav-text">Volver</span>
        </button>
        
        <div className="nav-divider"></div>
        <button 
          className={`nav-item ${isActive('/anuncios') ? 'active' : ''}`}
          onClick={() => navigate('/anuncios')}
        >
          <FaBullhorn className="nav-icon" />
          <span className="nav-text">Anuncios</span>
        </button>
        
        <button 
          className={`nav-item ${isActive('/materias') ? 'active' : ''}`}
          onClick={() => navigate('/materias')}
        >
          <FaFileAlt className="nav-icon" />
          <span className="nav-text">Materias</span>
        </button>
        
        <button 
          className={`nav-item ${isActive('/profesores') ? 'active' : ''}`}
          onClick={() => navigate('/profesores')}
        >
          <FaUser className="nav-icon" />
          <span className="nav-text">Profesores</span>
        </button>

        <div className="nav-divider"></div>

        <button 
          className="nav-item logout-item"
          onClick={() => navigate('/')}
        >
          <span className="nav-text">Salir</span>
        </button>
      </nav>
    </aside>
  );
}