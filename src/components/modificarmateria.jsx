import React, { useState } from 'react';
import './Materias.css';
import Sidebar from './sidebar';
import { useNavigate, useParams } from 'react-router-dom';

const materias = [
  { nombre: 'Industrial', color: '#FFA01C' },
  { nombre: 'Sistemas', color: '#4A89FF' },
  { nombre: 'Química', color: '#8A2BE2' },
  { nombre: 'Eléctrica', color: '#B22222' },
  { nombre: 'Mecánica', color: '#20B2AA' },
  { nombre: 'Civil', color: '#228B22' }
];

export default function ModificarMateria({ initialData, onSubmit, color, titulo = 'Materia' }) {
    const { nombre } = useParams();
      const navigate = useNavigate();
    
      const materiaActual = materias.find(m => m.nombre.toLowerCase() === nombre.toLowerCase());
      const colorMateria = materiaActual?.color || '#4A89FF';

    const [formData, setFormData] = useState(
        initialData || {
            name: '',
            comission: '',
            classroom: '',
            type: '',
            profesor: '',
            schedule: [{ day: '', startTime: '', endTime: '' }]
        }
    );
    
    const handleChange = ({ target: { name, value } }) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleScheduleChange = (index, field, value) => {
        const updated = [...formData.schedule];
        updated[index][field] = value;
        setFormData(prev => ({ ...prev, schedule: updated }));
    };
    
    const addSchedule = () => {
        setFormData(prev => ({
            ...prev,
            schedule: [...prev.schedule, { day: '', startTime: '', endTime: '' }]
        }));
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };
    
    return (
    <>
    <Sidebar />
    <div className="materias-container">
        <div className="cargar-materias">
          <h1 style={{ color: colorMateria }}>Modificar Materia</h1>
            <form className="panel-form" onSubmit={handleSubmit}>
                
                <label>Nombre</label>
                <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                />
                
                <label>Comisión</label>
                <div className="input-group">
                    <select
                    name="comission"
                    value={formData.comission}
                    onChange={handleChange}
                    required
                    >
                        <option value="" disabled>Seleccionar comisión</option>
                        <option value="A">S31</option>
                        <option value="B">S41</option>
                        <option value="C">S51</option>
                    </select>
                        <button type="button" className="agregar-btn" style={{ backgroundColor: colorMateria }}>+</button>
                </div>
                
                <label>Aula</label>
                <div className="input-group">
                    <select
                    name="classroom"
                    value={formData.classroom}
                    onChange={handleChange}
                    required
                    >
                        <option value="" disabled>Seleccionar aula</option>
                        <option value="131">131</option>
                        <option value="132">132</option>
                        <option value="133">133</option>
                        <option value="134">134</option>
                        <option value="135">135</option>
                        <option value="Malvinas">Anfiteatro Malvinas</option>
                    </select>
                    <button type="button" className="agregar-btn" style={{ backgroundColor: colorMateria }}>+</button>
                </div>
                
                <label>Período</label>
                <select
                name="type"
                value={formData.type}
                className="form-select"
                onChange={handleChange}
                required
                >
                    <option value="" disabled>Seleccionar período</option>
                    <option value="1C">1C</option>
                    <option value="2C">2C</option>
                    <option value="Anual">Anual</option>
                </select>
                    
                <label>Profesor</label>
                <select
                name="profesor"
                value={formData.profesor}
                className="form-select"
                onChange={handleChange}
                required
                >
                    <option value="" disabled>Seleccionar profesor</option>
                    <option value="Ruben">Ruben</option>
                    <option value="Migo">Migo</option>
                    <option value="Berni">Berni</option>
                </select>
                
                <fieldset>
                    <legend>Horarios</legend>
                    {formData.schedule.map((horario, index) => (
                        <div key={index} className="horario">
                            <input
                            type="text"
                            placeholder="Día"
                            value={horario.day}
                            onChange={(e) => handleScheduleChange(index, 'day', e.target.value)}
                            required
                            />
                            <input
                                type="time"
                                value={horario.startTime}
                                onChange={(e) => handleScheduleChange(index, 'startTime', e.target.value)}
                                required
                            />
                            <input
                                type="time"
                                value={horario.endTime}
                                onChange={(e) => handleScheduleChange(index, 'endTime', e.target.value)}
                                required
                            />
                        </div>
                    ))}
                    
                    <button
                    type="button"
                    style={{ backgroundColor: colorMateria }}
                    onClick={addSchedule}
                    >
                        Agregar horario
                    </button>
                </fieldset>

                <div className="panel-actions">
                    <button type="submit" style={{ backgroundColor: colorMateria }}>
                        Guardar cambios
                    </button>
                    <button
                    style={{
                      color: colorMateria,
                      border: `2px solid ${colorMateria}`,
                      backgroundColor: 'rgba(255, 255, 255, 0.5)'
                    }}
                        type="button"
                        onClick={() => navigate(`/materia/${nombre.toLowerCase()}`)}
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