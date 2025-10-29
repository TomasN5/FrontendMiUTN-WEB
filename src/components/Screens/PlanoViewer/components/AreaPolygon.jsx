import React from 'react';
import { COLORS, AREA_TYPES } from '../utils/constants';
import { geometryUtils } from '../utils/geometry';
import Staircase from './Staircase';

const AreaPolygon = ({ 
  area, 
  zoomScale, 
  isSelectable, 
  onNodeClick,
  getPolygonCenter 
}) => {
  // Si es una escalera, usar el componente Staircase
  if (area.tipo === AREA_TYPES.ESCALERA) {
    return (
      <Staircase
        area={area}
        zoomScale={zoomScale}
        isSelectable={isSelectable}
        onNodeClick={onNodeClick}
        getPolygonCenter={getPolygonCenter}
      />
    );
  }

  // Resto del código existente para otros tipos...
  const handleClick = () => {
    if (isSelectable && onNodeClick) {
      onNodeClick(area);
    }
  };

  // Si es un punto
  if (area.tipo === "punto") {
    return (
      <g
        onClick={handleClick}
        style={{ cursor: isSelectable ? "pointer" : "default" }}
      >
        <circle
          cx={area.x}
          cy={area.y}
          r="6"
          fill={COLORS.punto}
          stroke="black"
          strokeWidth="1"
        />
        {zoomScale >= 2.5 && (
          <text
            x={area.x + 10}
            y={area.y - 10}
            fill="black"
            fontSize="14"
            fontWeight="bold"
            style={{ pointerEvents: "none" }}
          >
            {area.nombre}
          </text>
        )}
      </g>
    );
  }

  // Si es un área poligonal normal
  const [centerX, centerY] = getPolygonCenter(area.points);

  return (
    <g
      onClick={handleClick}
      style={{ cursor: isSelectable ? "pointer" : "default" }}
    >
      <polygon
        points={geometryUtils.toPointsAttr(area.points)}
        fill={COLORS[area.tipo]}
        stroke={COLORS.borde}
        strokeWidth={2}
      />
      {zoomScale >= 2.5 && (
        <text
          x={centerX}
          y={centerY}
          textAnchor="middle"
          fill="black"
          fontSize="16"
          fontWeight="bold"
          style={{ pointerEvents: "none" }}
        >
          {area.nombre}
        </text>
      )}
    </g>
  );
};

export default AreaPolygon;