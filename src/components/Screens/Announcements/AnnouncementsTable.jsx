// src/components/Announcements/AnnouncementsTable.jsx
import React, { useState } from 'react';
import ConfirmModal from '../../UI/ConfirmModal';
import './AnnouncementsTable.css';

const AnnouncementsTable = ({ announcements, onEdit, onDelete }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState(null);

  const handleDeleteClick = (announcementId) => {
    setAnnouncementToDelete(announcementId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (announcementToDelete) {
      onDelete(announcementToDelete);
    }
    setShowDeleteModal(false);
    setAnnouncementToDelete(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setAnnouncementToDelete(null);
  };

  return (
    <>
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
                  onClick={() => onEdit(announcement.id)}
                >
                  Modificar
                </button>
                <button 
                  className="action-btn delete"
                  onClick={() => handleDeleteClick(announcement.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Confirmar Eliminación"
        message="¿Estás seguro de que deseas eliminar este anuncio? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </>
  );
};

export default AnnouncementsTable;