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

  const handleClick = () => {
    if (isSelectable && onNodeClick) {
      onNodeClick(area);
    }
  };

  // Si es un punto - MUCHO MÁS PEQUEÑO
  if (area.tipo === "punto") {
    return (
      <g
        onClick={handleClick}
        style={{ cursor: isSelectable ? "pointer" : "default" }}
      >
        <circle
          cx={area.x}
          cy={area.y}
          r="3"                             // Mucho más pequeño (antes 6, luego 4, ahora 3)
          fill={COLORS.punto}
          stroke="black"
          strokeWidth="0.5"                 // Más fino
        />
        {zoomScale >= 3 && (                // Solo mostrar texto con más zoom
          <text
            x={area.x + 6}                  // Más cerca
            y={area.y - 6}                  // Más cerca
            fill="black"
            fontSize="10"                   // Más pequeño
            fontWeight="bold"
            style={{ pointerEvents: "none" }}
          >
            {area.nombre}
          </text>
        )}
      </g>
    );
  }

  // Si es un área poligonal normal - BORDES MÁS FINOS
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
        strokeWidth="1"                     // Más fino (antes 2)
      />
      {zoomScale >= 2.5 && (
        <text
          x={centerX}
          y={centerY}
          textAnchor="middle"
          fill="black"
          fontSize="14"                     // Más pequeño
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