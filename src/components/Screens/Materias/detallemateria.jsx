import React, { useState, useEffect } from 'react';
import './detallemateria.css';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../Layouts/Sidebar.jsx';
import EliminarMateria from './eliminarmateria.jsx';

// Datos de respaldo (fallback)
const materiasFallback = [
  { nombre: 'Proyecto Final', periodo: 'Anual', comision: 'S51', horarios: ['Martes: 20:15–22:30', 'Jueves: 20:10–22:45'] },
  { nombre: 'Sistemas de Gestión', periodo: 'Anual', comision: 'S51', horarios: ['Lunes: 17:30–20:30'] },
  { nombre: 'Gestión Gerencial', periodo: '1C', comision: 'S51', horarios: ['Lunes: 20:30-22:45', 'Martes: 17:30–20:45'] },
  { nombre: 'Ciencia de Datos', periodo: '1C', comision: 'S51', horarios: ['Miércoles: 18:00–20:15', 'Jueves: 18:00–20:15'] },
  { nombre: 'Seguridad en SI', periodo: '2C', comision: 'S51', horarios: ['Lunes: 20:30–22:45', 'Jueves: 18:00–20:15'] },
]

export default function MateriaDetalle() {
  const { nombre } = useParams();
  const navigate = useNavigate();

  const [materias, setMaterias] = useState(materiasFallback);
  const [comisiones, setComisiones] = useState([]);
  const [comisionSeleccionada, setComisionSeleccionada] = useState('');
  const [mostrarPopup, setMostrarPopup] = useState(false);
  const [materiaSeleccionada, setMateriaSeleccionada] = useState(null);
  const [activeMenuItem, setActiveMenuItem] = useState('materias');
  
const colorMateria = {
  industrial: '#FFA01C',
  sistemas: '#4A89FF',
  quimica: '#8A2BE2',
  electrica: '#B22222',
  mecanica: '#20B2AA',
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
          console.log(m)
          return [{
            id:m.id,
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
          id:m.id,
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

  const handleConfirmarEliminacion = async () => {
    if (!materiaSeleccionada) return;

    console.log(materiaSeleccionada)
    try {
      const res = await fetch(`http://localhost:8080/api/v1/MiUTN/subject/delete?id=${materiaSeleccionada.id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        throw new Error('Error al eliminar la materia.');
      }

      // 🔹 Eliminar visualmente la materia
      setMaterias((prev) => prev.filter((m) => m.id !== materiaSeleccionada.id));

      alert(`Materia "${materiaSeleccionada.nombre}" eliminada correctamente.`);
    } catch (error) {
      console.error('Error al eliminar materia:', error);
      alert('No se pudo eliminar la materia. Verifica la conexión con la API.');
    } finally {
      setMostrarPopup(false);
      setMateriaSeleccionada(null);
    }
  };

  const handleCancelarEliminacion = () => {
    setMostrarPopup(false);
    setMateriaSeleccionada(null);
  };

  const handleBackToDashboard = () => {
    navigate('/materias');
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
      <div className="detalle-materias-container">
        <h2 className="detalle-materias-subtitle" style={{ color: colorMateria }}>
          Materias de {nombre.charAt(0).toUpperCase() + nombre.slice(1)}
        </h2>

        <div className="detalle-materias-header">
          <select
            className="detalle-materias-select"
            value={comisionSeleccionada}
            onChange={(e) => setComisionSeleccionada(e.target.value)}
          >
            <option value="" className="detalle-materias-option">Filtrar por comisión...</option>
            {comisiones.map((c) => (
              <option key={c.id} value={c.id} className="detalle-materias-option">
                {c.name}
              </option>
            ))}
          </select>

          <button
            className="detalle-materias-agregar-btn"
            onClick={() => navigate(`/materia/${nombre.toLowerCase()}/cargarmateria`)}
          >
            + Agregar Materia
          </button>
        </div>

        <div className="detalle-materias-table-wrapper">
  <table className="detalle-materias-table">
    <thead>
      <tr>
        <th>Nombre</th>
        <th>Tipo</th>
        <th>Comisión</th>
        <th>Horario</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>
      {materias.map((m, idx) => (
        <tr key={`${m.nombre}-${idx}`}>
          <td data-label="Nombre">{m.nombre}</td>
          <td data-label="Tipo">{m.periodo}</td>
          <td data-label="Comisión">{m.comision}</td>
          <td data-label="Horario">
            {m.horarios.map((h, i) => (
              <div key={i} className="detalle-materias-horario-item">{h}</div>
            ))}
          </td>
          <td className="detalle-materias-acciones" data-label="Acciones">
            <button
              className="detalle-materias-modify-btn"
              onClick={() => navigate(`/materia/${nombre.toLowerCase()}/modificarmateria`, {
                state: { materia: m }
              })}
            >
              Modificar
            </button>
            <button
              className="detalle-materias-delete-btn"
              onClick={() => handleEliminarClick(m)}
            >
              Eliminar
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
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