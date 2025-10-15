import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Materias.css';
import logoUTN from '../images/logoUTN.png';
import { FaBullhorn, FaFileAlt, FaUser } from 'react-icons/fa';

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="logo-container">
          <img src={logoUTN} alt="Logo UTN" className="logo" />
          <h1 className="title">MiUTN</h1>
        </div>

        <nav className="nav-menu">
          <button className="nav-btn" onClick={() => navigate('/anuncios')}>
            <FaBullhorn className="icon" />
            Anuncios
          </button>
          <button className="nav-btn" onClick={() => navigate('/materias')}>
            <FaFileAlt className="icon" />
            Materias
          </button>
          <button className="nav-btn" onClick={() => navigate('/profesores')}>
            <FaUser className="icon" />
            Profesores
          </button>
        </nav>
      </div>

      <div className="sidebar-bottom">
        <button className="salir-btn" onClick={() => navigate('/')}>
          Salir
        </button>
      </div>
    </aside>
  );
}