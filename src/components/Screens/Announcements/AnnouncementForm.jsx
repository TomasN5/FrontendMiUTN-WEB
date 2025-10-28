import React, { useState, useEffect } from 'react';
import './AnnouncementForm.css';

const AnnouncementForm = ({ announcement, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    image: null,
    title: '',
    description: '',
    content: '',
    isImportant: false,
    scheduleType: 'now',
    scheduledDate: '',
    validityType: 'permanent',
    endDate: ''
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});

  // Cargar datos si estamos editando
  useEffect(() => {
    if (announcement) {
      setFormData({
        image: null,
        title: announcement.title || '',
        description: announcement.description || '',
        content: announcement.content || '',
        isImportant: announcement.isImportant || false,
        scheduleType: announcement.scheduleType || 'now',
        scheduledDate: announcement.scheduledDate || '',
        validityType: announcement.validityType || 'permanent',
        endDate: announcement.endDate || ''
      });
    }
  }, [announcement]);

  const validateForm = () => {
    const newErrors = {};

    // Validar campos obligatorios
    if (!formData.title.trim()) {
      newErrors.title = 'El título es obligatorio';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es obligatoria';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'El contenido es obligatorio';
    }

    // Validar programación si se seleccionó "Programar para"
    if (formData.scheduleType === 'scheduled' && !formData.scheduledDate) {
      newErrors.scheduledDate = 'La fecha de programación es obligatoria cuando se selecciona "Programar para"';
    }

    // Validar vigencia si se seleccionó "Fecha Hasta"
    if (formData.validityType === 'date' && !formData.endDate) {
      newErrors.endDate = 'La fecha de vigencia es obligatoria cuando se selecciona "Fecha Hasta"';
    }

    // Validar que la fecha de programación no sea en el pasado
    if (formData.scheduleType === 'scheduled' && formData.scheduledDate) {
      const scheduledDate = new Date(formData.scheduledDate);
      const now = new Date();
      if (scheduledDate < now) {
        newErrors.scheduledDate = 'La fecha de programación no puede ser en el pasado';
      }
    }

    // Validar que la fecha de vigencia no sea en el pasado
    if (formData.validityType === 'date' && formData.endDate) {
      const endDate = new Date(formData.endDate);
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Reset hours to compare only dates
      if (endDate < now) {
        newErrors.endDate = 'La fecha de vigencia no puede ser en el pasado';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
    setImagePreview(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Enviar datos al componente padre
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="announcement-form-modal announcements-form-modal">
      <div className="announcement-form-content">
        <div className="announcement-form-layout">
          
          {/* COLUMNA IZQUIERDA */}
          <div className="announcement-form-left">
            {/* Imagen */}
            <div className="announcement-form-section">
              <h3>Imagen</h3>
              <div className="announcement-image-upload">
                {imagePreview ? (
                  <div className="announcement-image-preview">
                    <img src={imagePreview} alt="Vista previa" />
                    <button 
                      type="button" 
                      className="announcement-remove-image"
                      onClick={handleRemoveImage}
                    >
                      Eliminar
                    </button>
                  </div>
                ) : (
                  <div className="announcement-upload-area">
                    <input
                      type="file"
                      id="announcement-image-upload"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="announcement-file-input"
                    />
                    <label htmlFor="announcement-image-upload" className="announcement-upload-btn">
                      Subir
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Descripción */}
            <div className="announcement-form-section">
              <h3>Descripción <span className="required-field">*</span></h3>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Breve descripción del anuncio"
                className={`announcement-form-textarea announcement-description-textarea ${
                  errors.description ? 'error' : ''
                }`}
              />
              {errors.description && (
                <span className="error-message">{errors.description}</span>
              )}
            </div>

            {/* Contenido */}
            <div className="announcement-form-section">
              <h3>Contenido <span className="required-field">*</span></h3>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Contenido detallado del anuncio"
                className={`announcement-form-textarea announcement-content-textarea ${
                  errors.content ? 'error' : ''
                }`}
              />
              {errors.content && (
                <span className="error-message">{errors.content}</span>
              )}
            </div>
          </div>

          {/* COLUMNA DERECHA */}
          <div className="announcement-form-right">
            {/* Título */}
            <div className="announcement-form-section">
              <h3>Título <span className="required-field">*</span></h3>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Ingresa el título del anuncio"
                className={`announcement-form-input ${
                  errors.title ? 'error' : ''
                }`}
              />
              {errors.title && (
                <span className="error-message">{errors.title}</span>
              )}
            </div>

            {/* Prioridad */}
            <div className="announcement-form-section announcement-prioridad-section">
              <div className="announcement-checkbox-group">
                <label className="announcement-checkbox-label">
                  <input
                    type="checkbox"
                    name="isImportant"
                    checked={formData.isImportant}
                    onChange={handleInputChange}
                    className="announcement-checkbox-input"
                  />
                  <span className="announcement-checkmark"></span>
                  Prioridad Alta
                </label>
              </div>
            </div>

            {/* Vigencia */}
            <div className="announcement-form-section">
              <h3>Vigencia del Anuncio</h3>
              <div className="announcement-radio-group announcement-vigencia-group">
                <label className="announcement-radio-label">
                  <input
                    type="radio"
                    name="validityType"
                    value="permanent"
                    checked={formData.validityType === 'permanent'}
                    onChange={handleInputChange}
                    className="announcement-radio-input"
                  />
                  <span className="announcement-radiomark"></span>
                  Permanente
                </label>
                
                <label className="announcement-radio-label">
                  <input
                    type="radio"
                    name="validityType"
                    value="date"
                    checked={formData.validityType === 'date'}
                    onChange={handleInputChange}
                    className="announcement-radio-input"
                  />
                  <span className="announcement-radiomark"></span>
                  Fecha Hasta
                </label>
                
                {formData.validityType === 'date' && (
                  <div className="announcement-date-group">
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className={`announcement-date-input ${
                        errors.endDate ? 'error' : ''
                      }`}
                    />
                    {errors.endDate && (
                      <span className="error-message">{errors.endDate}</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Programación */}
            <div className="announcement-form-section">
              <h3>Programación</h3>
              <div className="announcement-radio-group announcement-programacion-group">
                <label className="announcement-radio-label">
                  <input
                    type="radio"
                    name="scheduleType"
                    value="now"
                    checked={formData.scheduleType === 'now'}
                    onChange={handleInputChange}
                    className="announcement-radio-input"
                  />
                  <span className="announcement-radiomark"></span>
                  Ahora
                </label>
                
                <label className="announcement-radio-label">
                  <input
                    type="radio"
                    name="scheduleType"
                    value="scheduled"
                    checked={formData.scheduleType === 'scheduled'}
                    onChange={handleInputChange}
                    className="announcement-radio-input"
                  />
                  <span className="announcement-radiomark"></span>
                  Programar para
                </label>
                
                {formData.scheduleType === 'scheduled' && (
                  <div className="announcement-date-group">
                    <input
                      type="datetime-local"
                      name="scheduledDate"
                      value={formData.scheduledDate}
                      onChange={handleInputChange}
                      className={`announcement-date-input ${
                        errors.scheduledDate ? 'error' : ''
                      }`}
                    />
                    {errors.scheduledDate && (
                      <span className="error-message">{errors.scheduledDate}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="announcement-form-actions">
          <button type="button" className="announcement-btn-cancel" onClick={onCancel}>
            Cancelar
          </button>
          <button type="submit" className="announcement-btn-accept">
            {announcement ? 'Actualizar' : 'Crear'} Anuncio
          </button>
        </div>
      </div>
    </form>
  );
};

export default AnnouncementForm;