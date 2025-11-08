// src/screens/Announcements.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Layouts/Sidebar';
import AnnouncementsTable from './Announcements/AnnouncementsTable';
import AnnouncementModal from './Announcements/AnnouncementModal';
import ConfirmModal from '../UI/ConfirmModal';
import { checkAuth,logout } from './../CheckAuth';
import './Announcements.css';
import env from '../../config/env';

const api_URL = env.API_BASE_URL;
// URL base de la API
const API_BASE_URL = api_URL + 'api/v1/miUTN/publication';

const Announcements = () => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [pendingAnnouncement, setPendingAnnouncement] = useState(null);
  const [activeMenuItem, setActiveMenuItem] = useState('announcements');

  // FETCH: Obtener todos los anuncios
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('HOLA!!');
      
      const response = await fetch(`${API_BASE_URL}/findAll`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      console.log(response);
      const data = await response.json();
      console.log(data);
      
      function quitarHora(fechaConHora) {
          if(fechaConHora != null)
            return fechaConHora.split('T')[0];
          else
            return null;
      }
      
      // Mapear los datos de la API al formato que espera tu componente
      const mappedAnnouncements = data.map(item => ({
        id: item.id,
        title: item.title,
        endDate: quitarHora(item.expirationDate) || "Sin fecha", 
        published: item.hidden, // ✅ CAMBIAR: item.hidden por !item.hidden
        description: item.description,
        content: item.content,
        priority: item.priority,
        imagePath: item.imagePath,
        expirable: item.expirable,
        publicationMode: item.publicationMode
      }));

      setAnnouncements(mappedAnnouncements);
      
    } catch (err) {
      setError(`Error al cargar los anuncios: ${err.message}`);
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar anuncios al montar el componente
  useEffect(() => {
    if (!checkAuth()) {
          // Si no hay token, redirigimos al login
          logout()
    }
    fetchAnnouncements();
  }, []);

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

  // FETCH: Eliminar anuncio
  const handleDeleteAnnouncement = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/delete?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
      });

      if (!response.ok) {
        throw new Error(`Error al eliminar: ${response.status}`);
      }

      // Si la eliminación fue exitosa, actualizar el estado local
      setAnnouncements(announcements.filter(ann => ann.id !== id));
      
    } catch (err) {
      setError(`Error al eliminar el anuncio: ${err.message}`);
      console.error('Error deleting announcement:', err);
    }
  };

  // ✅ FUNCIÓN CORREGIDA - Solo guarda en estado pendiente y muestra confirmación
  const handleSaveAnnouncement = (formData) => {
    setPendingAnnouncement(formData);
    setShowConfirmModal(true);
  };

// ✅ FUNCIÓN ACTUALIZADA - Maneja la confirmación real con fetch
const handleConfirmSave = async () => {
  if (!pendingAnnouncement) return;

  try {
    let response;
    
    if (editingAnnouncement) {
      // FETCH: Actualizar anuncio existente
      const formData = new FormData();
      formData.append("id", editingAnnouncement.id);
      formData.append("title", pendingAnnouncement.title);
      formData.append("description", pendingAnnouncement.description);
      formData.append("content", pendingAnnouncement.content);
      formData.append("hidden", !pendingAnnouncement.published); // ✅ Consistente
      formData.append("priority", pendingAnnouncement.priority || false);
      formData.append("expirable", pendingAnnouncement.expirable || false);
      formData.append("publicationMode", pendingAnnouncement.publicationMode || "INMEDIATE");
      if (pendingAnnouncement.image) {
        formData.append("image", pendingAnnouncement.image);
      }

      // Si hay imagen seleccionada, se agrega al FormData
      if (pendingAnnouncement.image) {
        formData.append("image", pendingAnnouncement.image);
      }

      response = await fetch(`${API_BASE_URL}/update`, {
        method: "PUT",
        headers: {
          "ngrok-skip-browser-warning": "true"
        },
        body: formData
      });

    } else {
      // FETCH: Crear nuevo anuncio
      const formData = new FormData();
      formData.append("title", pendingAnnouncement.title);
      formData.append("description", pendingAnnouncement.description);
      formData.append("content", pendingAnnouncement.content);
      
      // ✅ CORRECCIÓN: Usar !published para hidden (misma lógica que edición)
      formData.append("hidden", pendingAnnouncement.published);
      
      formData.append("priority", pendingAnnouncement.priority || false);
      formData.append("expirable", pendingAnnouncement.expirable || false);
      formData.append("expirationDate", pendingAnnouncement.endDate);
      formData.append("scheduledDate", pendingAnnouncement.scheduledDate);
      formData.append("publicationMode", pendingAnnouncement.publicationMode || "INMEDIATE");

      // Si hay imagen seleccionada, se agrega al FormData
      if (pendingAnnouncement.image) {
        formData.append("image", pendingAnnouncement.image);
      }

      // ✅ DEBUG: Verificar datos antes de enviar
      console.log('📤 Datos a enviar para CREAR anuncio:');
      console.log('- Título:', pendingAnnouncement.title);
      console.log('- Prioridad:', pendingAnnouncement.priority);
      console.log('- Publicado (checkbox):', pendingAnnouncement.published);
      console.log('- Hidden (enviado a API):', pendingAnnouncement.published);
      console.log('- Expirable:', pendingAnnouncement.expirable);
      console.log('- PublicationMode:', pendingAnnouncement.publicationMode);

      response = await fetch(`${API_BASE_URL}/save`, {
        method: "POST",
        headers: {
          "ngrok-skip-browser-warning": "true"
        },
        body: formData
      });
    }

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    // Recargar los anuncios después de guardar
    await fetchAnnouncements();
    
    // Limpiar y cerrar modales
    setShowModal(false);
    setShowConfirmModal(false);
    setEditingAnnouncement(null);
    setPendingAnnouncement(null);
    
  } catch (err) {
    setError(`Error al guardar el anuncio: ${err.message}`);
    console.error('Error saving announcement:', err);
  }
};

  // ✅ FUNCIÓN CORREGIDA - Maneja la cancelación
  const handleCancelSave = () => {
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
  };

  // Función para reintentar la carga
  const handleRetry = () => {
    fetchAnnouncements();
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

        {/* Mostrar estado de carga */}
        {loading && <div className="loading">Cargando anuncios...</div>}
        
        {/* Mostrar error */}
        {error && (
          <div className="error">
            <p>{error}</p>
            <button onClick={handleRetry}>Reintentar</button>
          </div>
        )}

        {/* Mostrar tabla solo si no hay error y no está cargando */}
        {!loading && !error && (
          <AnnouncementsTable
            announcements={announcements}
            onEdit={handleEditAnnouncement}
            onDelete={handleDeleteAnnouncement}
          />
        )}

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