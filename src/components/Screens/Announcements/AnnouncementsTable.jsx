// src/components/Announcements/AnnouncementsTable.jsx
import React from 'react';
import './AnnouncementsTable.css';

const AnnouncementsTable = ({ announcements, onEdit, onDelete }) => {
  return (
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
                onClick={() => onDelete(announcement.id)}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnnouncementsTable;