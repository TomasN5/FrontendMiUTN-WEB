// SpecialPoint.jsx - VERSIÓN CORREGIDA
import React from 'react';
import { COLORS, ICONS, AREA_TYPES } from '../utils/constants';
import './../styles/SpecialPoint.css';

// 🔥 DEFINIR COLORS_DESTACADOS localmente por si no está en constants
const COLORS_DESTACADOS = {
  DESTACADO: '#FFD700',
  DESTACADO_BORDE: '#FFA500',
  DESTACADO_GLOW: '#FFF3CD'
};

const SpecialPoint = ({ 
  area, 
  zoomScale, 
  isSelectable, 
  onNodeClick,
  tipoActual,
  modoEdicion,
  hideNames
}) => {
  // 🔥 NUEVA LÓGICA: Si es un punto normal Y NO estamos en modo edición, no renderizar
  if (area.tipo === AREA_TYPES.PUNTO && !modoEdicion) {
    return null;
  }

  const handleClick = () => {
    if (isSelectable && onNodeClick) {
      onNodeClick(area);
    }
  };

  const pointClass = `special-point ${
    isSelectable ? 'special-point--selectable' : ''
  } special-point--${area.tipo} ${
    area.destacado ? 'special-point--destacado' : ''
  }`;

  // 🔥 FUNCIÓN PARA OBTENER COLOR SEGURO
  const getSafeColor = () => {
    if (area.destacado) {
      return COLORS_DESTACADOS.DESTACADO;
    }
    return COLORS[area.tipo] || '#CCCCCC';
  };

  // 🔥 NUEVA LÓGICA: Determinar si mostrar etiqueta
  const shouldShowLabel = !hideNames && zoomScale >= 2;

  return (
    <g
      onClick={handleClick}
      className={pointClass}
    >
      {/* 🔥 EL PUNTO SIEMPRE SE MUESTRA */}
      <circle
        cx={area.x}
        cy={area.y}
        r={getPointSize(zoomScale)}
        className={`special-point__background ${
          area.destacado ? 'special-point__background--destacado' : ''
        }`}
        fill={getSafeColor()}
      />
      
      {/* 🔥 EFECTO DE PULSO PARA PUNTOS DESTACADOS */}
      {area.destacado && (
        <circle
          cx={area.x}
          cy={area.y}
          r={getPointSize(zoomScale) + 3}
          className="special-point__destacado-pulse"
        />
      )}

      {/* 🔥 EL ICONO SIEMPRE SE MUESTRA */}
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
      
      {/* 🔥 SOLO LA ETIQUETA DEL NOMBRE SE OCULTA */}
      {!hideNames && zoomScale >= 2 && (
        <text
          x={area.x}
          y={area.y + getPointSize(zoomScale) + 10}
          textAnchor="middle"
          className="special-point__label"
          fontSize={getLabelSize(zoomScale)}
        >
          {area.nombre}
          {area.destacado && ' ⭐'}
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