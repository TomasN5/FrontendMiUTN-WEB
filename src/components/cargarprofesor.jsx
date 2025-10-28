import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Styles/cargarprofesor.css';
import Sidebar from './sidebar';

export default function CargarProfesor() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    lastname: '',
    legajo: '',
    mail: '',
  });

  const handleChange = ({ target: { name, value } }) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleScheduleChange = (index, field, value) => {
    const updated = [...formData.schedules];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, schedules: updated }));
  };

  const addSchedule = () => {
    setFormData(prev => ({
      ...prev,
      schedules: [...prev.schedules, { day: '', startTime: '', endTime: '' }]
    }));
  };




  const handleSubmit = async (e) => {
    e.preventDefault();
      const payload = {
        name: formData.name,
        lastname: formData.lastname,
        legajo:Number(formData.legajo),
        email:formData.mail
      }

    console.log(payload)
    try {
      const response = await fetch('http://localhost:8080/api/v1/miUTN/professor/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        alert('Docente creado correctamente');
        navigate('/profesores');
      } else {
        alert('Error al crear el docente');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    }
  };

  return (
    <>
      <Sidebar />
      <div className="docentes-container">
        <div className="cargar-docentes">
          <h1 style={{ color: '#4A89FF' }}>Crear Docente</h1>
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
              type="text"
              name="mail"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <div className="panel-actions">
              <button type="submit" style={{ backgroundColor: '#4A89FF' }}>
                Guardar Docente
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
        </div>
      </div>
    </>
  );
}