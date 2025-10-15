import React, { useState } from 'react';
import './Materias.css';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/sidebar.jsx';
import EliminarMateria from './eliminarmateria.jsx';

// Datos de ejemplo para las materias
const materias = [
  { nombre: 'Proyecto Final', periodo: 'Anual', comision: 'S51', horarios: ['Martes: 20:15–22:30', 'Jueves: 20:10–22:45'] },
  { nombre: 'Sistemas de Gestión', periodo: 'Anual', comision: 'S51', horarios: ['Lunes: 17:30–20:30'] },
  { nombre: 'Gestión Gerencial', periodo: '1C', comision: 'S51', horarios: ['Lunes: 20:30-22:45', 'Martes: 17:30–20:45'] },
  { nombre: 'Ciencia de Datos', periodo: '1C', comision: 'S51', horarios: ['Miércoles: 18:00–20:15', 'Jueves: 18:00–20:15'] },
  { nombre: 'Seguridad en SI', periodo: '2C', comision: 'S51', horarios: ['Lunes: 20:30–22:45', 'Jueves: 18:00–20:15'] }
];

export default function MateriaDetalle() {
  const { nombre } = useParams();
  const navigate = useNavigate();

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
          <select className="comision-select">
            <option>Filtrar por comisión...</option>
            <option>S31</option>
            <option>S41</option>
            <option>S51</option>
          </select>
          <button
            className="agregar-btn"
            onClick={() => navigate(`/materia/${nombre.toLowerCase()}/cargarmateria`)}
          >
            + Agregar Materia
          </button>
        </div>

        <table className="materias-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Período</th>
              <th>Comisión</th>
              <th>Horario</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {materias.map((m) => (
              <tr key={m.nombre}>
                <td>{m.nombre}</td>
                <td>{m.periodo}</td>
                <td>{m.comision}</td>
                <td>
                  {m.horarios.map((h, i) => (
                    <div key={i}>{h}</div>
                  ))}
                </td>
                <td className="acciones">
                  <button
                    style={{ backgroundColor: colorMateria }}
                    onClick={() => navigate(`/materia/${nombre.toLowerCase()}/modificarmateria`)}
                  >
                    Modificar
                  </button>
                  <button
                    style={{
                      color: colorMateria,
                      border: `2px solid ${colorMateria}`,
                      backgroundColor: 'white'
                    }}
                    onClick={() => handleEliminarClick(m.nombre)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

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