// src/screens/Announcements.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Layouts/Sidebar';
import AnnouncementsTable from './Announcements/AnnouncementsTable';
import AnnouncementModal from './Announcements/AnnouncementModal';
import ConfirmModal from '../UI/ConfirmModal';
import './Announcements.css';

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

  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [pendingAnnouncement, setPendingAnnouncement] = useState(null); // ✅ FALTABA ESTE ESTADO
  const [activeMenuItem, setActiveMenuItem] = useState('announcements');

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

  // ✅ FUNCIÓN CORREGIDA - Solo guarda en estado pendiente y muestra confirmación
  const handleSaveAnnouncement = (formData) => {
    setPendingAnnouncement(formData);
    setShowConfirmModal(true);
  };

  // ✅ FUNCIÓN CORREGIDA - Maneja la confirmación real
  const handleConfirmSave = () => {
    if (pendingAnnouncement) {
      if (editingAnnouncement) {
        // Editar anuncio existente
        setAnnouncements(announcements.map(ann => 
          ann.id === editingAnnouncement.id 
            ? { 
                ...ann, 
                ...pendingAnnouncement,
                // Mantener propiedades existentes que no vienen del formulario
                id: editingAnnouncement.id,
                published: editingAnnouncement.published 
              }
            : ann
        ));
      } else {
        // Agregar nuevo anuncio
        const newAnnouncement = {
          id: Math.max(...announcements.map(ann => ann.id)) + 1,
          ...pendingAnnouncement,
          published: true
        };
        setAnnouncements([...announcements, newAnnouncement]);
      }
      
      // Limpiar y cerrar modales
      setShowModal(false);
      setShowConfirmModal(false);
      setEditingAnnouncement(null);
      setPendingAnnouncement(null);
    }
  };

  // ✅ FUNCIÓN CORREGIDA - Maneja la cancelación
  const handleCancelSave = () => {
    // Solo cerrar el modal de confirmación, mantener el formulario abierto
    setShowConfirmModal(false);
    setPendingAnnouncement(null);
  };

  // ✅ FUNCIÓN ÚNICA para cerrar el modal del formulario
  const handleCloseFormModal = () => {
    setShowModal(false);
    setEditingAnnouncement(null);
    setPendingAnnouncement(null);
  };

  const handleMenuItemClick = (itemId) => {
    setActiveMenuItem(itemId);
    // Aquí puedes agregar lógica para cambiar entre secciones
  };

  return (
    <div className="announcements-screen">
      <Sidebar
        activeItem={activeMenuItem}
        onItemClick={handleMenuItemClick}
        onBack={handleBackToDashboard}
        onLogout={handleLogout}
      />

      <main className="announcements-main">
        <header className="content-header">
          <h1>Tus Anuncios</h1>
          <button className="add-btn" onClick={handleAddAnnouncement}>
            + Agregar Anuncio
          </button>
        </header>

        <AnnouncementsTable
          announcements={announcements}
          onEdit={handleEditAnnouncement}
          onDelete={handleDeleteAnnouncement}
        />

        {/* Modal para el formulario */}
        <AnnouncementModal
          isOpen={showModal}
          onClose={handleCloseFormModal} 
          announcement={editingAnnouncement}
          onSave={handleSaveAnnouncement} 
        />

        {/* Modal de confirmación reutilizable */}
        <ConfirmModal
          isOpen={showConfirmModal}
          onClose={handleCancelSave}
          onConfirm={handleConfirmSave}
          title="Confirmar Operación"
          message={editingAnnouncement 
            ? "¿Estás seguro de que deseas actualizar este anuncio?" 
            : "¿Estás seguro de que deseas crear este anuncio?"
          }
          confirmText="Aceptar"
          cancelText="Cancelar"
        />
      </main>
    </div>
  );
};

export default Announcements;