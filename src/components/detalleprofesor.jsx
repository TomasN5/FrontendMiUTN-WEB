import React, { useState } from 'react';
import './Styles/detalleprofesor.css';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from './sidebar.jsx';
import EliminarDocente from './eliminardocente.jsx';

// Datos de respaldo (fallback)
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

  const handleEliminarClick = (docente) => {
    setDocenteSeleccionado(docente);
    setMostrarPopup(true);
  };

  const handleConfirmarEliminacion = () => {
    console.log('Eliminando docente:', docenteSeleccionado);
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

        <div className="docentes-table">
          <div className="table-header">
            <div className="header-row">
              <div className="header-cell">Nombre</div>
              <div className="header-cell">Legajo</div>
              <div className="header-cell">Mail</div>
              <div className="header-cell">Acciones</div>
            </div>
          </div>

          <div className="table-body">
            {docentes.map((p, idx) => (
              <div key={`${p.nombre}-${idx}`} className="table-row">
                <div className="table-cell nombre-cell" data-label="Nombre">
                  {p.nombre}
                </div>
                <div className="table-cell legajo-cell" data-label="Legajo">
                  {p.legajo}
                </div>
                <div className="table-cell mail-cell" data-label="Mail">
                  {p.mail}
                </div>
                <div className="table-cell acciones-container" data-label="Acciones">
                  <div className="acciones-buttons">
                    <button
                      className="action-btn modify"
                      onClick={() =>
                        navigate('/profesores/modificarprofesor', {
                          state: { profesor: p },
                        })
                      }
                    >
                      Modificar
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleEliminarClick(p.nombre)}
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
          <EliminarDocente
            onConfirm={handleConfirmarEliminacion}
            onCancel={handleCancelarEliminacion}
          />
        )}
      </div>
    </>
  );
}