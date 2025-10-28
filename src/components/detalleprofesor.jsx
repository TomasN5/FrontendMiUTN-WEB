import React, { useEffect, useState } from 'react';
import './Styles/detalleprofesor.css';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from './sidebar.jsx';
import EliminarDocente from './eliminardocente.jsx';

const docentesFallback = [
  { nombre: 'Ruben Guerrieri', legajo: '11111', mail: 'ruben@frlp.utn.edu.ar' },
  { nombre: 'Sergio Antonini', legajo: '22222', mail: 'sergio@frlp.utn.edu.ar' },
  { nombre: 'Martin Sitnyk', legajo: '33333', mail: 'martin@frlp.utn.edu.ar' },
];

export default function ProfesorDetalle() {
  const { nombre } = useParams();
  const navigate = useNavigate();

  const [docentes, setDocentes] = useState(docentesFallback);
  const [mostrarPopup, setMostrarPopup] = useState(false);
  const [docenteSeleccionado, setDocenteSeleccionado] = useState(null);

  const fetchDocentes = async () => {
    try {
      const url = `http://localhost:8080/api/v1/miUTN/professor/findAll`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Error al obtener docentes desde ${url}`);
      const data = await res.json();

      const adaptadas = data.map((m) => ({
        id: m.id,
        nombre: `${m.name} ${m.lastname}`,
        legajo: "111111",
        mail: m.email,
      }));

      setDocentes(adaptadas);
    } catch (error) {
      console.error('No se pudo conectar a la API, usando datos locales.', error);
      setDocentes(docentesFallback);
    }
  };

  useEffect(() => {
    fetchDocentes();
  }, []);

  const handleEliminarClick = (docente) => {
    setDocenteSeleccionado(docente);
    setMostrarPopup(true);
  };

  const handleConfirmarEliminacion = async() => {
    console.log('Eliminando docente:', docenteSeleccionado);
    try {
      const res = await fetch(`http://localhost:8080/api/v1/miUTN/professor/delete?id=${docenteSeleccionado.id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        throw new Error('Error al eliminar al docente.');
      }

      // 🔹 Eliminar visualmente la materia
      setDocentes((prev) => prev.filter((m) => m.id !== docenteSeleccionado.id));

      alert(`Docente "${docenteSeleccionado.nombre}" eliminado correctamente.`);
    } catch (error) {
      console.error('Error al eliminar al docente:', error);
      alert('No se pudo eliminar al docente. Verifica la conexión con la API.');
    } finally {
      setMostrarPopup(false);
      setDocenteSeleccionado(null);
    }

    setMostrarPopup(false);
  };

  const handleCancelarEliminacion = () => {
    setMostrarPopup(false);
    setDocenteSeleccionado(null);
  };

  return (
    <>
      <Sidebar />
      <div className="docentes-container">
        <h2 className="subtitle">Docentes cargados</h2>

        <div className="docentes-header">
          <button
            className="agregar-btn"
            onClick={() => navigate('/profesores/cargarprofesor')}
          >
            + Agregar Docente
          </button>
        </div>
      

        <table className="docentes-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Legajo</th>
              <th>Mail</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {docentes.map((p, idx) => (
              <tr key={idx}>
                <td>{p.nombre}</td>
                <td>{p.legajo}</td>
                <td>{p.mail}</td>
                <td className="acciones">
                  <button
                    className="btn-modificar"
                    onClick={() =>
                      navigate('/profesores/modificarprofesor', { state: { profesor: p } })
                    }
                  >
                    Modificar
                  </button>
                  <button
                    className="btn-eliminar"
                    onClick={() => handleEliminarClick(p)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {mostrarPopup && (
          <EliminarDocente
            onConfirm={handleConfirmarEliminacion}
            onCancel={handleCancelarEliminacion}
          />
        )}
      </div>
    </>
  );
}
