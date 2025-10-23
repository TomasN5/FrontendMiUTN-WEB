import React, { useState, useEffect } from 'react'; 
import { useNavigate, useParams } from 'react-router-dom';
import './cargarMateria.css';
import Sidebar from '../../Layouts/Sidebar';

const materias = [
  { nombre: 'Industrial', color: '#FFA01C' },
  { nombre: 'Sistemas', color: '#4A89FF' },
  { nombre: 'Química', color: '#8A2BE2' },
  { nombre: 'Eléctrica', color: '#B22222' },
  { nombre: 'Mecánica', color: '#20B2AA' },
  { nombre: 'Civil', color: '#228B22' }
];

// Arrays para los selects
const diasSemana = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado'
];

// Generar opciones de horarios cada 30 minutos
const generarHorarios = () => {
  const horarios = [];
  for (let hora = 7; hora <= 23; hora++) {
    for (let minuto = 0; minuto < 60; minuto += 15) {
      const horaFormateada = `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;
      horarios.push(horaFormateada);
    }
  }
  return horarios;
};

const horariosDisponibles = generarHorarios();

export default function CargarMateria() {
  const { nombre } = useParams();
  const navigate = useNavigate();
  const [activeMenuItem, setActiveMenuItem] = useState('materias');

  const normalizarNombre = (str) => {
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
  const [professors, setProfessors] = useState([]);
  const [period, setPeriod] = useState('');
  const [classrooms, setClassrooms] = useState([]);

  // estados para modales
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [showClassroomModal, setShowClassroomModal] = useState(false);

  // estados auxiliares
  const [newCommissionName, setNewCommissionName] = useState('');
  const [newClassroomName, setNewClassroomName] = useState('');

  // cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [commRes, profRes, careerRes, classRes] = await Promise.all([
          fetch('https://8d13dfce1445.ngrok-free.app/api/v1/MiUTN/commission/findAll',{
             headers: {
          'ngrok-skip-browser-warning': 'true',
        }
          }),
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
  }, [nombre]);

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

  const getYearFromCommission = (commissionName) => {
    const match = commissionName.match(/S(\d)/i);
    return match ? parseInt(match[1]) : null;
  };

  const handleSelectCommission = (commission) => {
    setFormData(prev => ({
      ...prev,
      commissionId: commission.id,
      commissionName: commission.name
    }));
    setShowCommissionModal(false);
  };

  const handleSelectClassroom = (classroomName) => {
    setFormData(prev => ({ ...prev, classroom: classroomName }));
    setShowClassroomModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const selectedCommission = commissions.find(
      (c) => c.id === parseInt(formData.commissionId)
    );

    if (!selectedCommission) {
      alert("⚠️ Debes seleccionar una comisión válida");
      return;
    }

    const year = getYearFromCommission(selectedCommission.name);
    if (!year) {
      alert("⚠️ No se pudo determinar el año a partir de la comisión seleccionada");
      return;
    }

    const scheduleFormatted = formData.schedule.map((s) => ({
      day: `${s.day} ${period}`,
      startTime: s.startTime,
      endTime: s.endTime,
      classroom: formData.classroom,
    }));

    const payload = {
      name: formData.name,
      commissionId: Number(formData.commissionId),
      year,
      type: formData.type,
      schedule: scheduleFormatted,
      careerId,
      professorsId: [Number(formData.professorsId[0])]
    };

    console.log("📦 Datos a enviar:", JSON.stringify(payload, null, 2));

    try {
      const response = await fetch("https://8d13dfce1445.ngrok-free.app/api/v1/MiUTN/subject/save", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' ,
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert('✅ Materia creada correctamente');
        navigate('/materias');
      } else {
        const errorData = await response.json();
        console.error('Error en backend:', errorData);
        alert('❌ Error al crear la materia');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('⚠️ Error de conexión');
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
      <div className="cargar-materias-container">
        <div className="cargar-materias-content">
          <h1 className="cargar-materias-title" style={{ color: colorMateria }}>
            Cargar Materia
          </h1>
          <form className="cargar-materias-form" onSubmit={handleSubmit}>
            
            <label className="cargar-materias-label">Nombre</label>
            <input
              type="text"
              name="name"
              className="cargar-materias-input"
              value={formData.name}
              onChange={handleChange}
              required
            />

            {/* 🔹 Comisión con modal */}
            <label className="cargar-materias-label">Comisión</label>
            <input
              type="text"
              name="commissionName"
              className="cargar-materias-input cargar-materias-input-readonly"
              placeholder="Seleccionar comisión"
              value={formData.commissionName}
              readOnly
              onClick={() => setShowCommissionModal(true)}
              onFocus={() => setShowCommissionModal(true)}
              required
            />

            {showCommissionModal && (
              <div className="cargar-materias-modal-overlay" onClick={() => setShowCommissionModal(false)}>
                <div className="cargar-materias-modal-content" onClick={(e) => e.stopPropagation()}>
                  <h3 className="cargar-materias-modal-title">Seleccionar o Agregar Comisión</h3>

                  <div className="cargar-materias-modal-add">
                    <input
                      type="text"
                      className="cargar-materias-modal-input"
                      placeholder="Escribir nueva comisión (ej: S41)"
                      value={newCommissionName}
                      onChange={(e) => setNewCommissionName(e.target.value)}
                    />
                    <button
                      type="button"
                      className="cargar-materias-modal-add-btn"
                      onClick={() => {
                        if (!newCommissionName.trim()) return alert("⚠️ Ingresá un nombre válido");
                        const newCommission = { id: Date.now(), name: newCommissionName.trim() };
                        setCommissions(prev => [...prev, newCommission]);
                        handleSelectCommission(newCommission);
                        setNewCommissionName('');
                      }}
                    >
                      Agregar
                    </button>
                  </div>

                  <hr className="cargar-materias-modal-divider" />
                  <ul className="cargar-materias-modal-list">
                    {commissions.map((c) => (
                      <li key={c.id} className="cargar-materias-modal-item" onClick={() => handleSelectCommission(c)}>
                        {c.name || c.nombre}
                      </li>
                    ))}
                  </ul>
                  <button 
                    type="button"
                    className="cargar-materias-modal-close-btn" 
                    onClick={() => setShowCommissionModal(false)}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            )}

            {/* 🔹 Aula con modal */}
            <label className="cargar-materias-label">Aula</label>
            <input
              type="text"
              name="classroom"
              className="cargar-materias-input cargar-materias-input-readonly"
              placeholder="Seleccionar aula"
              value={formData.classroom}
              readOnly
              onClick={() => setShowClassroomModal(true)}
              onFocus={() => setShowClassroomModal(true)}
              required
            />

            {showClassroomModal && (
              <div className="cargar-materias-modal-overlay" onClick={() => setShowClassroomModal(false)}>
                <div className="cargar-materias-modal-content" onClick={(e) => e.stopPropagation()}>
                  <h3 className="cargar-materias-modal-title">Seleccionar o Agregar Aula</h3>

                  <div className="cargar-materias-modal-add">
                    <input
                      type="text"
                      className="cargar-materias-modal-input"
                      placeholder="Escribir nueva aula (ej: 135)"
                      value={newClassroomName}
                      onChange={(e) => setNewClassroomName(e.target.value)}
                    />
                    <button
                      type="button"
                      className="cargar-materias-modal-add-btn"
                      onClick={() => {
                        if (!newClassroomName.trim()) return alert("⚠️ Ingresá un nombre válido");
                        const newClassroom = newClassroomName.trim();
                        setClassrooms(prev => [...prev, newClassroom]);
                        handleSelectClassroom(newClassroom);
                        setNewClassroomName('');
                      }}
                    >
                      Agregar
                    </button>
                  </div>

                  <hr className="cargar-materias-modal-divider" />
                  <ul className="cargar-materias-modal-list">
                    {classrooms.map((a, i) => (
                      <li key={i} className="cargar-materias-modal-item" onClick={() => handleSelectClassroom(a)}>
                        {a}
                      </li>
                    ))}
                  </ul>

                  <button 
                    type="button"
                    className="cargar-materias-modal-close-btn" 
                    onClick={() => setShowClassroomModal(false)}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            )}

            <label className="cargar-materias-label">Período</label>
            <select
              className="cargar-materias-select"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              required
            >
              <option value="" disabled>Seleccionar período</option>
              <option value="1C">1C</option>
              <option value="2C">2C</option>
              <option value="Anual">Anual</option>
            </select>

            <label className="cargar-materias-label">Profesor</label>
            <select
              className="cargar-materias-select"
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

            <label className="cargar-materias-label">Tipo</label>
            <select
              name="type"
              className="cargar-materias-select"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Seleccionar tipo</option>
              <option value="OBLIGATORIA">Obligatoria</option>
              <option value="ELECTIVA">Electiva</option>
            </select>

            <fieldset className="cargar-materias-fieldset">
              <legend className="cargar-materias-legend">Horarios</legend>
              {formData.schedule.map((horario, index) => (
                <div key={index} className="cargar-materias-horario">
                  {/* Select para Día */}
                  <select
                    className="cargar-materias-select"
                    value={horario.day}
                    onChange={(e) => handleScheduleChange(index, 'day', e.target.value)}
                    required
                  >
                    <option value="" disabled>Seleccionar día</option>
                    {diasSemana.map((dia) => (
                      <option key={dia} value={dia}>
                        {dia}
                      </option>
                    ))}
                  </select>

                  {/* Select para Hora Inicio */}
                  <select
                    className="cargar-materias-select"
                    value={horario.startTime}
                    onChange={(e) => handleScheduleChange(index, 'startTime', e.target.value)}
                    required
                  >
                    <option value="" disabled>Desde</option>
                    {horariosDisponibles.map((hora) => (
                      <option key={`start-${hora}`} value={hora}>
                        {hora}
                      </option>
                    ))}
                  </select>

                  {/* Select para Hora Fin */}
                  <select
                    className="cargar-materias-select"
                    value={horario.endTime}
                    onChange={(e) => handleScheduleChange(index, 'endTime', e.target.value)}
                    required
                  >
                    <option value="" disabled>Hasta</option>
                    {horariosDisponibles.map((hora) => (
                      <option key={`end-${hora}`} value={hora}>
                        {hora}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
              <button
                type="button"
                className="cargar-materias-add-horario-btn"
                style={{ backgroundColor: colorMateria }}
                onClick={addSchedule}
              >
                Agregar horario
              </button>
            </fieldset>

            <div className="cargar-materias-actions">
              <button 
                type="submit" 
                className="cargar-materias-submit-btn"
                style={{ backgroundColor: colorMateria }}
              >
                Guardar Materia
              </button>
              <button
                type="button"
                className="cargar-materias-cancel-btn"
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
    </>
  );
}