// src/components/Announcements/AnnouncementModal.jsx
import React from 'react';
import AnnouncementForm from './AnnouncementForm';
import './AnnouncementModal.css';

const AnnouncementModal = ({ 
  isOpen, 
  onClose, 
  announcement, 
  onSave 
}) => {
  if (!isOpen) return null;

  return (
    <div className="announcement-modal-overlay">
      <div className="announcement-modal-content">
        <div className="announcement-modal-header">
          <h2>{announcement ? 'Modificar Anuncio' : 'Agregar Anuncio'}</h2>
          <button className="announcement-close-btn" onClick={onClose}>×</button>
        </div>
        <div className="announcement-modal-body">
          <AnnouncementForm 
            announcement={announcement}
            onSave={onSave}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
};

export default AnnouncementModal;