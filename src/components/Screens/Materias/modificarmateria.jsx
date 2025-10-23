import React, { useState, useEffect } from 'react';
import './modificarmateria.css';
import Sidebar from '../../Layouts/Sidebar';
import { useNavigate, useParams, useLocation  } from 'react-router-dom';

const materias = [
  { nombre: 'Industrial', color: '#FFA01C' },
  { nombre: 'Sistemas', color: '#4A89FF' },
  { nombre: 'Química', color: '#8A2BE2' },
  { nombre: 'Eléctrica', color: '#B22222' },
  { nombre: 'Mecánica', color: '#20B2AA' },
  { nombre: 'Civil', color: '#228B22' }
];

export default function ModificarMateria() {
  const { nombre } = useParams();
  const navigate = useNavigate();
  const [activeMenuItem, setActiveMenuItem] = useState('materias');
  const location = useLocation();
  const materiaDesdeLista = location.state?.materia;

  // Normalizar nombres para comparación
  const normalizarNombre = (str) => {
    if (!str) return '';
    return str.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  };

  const materiaActual = materias.find(m => 
    normalizarNombre(m.nombre) === normalizarNombre(nombre)
  );
  const colorMateria = materiaActual?.color || '#4A89FF';

  const [formData, setFormData] = useState({
    name: '',
    commissionId: '',
    commissionName: '',
    classroom: '',
    type: '',
    schedule: [{ day: '', startTime: '', endTime: '' }],
    professorsId: ['']
  });

  const [careerId, setCareerId] = useState(null);
  const [commissions, setCommissions] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [newCommissionName, setNewCommissionName] = useState('');
  const [newClassroomName, setNewClassroomName] = useState('');
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [showClassroomModal, setShowClassroomModal] = useState(false);

  // 🔹 Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [commRes, profRes, careerRes, classRes] = await Promise.all([
          fetch('https://8d13dfce1445.ngrok-free.app/api/v1/MiUTN/commission/findAll',{ headers: {
          'ngrok-skip-browser-warning': 'true',
        }}),
          fetch('https://8d13dfce1445.ngrok-free.app/api/v1/miUTN/professor/findAll',{ headers: {
          'ngrok-skip-browser-warning': 'true',
        }}),
          fetch(`https://8d13dfce1445.ngrok-free.app/api/v1/MiUTN/career/findByName?name=${nombre}`,{ headers: {
          'ngrok-skip-browser-warning': 'true',
        }}),
          fetch('https://8d13dfce1445.ngrok-free.app/api/v1/MiUTN/schedules/findAllClassroom',{ headers: {
          'ngrok-skip-browser-warning': 'true',
        }})
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
    };

    fetchData();

    // Cargar datos de la materia si vienen por location.state
    if (materiaDesdeLista) {
      setFormData({
        name: materiaDesdeLista.nombre || '',
        commissionId: materiaDesdeLista.commissionId || '',
        commissionName: materiaDesdeLista.comision || '',
        classroom: materiaDesdeLista.classroom || '',
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
        professorsId: [materiaDesdeLista.professorId || '']
      });
    }
  }, [materiaDesdeLista, nombre]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Aquí iría tu lógica para actualizar la materia
      console.log('Datos a actualizar:', formData);
      alert('Materia actualizada correctamente');
      navigate(`/materia/${nombre.toLowerCase()}`);
    } catch (error) {
      console.error('Error al actualizar materia:', error);
      alert('Error al actualizar la materia');
    }
  };

  const handleBackToDashboard = () => {
    navigate('/materias/' + nombre);
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
      <div className="modificar-materias-container">
        <div className="modificar-materias-content">
          <h1 className="modificar-materias-title" style={{ color: colorMateria }}>
            Modificar Materia
          </h1>

          <form className="modificar-materias-form" onSubmit={handleSubmit}>
            <label className="modificar-materias-label">Nombre</label>
            <input
              type="text"
              name="name"
              className="modificar-materias-input"
              value={formData.name}
              onChange={handleChange}
              required
            />

            {/* 🔹 Comisión */}
            <label className="modificar-materias-label">Comisión</label>
            <input
              type="text"
              name="commissionName"
              className="modificar-materias-input modificar-materias-input-readonly"
              value={formData.commissionName}
              placeholder="Seleccionar comisión"
              onClick={() => setShowCommissionModal(true)}
              onFocus={() => setShowCommissionModal(true)}
              readOnly
              required
            />

            {/* 🔹 Aula */}
            <label className="modificar-materias-label">Aula</label>
            <input
              type="text"
              name="classroom"
              className="modificar-materias-input modificar-materias-input-readonly"
              value={formData.classroom}
              placeholder="Seleccionar aula"
              onClick={() => setShowClassroomModal(true)}
              onFocus={() => setShowClassroomModal(true)}
              readOnly
              required
            />

            <label className="modificar-materias-label">Período</label>
            <select
              name="type"
              className="modificar-materias-select"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Seleccionar período</option>
              <option value="1C">1C</option>
              <option value="2C">2C</option>
              <option value="Anual">Anual</option>
            </select>

            <label className="modificar-materias-label">Profesor</label>
            <select
              className="modificar-materias-select"
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

            <fieldset className="modificar-materias-fieldset">
              <legend className="modificar-materias-legend">Horarios</legend>
              {formData.schedule.map((horario, index) => (
                <div key={index} className="modificar-materias-horario">
                  <input
                    type="text"
                    className="modificar-materias-input"
                    placeholder="Día"
                    value={horario.day}
                    onChange={(e) => handleScheduleChange(index, 'day', e.target.value)}
                    required
                  />
                  <input
                    type="time"
                    className="modificar-materias-input"
                    value={horario.startTime}
                    onChange={(e) => handleScheduleChange(index, 'startTime', e.target.value)}
                    required
                  />
                  <input
                    type="time"
                    className="modificar-materias-input"
                    value={horario.endTime}
                    onChange={(e) => handleScheduleChange(index, 'endTime', e.target.value)}
                    required
                  />
                </div>
              ))}
              <button
                type="button"
                className="modificar-materias-add-horario-btn"
                style={{ backgroundColor: colorMateria }}
                onClick={addSchedule}
              >
                Agregar horario
              </button>
            </fieldset>

            <div className="modificar-materias-actions">
              <button 
                type="submit" 
                className="modificar-materias-submit-btn"
                style={{ backgroundColor: colorMateria }}
              >
                Guardar cambios
              </button>
              <button
                type="button"
                className="modificar-materias-cancel-btn"
                style={{
                  color: colorMateria,
                  border: `2px solid ${colorMateria}`,
                  backgroundColor: 'rgba(255, 255, 255, 0.5)'
                }}
                onClick={() => navigate(`/materias/${nombre.toLowerCase()}`)}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 🔹 Modal de comisiones */}
      {showCommissionModal && (
        <div className="modificar-materias-modal-overlay" onClick={() => setShowCommissionModal(false)}>
          <div className="modificar-materias-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modificar-materias-modal-title">Seleccionar o Agregar Comisión</h3>
            <div className="modificar-materias-modal-add">
              <input
                type="text"
                className="modificar-materias-modal-input"
                placeholder="Nueva comisión (ej: S41)"
                value={newCommissionName}
                onChange={(e) => setNewCommissionName(e.target.value)}
              />
              <button
                type="button"
                className="modificar-materias-modal-add-btn"
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
            <hr className="modificar-materias-modal-divider" />
            <ul className="modificar-materias-modal-list">
              {commissions.map(c => (
                <li key={c.id} className="modificar-materias-modal-item" onClick={() => handleSelectCommission(c)}>
                  {c.name || c.nombre}
                </li>
              ))}
            </ul>
            <button 
              type="button"
              className="modificar-materias-modal-close-btn" 
              onClick={() => setShowCommissionModal(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* 🔹 Modal de aulas */}
      {showClassroomModal && (
        <div className="modificar-materias-modal-overlay" onClick={() => setShowClassroomModal(false)}>
          <div className="modificar-materias-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modificar-materias-modal-title">Seleccionar o Agregar Aula</h3>
            <div className="modificar-materias-modal-add">
              <input
                type="text"
                className="modificar-materias-modal-input"
                placeholder="Nueva aula (ej: 136)"
                value={newClassroomName}
                onChange={(e) => setNewClassroomName(e.target.value)}
              />
              <button
                type="button"
                className="modificar-materias-modal-add-btn"
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
            <hr className="modificar-materias-modal-divider" />
            <ul className="modificar-materias-modal-list">
              {classrooms.map((c, i) => (
                <li key={i} className="modificar-materias-modal-item" onClick={() => handleSelectClassroom(c)}>
                  {c}
                </li>
              ))}
            </ul>
            <button 
              type="button"
              className="modificar-materias-modal-close-btn" 
              onClick={() => setShowClassroomModal(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
}