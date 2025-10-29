import React from 'react';
import { COLORS } from '../utils/constants';
import { geometryUtils } from '../utils/geometry';

const ConnectionLine = ({ area, getPolygonCenter }) => {
  const from = area.from.tipo === "punto"
    ? [area.from.x, area.from.y]
    : getPolygonCenter(area.from.points);
  
  const to = area.to.tipo === "punto"
    ? [area.to.x, area.to.y]
    : getPolygonCenter(area.to.points);

  return (
    <g>
      {/* Línea principal MÁS FINA y RECTA */}
      <line
        x1={from[0]}
        y1={from[1]}
        x2={to[0]}
        y2={to[1]}
        stroke={COLORS.pasillo}
        strokeWidth="2"                    // Más fina (antes 6)
        fill="none"
        strokeLinecap="round"
      />
      
      {/* Eliminamos el borde para hacerla más limpia */}
      
      {/* Etiqueta del pasillo (opcional y más pequeña) */}
      <text
        x={(from[0] + to[0]) / 2}
        y={(from[1] + to[1]) / 2 - 8}
        textAnchor="middle"
        fill="#1e40af"
        fontSize="10"                      // Más pequeña
        fontWeight="bold"
        style={{ pointerEvents: "none" }}
      >
        {area.nombre}
      </text>
    </g>
  );
};

export default ConnectionLine;