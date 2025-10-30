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
      {/* Puntos temporales para modo "punto" */}
      {tipoActual === AREA_TYPES.PUNTO && puntosTemporales.map(([x, y], i) => (
        <circle
          key={`tmp-point-${i}`}
          cx={x}
          cy={y}
          r="6"
          fill="orange"
          stroke="black"
          strokeWidth="1"
        />
      ))}

      {/* Polígono temporal para otros tipos de áreas */}
      {tipoActual !== AREA_TYPES.PUNTO && tipoActual !== AREA_TYPES.PASILLO && 
       puntosTemporales.length > 0 && (
        <polygon
          points={geometryUtils.toPointsAttr(puntosTemporales)}
          fill="rgba(59,130,246,0.12)"
          stroke="rgba(59,130,246,0.6)"
          strokeWidth={2}
          strokeDasharray="4,2"
        />
      )}

      {/* Cursor preview */}
      {cursorPos && tipoActual !== AREA_TYPES.PASILLO && (
        <circle 
          cx={cursorPos[0]} 
          cy={cursorPos[1]} 
          r="4" 
          fill="#2563eb" 
          opacity={0.9} 
        />
      )}
    </>
  );
};

export default TemporaryElements;