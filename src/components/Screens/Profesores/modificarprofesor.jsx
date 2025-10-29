import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './modificarprofesor.css';
import Sidebar from '../../Layouts/Sidebar';
import env from '../../../config/env';

const api_URL = env.API_BASE_URL;

export default function ModificarProfesor() {
  const navigate = useNavigate();
  const [activeMenuItem, setActiveMenuItem] = useState('materias');
  const [formData, setFormData] = useState({
    name: '',
    lastname: '',
    legajo: '',
    mail: ''
  });

  const [loading, setLoading] = useState(true);

  // 🔹 Simular carga de datos desde API
  useEffect(() => {
    const fetchProfesor = async () => {
      try {
        // Simulación de API con timeout
        const simulatedResponse = await new Promise((resolve) =>
          setTimeout(() => {
            resolve({
              name: 'Ruben',
              lastname: 'Guerrieri',
              legajo: '11111',
              mail: 'ruben@frlp.utn.edu.ar'
            });
          }, 1000)
        );

        setFormData(simulatedResponse);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar datos del docente:', error);
        alert('No se pudo cargar el docente');
        setLoading(false);
      }
    };

    fetchProfesor();
  }, []);

  const handleChange = ({ target: { name, value } }) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(api_URL+'api/v1/MiUTN/professors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
         },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        alert('Docente modificado correctamente');
        navigate('/profesores');
      } else {
        alert('Error al modificar el docente');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    }
  };
   const handleBackToDashboard = () => {
    navigate('/profesores');
    };
    const handleMenuItemClick = (itemId) => {
    setActiveMenuItem(itemId);
  };
  const handleLogout = () => {
    navigate('/login');
  };

  return (
     <div className="announcements-screen">
       <Sidebar
        activeItem={activeMenuItem}
        onItemClick={handleMenuItemClick}
        onBack={handleBackToDashboard}
        onLogout={handleLogout}
      />
      <div className="docentes-container">
        <div className="cargar-docentes">
          <h1 style={{ color: '#4A89FF' }}>Modificar Docente</h1>

          {loading ? (
            <p>Cargando datos del docente...</p>
          ) : (
            <form className="panel-form" onSubmit={handleSubmit}>
              <label>Nombre</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />

              <label>Apellido</label>
              <input
                type="text"
                name="lastname"
                value={formData.lastname}
                onChange={handleChange}
                required
              />

              <label>Legajo</label>
              <input
                type="number"
                name="legajo"
                value={formData.legajo}
                onChange={handleChange}
                required
              />

              <label>Mail</label>
              <input
                type="email"
                name="mail"
                value={formData.mail}
                onChange={handleChange}
                required
              />

              <div className="panel-actions">
                <button type="submit" style={{ backgroundColor: '#4A89FF' }}>
                  Guardar cambios
                </button>
                <button
                  type="button"
                  style={{
                    color: '#4A89FF',
                    border: '2px solid #4A89FF',
                    backgroundColor: 'rgba(255, 255, 255, 0.5)'
                  }}
                  onClick={() => navigate('/profesores')}
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}