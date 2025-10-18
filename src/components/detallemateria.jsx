import React, { useState, useEffect } from 'react';
import './Styles/detallemateria.css';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/sidebar.jsx';
import EliminarMateria from './eliminarmateria.jsx';

// Datos de respaldo (fallback)
const materiasFallback = [
  { nombre: 'Proyecto Final', periodo: 'Anual', comision: 'S51', horarios: ['Martes: 20:15–22:30', 'Jueves: 20:10–22:45'] },
  { nombre: 'Sistemas de Gestión', periodo: 'Anual', comision: 'S51', horarios: ['Lunes: 17:30–20:30'] },
  { nombre: 'Gestión Gerencial', periodo: '1C', comision: 'S51', horarios: ['Lunes: 20:30-22:45', 'Martes: 17:30–20:45'] },
  { nombre: 'Ciencia de Datos', periodo: '1C', comision: 'S51', horarios: ['Miércoles: 18:00–20:15', 'Jueves: 18:00–20:15'] },
  { nombre: 'Seguridad en SI', periodo: '2C', comision: 'S51', horarios: ['Lunes: 20:30–22:45', 'Jueves: 18:00–20:15'] }
];

export default function MateriaDetalle() {
  const { nombre } = useParams();
  const navigate = useNavigate();

  const [materias, setMaterias] = useState(materiasFallback);
  const [comisiones, setComisiones] = useState([]);
  const [comisionSeleccionada, setComisionSeleccionada] = useState('');
  const [mostrarPopup, setMostrarPopup] = useState(false);
  const [materiaSeleccionada, setMateriaSeleccionada] = useState(null);

  const colorMateria = {
    industrial: '#FFA01C',
    sistemas: '#4A89FF',
    química: '#8A2BE2',
    eléctrica: '#B22222',
    mecánica: '#20B2AA',
    civil: '#228B22'
  }[nombre.toLowerCase()] || '#4A89FF';

  // 🔹 Cargar comisiones al iniciar
  useEffect(() => {
    const fetchComisiones = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/v1/MiUTN/commission/findAll');
        if (!res.ok) throw new Error('Error al obtener comisiones');
        const data = await res.json();
        setComisiones(data);
      } catch (error) {
        console.error('No se pudo conectar a la API de comisiones, usando datos locales.');
        setComisiones([{ id: 1, name: 'S31' }, { id: 2, name: 'S41' }, { id: 3, name: 'S51' }]);
      }
    };
    fetchComisiones();
  }, []);

  // 🔹 Cargar materias según carrera o comisión
  const fetchMaterias = async (careerName, commissionId = null) => {
    try {
      const url = commissionId
        ? `http://localhost:8080/api/v1/MiUTN/subject/findByCommissionId?commissionId=${commissionId}`
        : `http://localhost:8080/api/v1/MiUTN/subject/findByCareerName?careerName=${careerName}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`Error al obtener materias desde ${url}`);
      const data = await res.json();

      // 🔹 Adaptar datos
      const adaptadas = data.flatMap((m) => {
        if (!m.schedule || m.schedule.length === 0) {
          return [{
            nombre: m.name,
            periodo: m.type,
            comision: '-',
            horarios: []
          }];
        }

        const porComision = m.schedule.reduce((acc, s) => {
          const comName = s.commission?.name || '-';
          if (!acc[comName]) acc[comName] = [];
          acc[comName].push(`${s.day}: ${s.startTime.slice(0, 5)}–${s.endTime.slice(0, 5)}`);
          return acc;
        }, {});

        return Object.entries(porComision).map(([comision, horarios]) => ({
          nombre: m.name,
          periodo: m.type,
          comision,
          horarios
        }));
      });

      // 🔹 Ordenar alfabéticamente por nombre de comisión
      const ordenadas = adaptadas.sort((a, b) => {
        const numA = parseInt(a.comision.replace(/\D/g, ''), 10);
        const numB = parseInt(b.comision.replace(/\D/g, ''), 10);
        return numA - numB || a.comision.localeCompare(b.comision);
      });

      setMaterias(ordenadas);
    } catch (error) {
      console.error('No se pudo conectar a la API de materias, usando datos locales.', error);
      setMaterias(materiasFallback);
    }
  };

  // 🔹 Cuando cambia la comisión seleccionada, recargar materias
  useEffect(() => {
    if (comisionSeleccionada) {
      fetchMaterias(nombre, Number(comisionSeleccionada));
    } else {
      fetchMaterias(nombre);
    }
  }, [comisionSeleccionada, nombre]);

  const handleEliminarClick = (materia) => {
    setMateriaSeleccionada(materia);
    setMostrarPopup(true);
  };

  const handleConfirmarEliminacion = () => {
    console.log('Eliminando materia:', materiaSeleccionada);
    setMostrarPopup(false);
  };

  const handleCancelarEliminacion = () => {
    setMostrarPopup(false);
    setMateriaSeleccionada(null);
  };

  return (
    <>
      <Sidebar />
      <div className="materias-container">
        <h2 className="subtitle" style={{ color: colorMateria }}>
          Materias de {nombre.charAt(0).toUpperCase() + nombre.slice(1)}
        </h2>

        <div className="materias-header">
          <select
            className="comision-select"
            value={comisionSeleccionada}
            onChange={(e) => setComisionSeleccionada(e.target.value)}
          >
            <option value="" className="option-style">Filtrar por comisión...</option>
            {comisiones.map((c) => (
              <option key={c.id} value={c.id} className="option-style">
                {c.name}
              </option>
            ))}
          </select>

          <button
            className="agregar-btn"
            onClick={() => navigate(`/materia/${nombre.toLowerCase()}/cargarmateria`)}
          >
            + Agregar Materia
          </button>
        </div>

        <div className="materias-table">
          <div className="table-header">
            <div className="header-row">
              <div className="header-cell">Nombre</div>
              <div className="header-cell">Tipo</div>
              <div className="header-cell">Comisión</div>
              <div className="header-cell">Horario</div>
              <div className="header-cell">Acciones</div>
            </div>
          </div>
          
          <div className="table-body">
            {materias.map((m, idx) => (
              <div key={`${m.nombre}-${idx}`} className="table-row">
                <div className="table-cell nombre-cell" data-label="Nombre">
                  {m.nombre}
                </div>
                <div className="table-cell periodo-cell" data-label="Tipo">
                  {m.periodo}
                </div>
                <div className="table-cell comision-cell" data-label="Comisión">
                  {m.comision}
                </div>
                <div className="table-cell horario-cell" data-label="Horario">
                  {m.horarios.map((h, i) => (
                    <div key={i} className="horario-item">{h}</div>
                  ))}
                </div>
                <div className="table-cell acciones-container" data-label="Acciones">
                  <div className="acciones-buttons">
                    <button
                      className="action-btn modify"
                      onClick={() => navigate(`/materia/${nombre.toLowerCase()}/modificarmateria`, {
                        state: { materia: m }
                      })}
                    >
                      Modificar
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleEliminarClick(m.nombre)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {mostrarPopup && (
          <EliminarMateria
            onConfirm={handleConfirmarEliminacion}
            onCancel={handleCancelarEliminacion}
          />
        )}
      </div>
    </>
  );
}