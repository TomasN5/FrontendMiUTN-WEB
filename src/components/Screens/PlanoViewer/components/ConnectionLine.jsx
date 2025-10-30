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
  const midY = (from[1] + to[1]) / 2 - 20; // Ajuste para la curva

  return (
    <path
      d={`M ${from[0]},${from[1]} Q ${midX},${midY} ${to[0]},${to[1]}`}
      stroke={COLORS.pasillo}
      strokeWidth={4}
      fill="none"
      strokeDasharray={area.tipo === "pasillo" ? "none" : "5,5"}
    />
  );
};

export default ConnectionLine;