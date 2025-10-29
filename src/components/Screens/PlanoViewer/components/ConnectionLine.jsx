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

  // Calcular punto medio para la curva
  const midX = (from[0] + to[0]) / 2;
  const midY = (from[1] + to[1]) / 2 - 20;

  return (
    <g>
      {/* Línea principal más visible */}
      <path
        d={`M ${from[0]},${from[1]} Q ${midX},${midY} ${to[0]},${to[1]}`}
        stroke={COLORS.pasillo}
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
      />
      {/* Borde para mejor contraste */}
      <path
        d={`M ${from[0]},${from[1]} Q ${midX},${midY} ${to[0]},${to[1]}`}
        stroke="rgba(0,0,0,0.3)"
        strokeWidth={8}
        fill="none"
        strokeLinecap="round"
        opacity={0.3}
      />
      {/* Etiqueta del pasillo (opcional) */}
      <text
        x={midX}
        y={midY - 10}
        textAnchor="middle"
        fill="#1e40af"
        fontSize="12"
        fontWeight="bold"
        style={{ pointerEvents: "none" }}
      >
        {area.nombre}
      </text>
    </g>
  );
};

export default ConnectionLine;