import React from 'react';
import { COLORS, ICONS } from '../utils/constants';
import './../styles/SpecialPoint.css';

const SpecialPoint = ({ 
  area, 
  zoomScale, 
  isSelectable, 
  onNodeClick,
  tipoActual 
}) => {
  const handleClick = () => {
    if (isSelectable && onNodeClick) {
      onNodeClick(area);
    }
  };

  const pointClass = `special-point ${
    isSelectable ? 'special-point--selectable' : ''
  } special-point--${area.tipo}`;

  return (
    <g
      onClick={handleClick}
      className={pointClass}
    >
      {/* 🔥 Círculo de fondo SIN animación */}
      <circle
        cx={area.x}
        cy={area.y}
        r={getPointSize(zoomScale)}
        className="special-point__background"
        fill={COLORS[area.tipo] || '#CCCCCC'}
      />
      
      {/* 🔥 Icono SIN animación */}
      <text
        x={area.x}
        y={area.y}
        textAnchor="middle"
        dominantBaseline="central"
        className="special-point__icon"
        fontSize={getIconSize(zoomScale)}
      >
        {ICONS[area.tipo] || '📍'}
      </text>
      
      {/* Etiqueta en zoom alto - SIN animación */}
      {zoomScale >= 2 && (
        <text
          x={area.x}
          y={area.y + getPointSize(zoomScale) + 10}
          textAnchor="middle"
          className="special-point__label"
          fontSize={getLabelSize(zoomScale)}
        >
          {area.nombre}
        </text>
      )}
    </g>
  );
};

// Funciones auxiliares para tamaños responsivos (sin cambios)
const getPointSize = (zoomScale) => {
  if (zoomScale >= 5) return 3;
  if (zoomScale >= 4) return 4;
  if (zoomScale >= 3) return 5;
  if (zoomScale >= 2) return 6;
  if (zoomScale >= 1.5) return 7;
  return 8;
};

const getIconSize = (zoomScale) => {
  if (zoomScale >= 5) return '6px';
  if (zoomScale >= 4) return '8px';
  if (zoomScale >= 3) return '10px';
  if (zoomScale >= 2) return '12px';
  if (zoomScale >= 1.5) return '14px';
  return '16px';
};

const getLabelSize = (zoomScale) => {
  if (zoomScale >= 5) return '8px';
  if (zoomScale >= 4) return '9px';
  if (zoomScale >= 3) return '10px';
  if (zoomScale >= 2) return '11px';
  return '12px';
};

export default SpecialPoint;