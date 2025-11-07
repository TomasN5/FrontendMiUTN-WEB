import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './modificarprofesor.css';
import Sidebar from '../../Layouts/Sidebar';
import env from '../../../config/env';

const api_URL = env.API_BASE_URL;

export default function ModificarProfesor() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeMenuItem, setActiveMenuItem] = useState('materias');
  const [formData, setFormData] = useState({
    name: '',
    lastname: '',
    legajo: '',
    email: ''
  });
  const [profesorId, setProfesorId] = useState(null);

  const [loading, setLoading] = useState(true);

  // Cargar datos del profesor desde el estado de navegación o desde la API
  useEffect(() => {
    const fetchProfesor = async () => {
      try {
        const profesorFromState = location.state?.profesor;
        
        if (profesorFromState && profesorFromState.id) {
          // Guardar el ID del profesor
          setProfesorId(profesorFromState.id);
          
          // Si tenemos el profesor desde el estado, buscar los datos completos desde la API
          try {
            const response = await fetch(api_URL + 'api/v1/miUTN/professor/findAll', {
              headers: {
                'ngrok-skip-browser-warning': 'true',
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              const profesorCompleto = data.find(p => p.id === profesorFromState.id);
              
              if (profesorCompleto) {
                // Adaptar los datos de la API al formato del formulario
                setFormData({
                  name: profesorCompleto.name || '',
                  lastname: profesorCompleto.lastname || '',
                  legajo: profesorCompleto.legajo?.toString() || profesorFromState.legajo || '',
                  email: profesorCompleto.email || profesorFromState.email || ''
                });
              } else {
                // Si no se encuentra en la API, usar los datos del estado
                // Separar nombre completo en name y lastname
                const nombreCompleto = profesorFromState.nombre || '';
                const partes = nombreCompleto.split(' ');
                const name = partes[0] || '';
                const lastname = partes.slice(1).join(' ') || '';
                
                setFormData({
                  name: name,
                  lastname: lastname,
                  legajo: profesorFromState.legajo || '',
                  email: profesorFromState.email || ''
                });
              }
            } else {
              // Si falla la API, usar los datos del estado
              const nombreCompleto = profesorFromState.nombre || '';
              const partes = nombreCompleto.split(' ');
              const name = partes[0] || '';
              const lastname = partes.slice(1).join(' ') || '';
              
              setFormData({
                name: name,
                lastname: lastname,
                legajo: profesorFromState.legajo || '',
                email: profesorFromState.email || ''
              });
            }
          } catch (apiError) {
            console.error('Error al obtener datos desde la API:', apiError);
            // Usar datos del estado como fallback
            const nombreCompleto = profesorFromState.nombre || '';
            const partes = nombreCompleto.split(' ');
            const name = partes[0] || '';
            const lastname = partes.slice(1).join(' ') || '';
            
            setFormData({
              name: name,
              lastname: lastname,
              legajo: profesorFromState.legajo || '',
              email: profesorFromState.email || ''
            });
          }
        } else {
          // Si no hay datos en el estado, redirigir a la lista de profesores
          alert('No se seleccionó ningún profesor para modificar');
          navigate('/profesores');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar datos del docente:', error);
        alert('No se pudo cargar el docente');
        setLoading(false);
        navigate('/profesores');
      }
    };

    fetchProfesor();
  }, [location.state, navigate]);

  const handleChange = ({ target: { name, value } }) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Preparar los datos para enviar, convirtiendo legajo a número o null e incluyendo el id
      const dataToSend = {
        id: profesorId,
        name: formData.name,
        lastname: formData.lastname,
        email: formData.email,
        legajo: formData.legajo && formData.legajo.trim() !== '' && formData.legajo !== '-' 
          ? Number(formData.legajo) 
          : null
      };

      const response = await fetch(api_URL+'api/v1/miUTN/professor/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true'},
        body: JSON.stringify(dataToSend)
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
                value={formData.legajo === '-' ? '' : formData.legajo}
                onChange={handleChange}
              />

              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
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