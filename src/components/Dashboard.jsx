// Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  // Datos de ejemplo para los anuncios académicos
  const announcements = [
    {
      id: 1,
      title: "Inicio del Segundo Cuatrimestre",
      description: "Las clases del segundo cuatrimestre comenzarán el 15 de agosto. Revisa tu horario en el sistema.",
      date: "10 Ago 2024",
      important: true
    },
    {
      id: 2,
      title: "Convocatoria a Becas 2024",
      description: "Abierta la convocatoria para becas de excelencia académica. Postúlate hasta el 30 de agosto.",
      date: "05 Ago 2024",
      important: true
    },
    {
      id: 3,
      title: "Mantenimiento del Sistema",
      description: "El sistema estará en mantenimiento el próximo sábado de 2:00 AM a 6:00 AM.",
      date: "01 Ago 2024",
      important: false
    },
    {
      id: 4,
      title: "Talleres de Programación",
      description: "Inscripciones abiertas para los talleres de programación avanzada. Cupos limitados.",
      date: "28 Jul 2024",
      important: false
    }
  ];

  // Efecto para el slider automático
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % announcements.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [announcements.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % announcements.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + announcements.length) % announcements.length);
  };

  const handleAnnouncementsClick = () => {
    navigate('/announcements');
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1 className="logo">MiUTN</h1>
          <button className="logout-btn">Salir</button>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="dashboard-main">
        <div className="panel-title">
          <h2>Panel Principal</h2>
        </div>

        {/* Botones Principales */}
        <div className="buttons-container">
          <div className="main-buttons">
            <button className="main-btn anuncios-btn" onClick={handleAnnouncementsClick}>
              <span className="btn-text">Anuncios</span>
            </button>
            
            <button className="main-btn materias-btn">
              <span className="btn-text">Materias</span>
            </button>
            
            <button className="main-btn professores-btn">
              <span className="btn-text">Profesores</span>
            </button>
          </div>
        </div>

        {/* Slider de Anuncios */}
        <div className="slider-section">
          <div className="slider-container">
            <div className="slider">
              <div 
                className="slider-track" 
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="slide">
                    <div className={`announcement-card ${announcement.important ? 'important' : ''}`}>
                      <div className="announcement-content">
                        {announcement.important && (
                          <div className="important-badge">¡Importante!</div>
                        )}
                        <h3>{announcement.title}</h3>
                        <p>{announcement.description}</p>
                        <span className="announcement-date">{announcement.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Controles del Slider */}
            <div className="slider-controls">
              <button className="slider-arrow prev-arrow" onClick={prevSlide}>
                ‹
              </button>
              
              <div className="slider-indicators">
                {announcements.map((_, index) => (
                  <button
                    key={index}
                    className={`indicator ${index === currentSlide ? 'active' : ''}`}
                    onClick={() => setCurrentSlide(index)}
                  />
                ))}
              </div>
              
              <button className="slider-arrow next-arrow" onClick={nextSlide}>
                ›
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;