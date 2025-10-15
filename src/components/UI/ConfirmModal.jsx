// src/components/UI/ConfirmModal.jsx
import React from 'react';
import './ConfirmModal.css';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirmar Operación",
  message = "¿Estás seguro de que deseas realizar esta operación?",
  confirmText = "Aceptar",
  cancelText = "Cancelar" 
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="confirm-modal-overlay">
      <div className="confirm-modal-content">
        <div className="confirm-modal-header">
          <h3>{title}</h3>
        </div>
        
        <div className="confirm-modal-body">
          <p>{message}</p>
        </div>
        
        <div className="confirm-modal-actions">
          <button 
            className="confirm-btn cancel"
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button 
            className="confirm-btn accept"
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;