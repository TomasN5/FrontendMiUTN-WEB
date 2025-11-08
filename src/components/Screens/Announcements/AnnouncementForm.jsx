import React, { useState, useEffect } from 'react';
import './AnnouncementForm.css';
import { checkAuth,logout } from './../../CheckAuth';
import env from '../../../config/env';

const api_URL = env.API_BASE_URL;

const AnnouncementForm = ({ announcement, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    image: null,
    title: '',
    description: '',
    content: '',
    priority: false,
    published: true,
    publicationMode: 'INMEDIATE',
    scheduledDate: '',
    expirable: false,
    endDate: ''
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [imageUrlObject, setImageUrlObject] = useState(null);

  // Cargar datos si estamos editando - CON MEJOR MANEJO
  useEffect(() => {
    if (!checkAuth()) {
          // Si no hay token, redirigimos al login
          logout()
    }

    if (announcement) {

      setFormData({
        image: null,
        title: announcement.title || '',
        description: announcement.description || '',
        content: announcement.content || '',
        priority: Boolean(announcement.priority), // ✅ Asegurar que sea boolean
        published: Boolean(announcement.hidden),
        publicationMode: announcement.publicationMode || 'INMEDIATE',
        scheduledDate: announcement.scheduledDate || '',
        expirable: Boolean(announcement.expirable), // ✅ Asegurar que sea boolean
        endDate: announcement.endDate || ''
      });

    // Limpiar URL anterior si existe
    let previousUrl = imageUrlObject;
    if (previousUrl) {
      URL.revokeObjectURL(previousUrl);
      setImageUrlObject(null);
    }

    if (announcement) {
      console.log('Datos del anuncio a editar:', announcement);
    
      // Cargar imagen si existe imagePath
      if (announcement.imagePath) {
        const loadImage = async () => {
          try {
            const response = await fetch(
              `${api_URL}api/v1/miUTN/publication/download?path=${encodeURIComponent(announcement.imagePath)}`,
              {
                method: 'GET',
                headers: {
                  'ngrok-skip-browser-warning': 'true'
                }
              }
            );

            if (response.ok) {
              const blob = await response.blob();
              
              // Extraer el nombre del archivo del path o usar un nombre por defecto
              const fileName = announcement.imagePath.split('/').pop() || announcement.imagePath.split('\\').pop() || 'image.jpg';
              
              // Convertir el blob en un File para que el backend lo acepte como MultipartFile
              const imageFile = new File([blob], fileName, { type: blob.type || 'image/jpeg' });
              
              // Establecer el File en formData
              setFormData(prev => ({ ...prev, image: imageFile }));
              
              // Crear URL para el preview
              const imageUrl = URL.createObjectURL(blob);
              setImageUrlObject(imageUrl);
              setImagePreview(imageUrl);
            } else {
              console.error('Error al cargar la imagen:', response.status);
              setImagePreview(null);
            }
          } catch (error) {
            console.error('Error al descargar la imagen:', error);
            setImagePreview(null);
          }
        };

        loadImage();
      } else {
        // Si no hay imagePath, limpiar el preview
        setImagePreview(null);
      }
    } else {
      // Si no hay anuncio, limpiar el preview
      setImagePreview(null);
    }

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

    // Validar programación si se seleccionó "SCHEDULED"
    if (formData.publicationMode === 'SCHEDULED' && !formData.scheduledDate) {
      newErrors.scheduledDate = 'La fecha de programación es obligatoria cuando se selecciona "Programar para"';
    }

    // Validar vigencia si se seleccionó expirable
    if (formData.expirable && !formData.endDate) {
      newErrors.endDate = 'La fecha de vigencia es obligatoria cuando se selecciona "Fecha Hasta"';
    }

    // Validar que la fecha de programación no sea en el pasado
    if (formData.publicationMode === 'SCHEDULED' && formData.scheduledDate) {
      const scheduledDate = new Date(formData.scheduledDate);
      const now = new Date();
      if (scheduledDate < now) {
        newErrors.scheduledDate = 'La fecha de programación no puede ser en el pasado';
      }
    }

    // Validar que la fecha de vigencia no sea en el pasado
    if (formData.expirable && formData.endDate) {
      const endDate = new Date(formData.endDate);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
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

  // ✅ NUEVA FUNCIÓN para manejar radios de expirable
  const handleExpirableChange = (value) => {
    console.log('Expirable cambiado a:', value);
    setFormData(prev => ({
      ...prev,
      expirable: value,
      // Si se cambia a no expirable, limpiar la fecha
      endDate: value ? prev.endDate : ''
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Limpiar URL anterior si existe (imagen descargada)
      if (imageUrlObject) {
        URL.revokeObjectURL(imageUrlObject);
        setImageUrlObject(null);
      }
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
    // Limpiar la URL del objeto si existe
    if (imageUrlObject) {
      URL.revokeObjectURL(imageUrlObject);
      setImageUrlObject(null);
    }
    setImagePreview(null);
  };

  // Limpiar la URL del objeto cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (imageUrlObject) {
        URL.revokeObjectURL(imageUrlObject);
      }
    };
  }, [imageUrlObject]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // ✅ DEBUG: Ver datos antes de enviar
    console.log('Datos a enviar:', formData);
    
    if (!validateForm()) {
      console.log('Errores de validación:', errors);
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

            {/* Prioridad - CON DEBUG VISUAL */}
            <div className="announcement-form-section announcement-prioridad-section">
              <div className="announcement-checkbox-group">
                <label className="announcement-checkbox-label">
                  <input
                    type="checkbox"
                    name="priority"
                    checked={formData.priority}
                    onChange={handleInputChange}
                    className="announcement-checkbox-input"
                  />
                  <span className="announcement-checkmark"></span>
                  Prioridad Alta
                  <span style={{marginLeft: '10px', color: '#666', fontSize: '12px'}}>
                    ({formData.priority ? 'ACTIVADA' : 'desactivada'})
                  </span>
                </label>
              </div>
            </div>

            {/* Estado de publicación */}
            <div className="announcement-form-section">
              <div className="announcement-checkbox-group">
                <label className="announcement-checkbox-label">
                  <input
                    type="checkbox"
                    name="published"
                    unchecked={announcement ? !announcement.published : formData.published}
                    onChange={handleInputChange}
                    className="announcement-checkbox-input"
                  />
                  <span className="announcement-checkmark"></span>
                  Publicar anuncio
                  <span style={{marginLeft: '10px', color: '#666', fontSize: '12px'}}>
                    ({formData.published ? 'PUBLICADO' : 'oculto'})
                  </span>
                </label>
              </div>
            </div>

            {/* Vigencia - CORREGIDO */}
            <div className="announcement-form-section">
              <h3>Vigencia del Anuncio</h3>
              <div className="announcement-radio-group announcement-vigencia-group">
                <label className="announcement-radio-label">
                  <input
                    type="radio"
                    name="expirable"
                    checked={!formData.expirable}
                    onChange={() => handleExpirableChange(false)}
                    className="announcement-radio-input"
                  />
                  <span className="announcement-radiomark"></span>
                  Permanente
                </label>
                
                <label className="announcement-radio-label">
                  <input
                    type="radio"
                    name="expirable"
                    checked={formData.expirable}
                    onChange={() => handleExpirableChange(true)}
                    className="announcement-radio-input"
                  />
                  <span className="announcement-radiomark"></span>
                  Fecha Hasta
                </label>
                
                {formData.expirable && (
                  <div className="announcement-date-group">
                    <input
                      type="datetime-local"
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
                    name="publicationMode"
                    value="INMEDIATE"
                    checked={formData.publicationMode === 'INMEDIATE'}
                    onChange={handleInputChange}
                    className="announcement-radio-input"
                  />
                  <span className="announcement-radiomark"></span>
                  Ahora
                </label>
                
                <label className="announcement-radio-label">
                  <input
                    type="radio"
                    name="publicationMode"
                    value="SCHEDULED"
                    checked={formData.publicationMode === 'SCHEDULED'}
                    onChange={handleInputChange}
                    className="announcement-radio-input"
                  />
                  <span className="announcement-radiomark"></span>
                  Programar para
                </label>
                
                {formData.publicationMode === 'SCHEDULED' && (
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