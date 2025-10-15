// src/components/Layout/Sidebar.jsx
import React from 'react';
import './Sidebar.css';

const Sidebar = ({ activeItem, onItemClick, onBack, onLogout }) => {
  const menuItems = [
    { id: 'announcements', label: 'Anuncios', icon: '●' },
    { id: 'materias', label: 'Materias', icon: '●' },
    { id: 'profesores', label: 'Profesores', icon: '●' }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>MiUTN</h2>
      </div>
      
      <nav className="sidebar-nav">
        {/* Botón Volver arriba */}
        <button className="nav-item back-item" onClick={onBack}>
          <span className="nav-icon">←</span>
          <span className="nav-text">Volver</span>
        </button>
        
        <div className="nav-divider"></div>
        
        {/* Menú principal */}
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${activeItem === item.id ? 'active' : ''}`}
            onClick={() => onItemClick(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-text">{item.label}</span>
          </button>
        ))}
        
        <div className="nav-divider"></div>
        
        {/* Botón Salir abajo */}
        <button className="nav-item logout-item" onClick={onLogout}>
          <span className="nav-icon">×</span>
          <span className="nav-text">Salir</span>
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;