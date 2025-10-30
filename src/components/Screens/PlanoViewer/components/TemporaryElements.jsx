import React from 'react';
import { COLORS, AREA_TYPES } from '../utils/constants';
import { geometryUtils } from '../utils/geometry';
import './../styles/TemporaryElements.css';

const TemporaryElements = ({ 
  tipoActual, 
  puntosTemporales, 
  cursorPos, 
  modoEdicion 
}) => {
  if (!modoEdicion) return null;

  return (
    <g className="temporary-elements">
      {tipoActual === AREA_TYPES.PUNTO && puntosTemporales.map(([x, y], i) => (
        <circle
          key={`tmp-point-${i}`}
          cx={x}
          cy={y}
          r="3"
          className="temporary-elements__point"
        />
      ))}

      {tipoActual !== AREA_TYPES.PUNTO && tipoActual !== AREA_TYPES.PASILLO && 
       puntosTemporales.length > 0 && (
        <polygon
          points={geometryUtils.toPointsAttr(puntosTemporales)}
          className="temporary-elements__polygon"
        />
      )}

      {cursorPos && tipoActual !== AREA_TYPES.PASILLO && (
        <circle 
          cx={cursorPos[0]} 
          cy={cursorPos[1]} 
          r="2"
          className="temporary-elements__cursor"
        />
      )}
    </g>
  );
};

export default TemporaryElements;