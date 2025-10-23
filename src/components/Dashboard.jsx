// Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { checkAuth,logout } from './CheckAuth';

// URL base de la API - VERIFICA QUE ESTÉ CORRECTA
const API_BASE_URL = 'https://8d13dfce1445.ngrok-free.app/api/v1/miUTN/publication';

const Dashboard = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

    // Cargar anuncios al montar el componente
  useEffect(() => {
    if (!checkAuth()) {
      // Si no hay token, redirigimos al login
      logout()
    }
    fetchAnnouncements();
  }, []);

  // Efecto para el slider automático (solo si hay anuncios)
  useEffect(() => {
    if (announcements.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % announcements.length);
      }, 5000); // Aumenté a 5 segundos

      return () => clearInterval(interval);
    }
  }, [announcements.length]);

  // FETCH: Obtener anuncios publicados con mejor manejo de errores
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Iniciando fetch a:', `${API_BASE_URL}/findAll`);
      
      // Agregar timeout para evitar esperas infinitas
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout

      const response = await fetch(`${API_BASE_URL}/findAll`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Datos recibidos:', data);
      
      function quitarHora(fechaConHora) {
        if(fechaConHora != null)
          return fechaConHora.split('T')[0];
        else
          return null;
      }

      // Filtrar solo los anuncios publicados y mapear datos
      const publishedAnnouncements = data
        .filter(item => item.hidden) // Solo anuncios publicados
        .map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          date: quitarHora(item.expirationDate) || "Sin fecha",
          important: item.priority,
          content: item.content,
          image: item.image,
          expirationDate: quitarHora(item.expirationDate)
        }))
        .slice(0, 6); // Limitar a 6 anuncios para el slider

      console.log('Anuncios publicados mapeados:', publishedAnnouncements);
      setAnnouncements(publishedAnnouncements);
      
    } catch (err) {
      console.error('Error completo en fetch:', err);
      
      if (err.name === 'AbortError') {
        setError('La solicitud tardó demasiado tiempo. Verifica tu conexión.');
      } else if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
        setError('Error de conexión. Verifica: 1) Tu conexión a internet, 2) Que la URL de la API sea correcta, 3) Que ngrok esté activo');
      } else {
        setError(`Error al cargar los anuncios: ${err.message}`);
      }
      
      // Datos de ejemplo en caso de error
      setAnnouncements([
        {
          id: 1,
          title: "Sistema en Mantenimiento",
          description: "Estamos teniendo dificultades técnicas. Los anuncios se cargarán pronto.",
          date: new Date().toISOString().split('T')[0],
          important: true
        },
        {
          id: 2,
          title: "Bienvenido al Sistema",
          description: "Usa los botones superiores para gestionar anuncios, materias y profesores.",
          date: new Date().toISOString().split('T')[0],
          important: false
        }
      ]);
    } finally {
      setLoading(false);
    }
  };



  const nextSlide = () => {
    if (announcements.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % announcements.length);
    }
  };

  const prevSlide = () => {
    if (announcements.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + announcements.length) % announcements.length);
    }
  };

  const handleAnnouncementsClick = () => {
    navigate('/announcements');
  };

  const handleMateriasClick = () => {
    navigate('/materias');
  };

  const handleProfesoresClick = () => {
    navigate('/profesores');
  };

  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString || dateString === "Sin fecha") return "Fecha no disponible";
    
    try {
      const options = { day: 'numeric', month: 'short', year: 'numeric' };
      return new Date(dateString).toLocaleDateString('es-ES', options);
    } catch {
      return "Fecha inválida";
    }
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1 className="logo">MiUTN</h1>
          <button className="logout-btn" onClick={logout}>Salir</button>
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
            
            <button className="main-btn materias-btn" onClick={handleMateriasClick}>
              <span className="btn-text">Materias</span>
            </button>
            
            <button className="main-btn professores-btn" onClick={handleProfesoresClick}>
              <span className="btn-text">Profesores</span>
            </button>
          </div>
        </div>

        {/* Slider de Anuncios */}
        <div className="slider-section">
          <div className="slider-container">
            {loading ? (
              <div className="loading-message">
                <div className="loading-spinner"></div>
                <p>Cargando anuncios...</p>
              </div>
            ) : error ? (
              <div className="error-message">
                <div className="error-icon">⚠️</div>
                <h4>Error de Conexión</h4>
                <p>{error}</p>
                <div className="error-actions">
                  <button onClick={fetchAnnouncements} className="retry-btn">
                    Reintentar Conexión
                  </button>
                  <button 
                    onClick={() => setError(null)} 
                    className="continue-btn"
                  >
                    Continuar Sin Conexión
                  </button>
                </div>
              </div>
            ) : announcements.length === 0 ? (
              <div className="no-announcements">
                <div className="no-data-icon">📢</div>
                <p>No hay anuncios publicados en este momento.</p>
                <button onClick={handleAnnouncementsClick} className="create-announcement-btn">
                  Crear Primer Anuncio
                </button>
              </div>
            ) : (
              <>
                
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
                            <span className="announcement-date">
                              {formatDate(announcement.date)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Controles del Slider (solo si hay más de 1 anuncio) */}
                {announcements.length > 1 && (
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
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;