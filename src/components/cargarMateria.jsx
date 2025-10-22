import React, { useState, useEffect } from 'react'; 
import { useNavigate, useParams } from 'react-router-dom';
import './Styles/cargarmateria.css';
import Sidebar from './Layouts/Sidebar';

const materias = [
  { nombre: 'Industrial', color: '#FFA01C' },
  { nombre: 'Sistemas', color: '#4A89FF' },
  { nombre: 'Química', color: '#8A2BE2' },
  { nombre: 'Eléctrica', color: '#B22222' },
  { nombre: 'Mecánica', color: '#20B2AA' },
  { nombre: 'Civil', color: '#228B22' }
];

export default function CargarMateria() {
  const { nombre } = useParams();
  const navigate = useNavigate();
  const [activeMenuItem, setActiveMenuItem] = useState('materias');

  const materiaActual = materias.find(m => m.nombre.toLowerCase() === nombre.toLowerCase());
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
      const response = await fetch("http://localhost:8080/api/v1/MiUTN/subject/save", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
          <h1 style={{ color: colorMateria }}>Cargar Materia</h1>
          <form className="panel-form" onSubmit={handleSubmit}>
            
            <label>Nombre</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            {/* 🔹 Comisión con modal */}
            <label>Comisión</label>
            <input
              type="text"
              name="commissionName"
              placeholder="Seleccionar comisión"
              value={formData.commissionName}
              readOnly
              onClick={() => setShowCommissionModal(true)}
              onFocus={() => setShowCommissionModal(true)}
              required
            />

            {showCommissionModal && (
              <div className="modal-overlay" onClick={() => setShowCommissionModal(false)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <h3>Seleccionar o Agregar Comisión</h3>

                  <div className="modal-add">
                    <input
                      type="text"
                      placeholder="Escribir nueva comisión (ej: S41)"
                      value={newCommissionName}
                      onChange={(e) => setNewCommissionName(e.target.value)}
                    />
                    <button
                      className="btn-add-commission"
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

                  <hr style={{ margin: "10px 0" }} />
                  <ul className="modal-list">
                    {commissions.map((c) => (
                      <li key={c.id} className="modal-item" onClick={() => handleSelectCommission(c)}>
                        {c.name || c.nombre}
                      </li>
                    ))}
                  </ul>
                  <button className="btn-close-modal" onClick={() => setShowCommissionModal(false)}>Cerrar</button>
                </div>
              </div>
            )}

            {/* 🔹 Aula con modal */}
            <label>Aula</label>
            <input
              type="text"
              name="classroom"
              placeholder="Seleccionar aula"
              value={formData.classroom}
              readOnly
              onClick={() => setShowClassroomModal(true)}
              onFocus={() => setShowClassroomModal(true)}
              required
            />

            {showClassroomModal && (
              <div className="modal-overlay" onClick={() => setShowClassroomModal(false)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <h3>Seleccionar o Agregar Aula</h3>

                  <div className="modal-add">
                    <input
                      type="text"
                      placeholder="Escribir nueva aula (ej: 135)"
                      value={newClassroomName}
                      onChange={(e) => setNewClassroomName(e.target.value)}
                    />
                    <button
                      className="btn-add-commission"
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

                  <hr style={{ margin: "10px 0" }} />
                  <ul className="modal-list">
                    {classrooms.map((a, i) => (
                      <li key={i} className="modal-item" onClick={() => handleSelectClassroom(a)}>
                        {a}
                      </li>
                    ))}
                  </ul>

                  <button className="btn-close-modal" onClick={() => setShowClassroomModal(false)}>Cerrar</button>
                </div>
              </div>
            )}

            <label>Período</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
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

            <label>Tipo</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Seleccionar tipo</option>
              <option value="OBLIGATORIA">Obligatoria</option>
              <option value="ELECTIVA">Electiva</option>
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
                Guardar Materia
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
