// src/components/Layout/Sidebar.jsx (VERSIÓN MEJORADA)
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ activeItem, onItemClick, onBack, onLogout }) => {
  const navigate = useNavigate();

  const menuItems = [
    { id: 'announcements', label: 'Anuncios', icon: '●', path: '/announcements' },
    { id: 'materias', label: 'Materias', icon: '●', path: '/materias' },
    { id: 'profesores', label: 'Profesores', icon: '●', path: '/profesores' },
    { id: 'mapa', label: 'Mapa', icon: '●', path: '/planoviewer' }
  ];

  const handleMenuItemClick = (itemId, itemPath) => {
    // Actualizar el ítem activo si se proporciona la función
    if (onItemClick) {
      onItemClick(itemId);
    }
    // Navegar a la ruta correspondiente
    navigate(itemPath);
  };

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      // Navegación por defecto si no se proporciona onBack
      navigate(-1); // Volver a la página anterior
    }
  };

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    } else {
      // Navegación por defecto si no se proporciona onLogout
      navigate('/login');
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>MiUTN</h2>
      </div>
      
      <nav className="sidebar-nav">
        {/* Botón Volver arriba */}
        <button className="nav-item back-item" onClick={handleBackClick}>
          <span className="nav-icon">←</span>
          <span className="nav-text">Volver</span>
        </button>
        
        <div className="nav-divider"></div>
        
        {/* Menú principal */}
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${activeItem === item.id ? 'active' : ''}`}
            onClick={() => handleMenuItemClick(item.id, item.path)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-text">{item.label}</span>
          </button>
        ))}
        
        <div className="nav-divider"></div>
        
        {/* Botón Salir abajo */}
        <button className="nav-item logout-item" onClick={handleLogoutClick}>
          <span className="nav-icon">×</span>
          <span className="nav-text">Salir</span>
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;