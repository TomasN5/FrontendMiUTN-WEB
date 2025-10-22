import React, { useState, useEffect } from 'react';
import './Styles/modificarmateria.css';
import Sidebar from './Layouts/Sidebar';
import { useNavigate, useParams, useLocation  } from 'react-router-dom';

const materias = [
  { nombre: 'Industrial', color: '#FFA01C' },
  { nombre: 'Sistemas', color: '#4A89FF' },
  { nombre: 'Química', color: '#8A2BE2' },
  { nombre: 'Eléctrica', color: '#B22222' },
  { nombre: 'Mecánica', color: '#20B2AA' },
  { nombre: 'Civil', color: '#228B22' }
];

export default function ModificarMateria({ initialData, onSubmit }) {
  const { nombre } = useParams();
  const navigate = useNavigate();
    const [activeMenuItem, setActiveMenuItem] = useState('materias');
  

  const materiaActual = materias.find(m => m.nombre.toLowerCase() === nombre.toLowerCase());
  const colorMateria = materiaActual?.color || '#4A89FF';
  const location = useLocation(); // 🔹 Para recibir datos enviados desde MateriaDetalle
  const materiaDesdeLista = location.state?.materia;

  const [formData, setFormData] = useState(
    initialData || {
      name: '',
      commissionId: '',
      commissionName: '',
      classroom: '',
      type: '',
      schedule: [{ day: '', startTime: '', endTime: '' }],
      professorsId: ['']
    }
  );

  const [commissions, setCommissions] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [newCommissionName, setNewCommissionName] = useState('');
  const [newClassroomName, setNewClassroomName] = useState('');
  const [professors, setProfessors] = useState([]);
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [showClassroomModal, setShowClassroomModal] = useState(false);

  // 🔹 Cargar comisiones y aulas
  useEffect(() => {
    const fetchData = async () => {

        
      try {
        const [commRes, profRes, careerRes, classRes] = await Promise.all([
          fetch('http://localhost:8080/api/v1/MiUTN/commission/findAll'),
          fetch('http://localhost:8080/api/v1/miUTN/professor/findAll'),
          fetch(`http://localhost:8080/api/v1/MiUTN/career/findByName?name=${nombre}`),
          fetch('http://localhost:8080/api/v1/MiUTN/schedules/findAllClassroom')
        ]);


        if (!commRes.ok) throw new Error('Error al obtener comisiones');
        if (!profRes.ok) throw new Error('Error al obtener profesores');
        if (!careerRes.ok) throw new Error('Error al obtener carrera');
        if (!classRes.ok) throw new Error('Error al obtener aulas');

        const [commData, profData, careerData, classData] = await Promise.all([
          commRes.json(),
          profRes.json(),
          careerRes.json(),
          classRes.json()
        ]);
        setCommissions(commData);
        setProfessors(profData);
        setCareerId(careerData.id);
        setClassrooms(classData);
      } catch (error) {
        console.error('❌ Error al cargar datos:', error);
      }
        
     
    }

     fetchData();
    console.log(materiaActual)
    if (materiaDesdeLista) {
        setFormData({
            name: materiaDesdeLista.nombre || '',
            commissionId: '', // Puedes mapearlo si tienes el ID
            commissionName: materiaDesdeLista.comision || '',
            classroom: materiaDesdeLista.classroom || '', // Ajustar si viene diferente
            type: materiaDesdeLista.periodo || '',
            schedule: materiaDesdeLista.horarios?.map(h => {
                if (!h) return { day: '', startTime: '', endTime: '' };
                
                const [day, times] = h.split(':');
                if (!times) return { day: day?.trim() || '', startTime: '', endTime: '' };
                
                const [startTime, endTime] = times.split('–').map(t => t?.trim() || '');
                return { 
                    day: day?.trim() || '', 
                    startTime: startTime || '', 
                    endTime: endTime || '' 
                };
            }) || [{ day: '', startTime: '', endTime: '' }],
            professorsId: [''] // Ajustar si tienes datos del profesor
        });
}     
}, [materiaDesdeLista]);

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

  const handleSelectCommission = (commission) => {
    setFormData(prev => ({
      ...prev,
      commissionId: commission.id,
      commissionName: commission.name
    }));
    setShowCommissionModal(false);
  };

  const handleSelectClassroom = (classroom) => {
    setFormData(prev => ({ ...prev, classroom }));
    setShowClassroomModal(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

   const handleClick = (nombre) => {
    navigate(`/materia/${nombre.toLowerCase()}`);
  };
  const handleBackToDashboard = () => {
      navigate('/materia/'+nombre);
    };
    const handleMenuItemClick = (itemId) => {
    setActiveMenuItem(itemId);
  };
    const handleLogout = () => {
    navigate('/login');
  };
  return (
    <>
      <Sidebar
        activeItem={activeMenuItem}
        onItemClick={handleMenuItemClick}
        onBack={handleBackToDashboard}
        onLogout={handleLogout}
      />
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

            {/* 🔹 Comisión */}
            <label>Comisión</label>
            <input
              type="text"
              name="commissionName"
              value={formData.commissionName}
              placeholder="Seleccionar comisión"
              onFocus={() => setShowCommissionModal(true)}
              readOnly
              required
            />

            {/* 🔹 Aula */}
            <label>Aula</label>
            <input
              type="text"
              name="classroom"
              value={formData.classroom}
              placeholder="Seleccionar aula"
              onFocus={() => setShowClassroomModal(true)}
              readOnly
              required
            />

            <label>Período</label>
            <select
              name="type"
              value={formData.type}
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
              value={formData.professorsId[0]}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  professorsId: [e.target.value]
                }))
              }
              required
            >
              <option value="" disabled>Seleccionar profesor</option>
              {professors.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name
                    ? `${p.name} ${p.lastname || ''}`
                    : p.nombre
                    ? `${p.nombre} ${p.apellido || ''}`
                    : 'Profesor sin nombre'}
                </option>
              ))}
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

      {/* 🔹 Modal de comisiones */}
      {showCommissionModal && (
        <div className="modal-overlay" onClick={() => setShowCommissionModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Seleccionar o Agregar Comisión</h3>
            <div className="modal-add">
              <input
                type="text"
                placeholder="Nueva comisión (ej: S41)"
                value={newCommissionName}
                onChange={(e) => setNewCommissionName(e.target.value)}
              />
              <button
                className="btn-add-commission"
                onClick={() => {
                  if (!newCommissionName.trim()) return alert('⚠️ Ingresá un nombre válido');
                  const newCommission = { id: Date.now(), name: newCommissionName.trim() };
                  setCommissions(prev => [...prev, newCommission]);
                  handleSelectCommission(newCommission);
                  setNewCommissionName('');
                }}
              >
                Agregar
              </button>
            </div>
            <ul className="modal-list">
              {commissions.map(c => (
                <li key={c.id} onClick={() => handleSelectCommission(c)}>
                  {c.name || c.nombre}
                </li>
              ))}
            </ul>
            <button className="btn-close-modal" onClick={() => setShowCommissionModal(false)}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* 🔹 Modal de aulas */}
      {showClassroomModal && (
        <div className="modal-overlay" onClick={() => setShowClassroomModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Seleccionar o Agregar Aula</h3>
            <div className="modal-add">
              <input
                type="text"
                placeholder="Nueva aula (ej: 136)"
                value={newClassroomName}
                onChange={(e) => setNewClassroomName(e.target.value)}
              />
              <button
                className="btn-add-commission"
                onClick={() => {
                  if (!newClassroomName.trim()) return alert('⚠️ Ingresá un nombre válido');
                  const newClass = newClassroomName.trim();
                  setClassrooms(prev => [...prev, newClass]);
                  handleSelectClassroom(newClass);
                  setNewClassroomName('');
                }}
              >
                Agregar
              </button>
            </div>
            <ul className="modal-list">
              {classrooms.map((c, i) => (
                <li key={i} onClick={() => handleSelectClassroom(c)}>
                  {c}
                </li>
              ))}
            </ul>
            <button className="btn-close-modal" onClick={() => setShowClassroomModal(false)}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
