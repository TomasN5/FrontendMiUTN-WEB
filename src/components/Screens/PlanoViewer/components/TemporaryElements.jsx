import React from 'react';
import { COLORS, AREA_TYPES } from '../utils/constants';
import { geometryUtils } from '../utils/geometry';

const TemporaryElements = ({ 
  tipoActual, 
  puntosTemporales, 
  cursorPos, 
  modoEdicion 
}) => {
  if (!modoEdicion) return null;

  return (
    <>
      {/* Puntos temporales para modo "punto" - MÁS PEQUEÑOS */}
      {tipoActual === AREA_TYPES.PUNTO && puntosTemporales.map(([x, y], i) => (
        <circle
          key={`tmp-point-${i}`}
          cx={x}
          cy={y}
          r="3"                             // Igual de pequeño que los puntos permanentes
          fill="orange"
          stroke="black"
          strokeWidth="0.5"                 // Más fino
        />
      ))}

      {/* Polígono temporal - LÍNEAS MÁS FINAS */}
      {tipoActual !== AREA_TYPES.PUNTO && tipoActual !== AREA_TYPES.PASILLO && 
       puntosTemporales.length > 0 && (
        <polygon
          points={geometryUtils.toPointsAttr(puntosTemporales)}
          fill="rgba(59,130,246,0.08)"     // Más transparente
          stroke="rgba(59,130,246,0.4)"    // Más transparente
          strokeWidth="1"                   // Más fino
          strokeDasharray="3,2"             // Puntos más pequeños
        />
      )}

      {/* Cursor preview - MÁS PEQUEÑO */}
      {cursorPos && tipoActual !== AREA_TYPES.PASILLO && (
        <circle 
          cx={cursorPos[0]} 
          cy={cursorPos[1]} 
          r="2"                             // Más pequeño (antes 4)
          fill="#2563eb" 
          opacity={0.7}                     // Más transparente
        />
      )}
    </>
  );
};

export default TemporaryElements;