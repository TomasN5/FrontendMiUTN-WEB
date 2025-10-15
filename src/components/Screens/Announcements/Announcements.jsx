import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Announcements.css';
import AnnouncementForm from './AnnouncementForm';

const Announcements = () => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      title: "Inscripcion 2026",
      endDate: "Permanente",
      published: true
    },
    {
      id: 2,
      title: "Charlas Magistrales",
      endDate: "10/11/2025",
      published: true
    },
    {
      id: 3,
      title: "Cena Egresados",
      endDate: "1/12/2025",
      published: false
    },
    {
      id: 4,
      title: "Final Diciembre",
      endDate: "20/12/2025",
      published: true
    },
    {
      id: 5,
      title: "Curso de ingreso intensivo",
      endDate: "15/2/2026",
      published: false
    }
  ]);

  // Estado para controlar el modal
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const handleAddAnnouncement = () => {
    setEditingAnnouncement(null);
    setShowModal(true);
  };

  const handleEditAnnouncement = (id) => {
    const announcementToEdit = announcements.find(ann => ann.id === id);
    setEditingAnnouncement(announcementToEdit);
    setShowModal(true);
  };

  const handleDeleteAnnouncement = (id) => {
    setAnnouncements(announcements.filter(ann => ann.id !== id));
  };

  const handleSaveAnnouncement = (formData) => {
    if (editingAnnouncement) {
      // Editar anuncio existente
      setAnnouncements(announcements.map(ann => 
        ann.id === editingAnnouncement.id 
          ? { ...ann, ...formData }
          : ann
      ));
    } else {
      // Agregar nuevo anuncio
      const newAnnouncement = {
        id: Math.max(...announcements.map(ann => ann.id)) + 1,
        ...formData,
        published: true
      };
      setAnnouncements([...announcements, newAnnouncement]);
    }
    setShowModal(false);
    setEditingAnnouncement(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAnnouncement(null);
  };

  return (
    <div className="announcements-screen">
      {/* Barra Lateral */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>MiUTN</h2>
        </div>
        
        <nav className="sidebar-nav">
          <button className="nav-item active">
            <span className="nav-icon">●</span>
            <span className="nav-text">Anuncios</span>
          </button>
          
          <button className="nav-item">
            <span className="nav-icon">●</span>
            <span className="nav-text">Materias</span>
          </button>
          
          <button className="nav-item">
            <span className="nav-icon">●</span>
            <span className="nav-text">Profesores</span>
          </button>
          
          <div className="nav-divider"></div>
          
          <button className="nav-item" onClick={handleBackToDashboard}>
            <span className="nav-icon">←</span>
            <span className="nav-text">Volver</span>
          </button>
          
          <button className="nav-item logout" onClick={handleLogout}>
            <span className="nav-icon">×</span>
            <span className="nav-text">Salir</span>
          </button>
        </nav>
      </aside>

      {/* Contenido Principal */}
      <main className="announcements-main">
        <header className="content-header">
          <h1>Tus Anuncios</h1>
          <button className="add-btn" onClick={handleAddAnnouncement}>
            + Agregar Anuncio
          </button>
        </header>

        {/* Tabla de Anuncios */}
        <div className="announcements-table">
          <div className="table-header">
            <div className="table-row header-row">
              <div className="table-cell">Título</div>
              <div className="table-cell">Fecha Fin</div>
              <div className="table-cell">Publicado</div>
              <div className="table-cell">Acciones</div>
            </div>
          </div>
          
          <div className="table-body">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="table-row">
                <div className="table-cell title-cell">
                  {announcement.title}
                </div>
                <div className="table-cell date-cell">
                  {announcement.endDate}
                </div>
                <div className="table-cell published-cell">
                  <span className={`published-status ${announcement.published ? 'published' : 'not-published'}`}>
                    {announcement.published ? 'Sí' : 'No'}
                  </span>
                </div>
                <div className="table-cell actions-cell">
                  <button 
                    className="action-btn modify"
                    onClick={() => handleEditAnnouncement(announcement.id)}
                  >
                    Modificar
                  </button>
                  <button 
                    className="action-btn delete"
                    onClick={() => handleDeleteAnnouncement(announcement.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal para el formulario */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>{editingAnnouncement ? 'Modificar Anuncio' : 'Agregar Anuncio'}</h2>
                <button className="close-btn" onClick={handleCloseModal}>×</button>
              </div>
              <div className="modal-body">
                <AnnouncementForm 
                  announcement={editingAnnouncement}
                  onSave={handleSaveAnnouncement}
                  onCancel={handleCloseModal}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Announcements;