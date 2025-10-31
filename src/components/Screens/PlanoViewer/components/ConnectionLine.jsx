import React from 'react';
import { COLORS, AREA_TYPES } from '../utils/constants';
import { geometryUtils } from '../utils/geometry';
import './../styles/ConnectionLine.css';

const ConnectionLine = ({ area, getPolygonCenter }) => {
  // 🔥 VERIFICAR que los nodos existen
  if (!area.from || !area.to) {
    console.warn('⚠️ ConnectionLine: from o to es undefined', area);
    return null;
  }

  // 🔥 FUNCIÓN MEJORADA para obtener coordenadas de cualquier tipo de nodo
  const getNodeCoordinates = (node) => {
    if (!node) return [0, 0];
    
    // Si es un punto (incluyendo puntos especiales)
    if (node.tipo === AREA_TYPES.PUNTO || 
        node.tipo === AREA_TYPES.EXTINTOR ||
        node.tipo === AREA_TYPES.SALIDA_EMERGENCIA ||
        node.tipo === AREA_TYPES.DESFIBRILADOR ||
        node.tipo === AREA_TYPES.BOTIQUIN ||
        node.tipo === AREA_TYPES.ALARMA) {
      return [node.x || 0, node.y || 0];
    }
    
    // Si es un área con puntos
    if (node.points && node.points.length > 0) {
      return getPolygonCenter(node.points);
    }
    
    // Fallback para cualquier otro caso
    return [node.x || 0, node.y || 0];
  };

  const fromCoords = getNodeCoordinates(area.from);
  const toCoords = getNodeCoordinates(area.to);

  // 🔥 VERIFICAR coordenadas válidas
  if (fromCoords.some(isNaN) || toCoords.some(isNaN)) {
    console.warn('⚠️ ConnectionLine: coordenadas inválidas', { fromCoords, toCoords, area });
    return null;
  }

  return (
    <g className="connection-line">
      <line
        x1={fromCoords[0]}
        y1={fromCoords[1]}
        x2={toCoords[0]}
        y2={toCoords[1]}
        className="connection-line__path"
      />
      
      {(area.from.piso !== area.to.piso) && (
        <circle
          cx={(fromCoords[0] + toCoords[0]) / 2}
          cy={(fromCoords[1] + toCoords[1]) / 2}
          r="8"
          className="connection-line__transition-indicator"
        />
      )}
      
      <text
        x={(fromCoords[0] + toCoords[0]) / 2}
        y={(fromCoords[1] + toCoords[1]) / 2 - 8}
        textAnchor="middle"
        className="connection-line__label"
      >
        {area.nombre}
      </text>
    </g>
  );
};

export default ConnectionLine;