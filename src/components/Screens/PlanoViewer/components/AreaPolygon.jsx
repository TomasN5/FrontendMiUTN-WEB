// AreaPolygon.jsx - VERSIÓN CORREGIDA
import React from 'react';
import { COLORS, AREA_TYPES, ICONS } from '../utils/constants';
import { geometryUtils } from '../utils/geometry';
import Staircase from './Staircase';
import SpecialPoint from './SpecialPoint';
import './../styles/AreaPolygon.css';

// 🔥 DEFINIR COLORS_DESTACADOS localmente por si no está en constants
const COLORS_DESTACADOS = {
  DESTACADO: '#FFD700',
  DESTACADO_BORDE: '#FFA500',
  DESTACADO_GLOW: '#FFF3CD'
};

const AreaPolygon = ({ 
  area, 
  zoomScale, 
  isSelectable, 
  onNodeClick,
  getPolygonCenter,
  tipoActual,
  modoEdicion,
  hideNames
}) => {
  // Detectar si es un punto especial
  const isSpecialPoint = [
    AREA_TYPES.EXTINTOR,
    AREA_TYPES.SALIDA_EMERGENCIA, 
    AREA_TYPES.DESFIBRILADOR,
    AREA_TYPES.BOTIQUIN,
    AREA_TYPES.ALARMA,
    AREA_TYPES.TOTEM
  ].includes(area.tipo);

  // Detectar si es un punto normal
  const isPointWithIcon = area.tipo === AREA_TYPES.PUNTO;

  // 🔥 NUEVA LÓGICA: Si es un punto normal Y NO estamos en modo edición, no renderizar
  if (isPointWithIcon && !modoEdicion) {
    return null;
  }

  // 🔥 TODOS los puntos (normales y especiales) usan SpecialPoint y son seleccionables
  if (isSpecialPoint || isPointWithIcon) {
    return (
      <SpecialPoint
        area={area}
        zoomScale={zoomScale}
        isSelectable={isSelectable}
        onNodeClick={onNodeClick}
        tipoActual={tipoActual}
        modoEdicion={modoEdicion}
        hideNames={hideNames}
      />
    );
  }

  if (area.tipo === AREA_TYPES.ESCALERA) {
    return (
      <Staircase
        area={area}
        zoomScale={zoomScale}
        isSelectable={isSelectable}
        onNodeClick={onNodeClick}
        getPolygonCenter={getPolygonCenter}
        hideNames={hideNames}
      />
    );
  }

  const handleClick = () => {
    if (isSelectable && onNodeClick) {
      onNodeClick(area);
    }
  };

  const polygonClass = `area-polygon ${
    isSelectable ? 'area-polygon--selectable' : ''
  } ${tipoActual === AREA_TYPES.PASILLO ? 'area-polygon--pasillo-mode' : ''}
  ${area.destacado ? 'area-polygon--destacado' : ''}`;

  // Para áreas (aulas, halls, baños) - mostrar polígono + icono
  const [centerX, centerY] = getPolygonCenter(area.points);

  // 🔥 NUEVA LÓGICA: Determinar si mostrar etiquetas
  const shouldShowLabels = !hideNames || 
    (area.tipo !== AREA_TYPES.PASILLO && area.tipo !== AREA_TYPES.PUNTO);

  // 🔥 FUNCIÓN PARA OBTENER COLOR SEGURO
  const getSafeColor = () => {
    if (area.destacado) {
      return COLORS_DESTACADOS.DESTACADO;
    }
    return COLORS[area.tipo] || '#CCCCCC';
  };

  return (
    <g
      onClick={handleClick}
      className={polygonClass}
    >
      {/* 🔥 EL POLÍGONO SIEMPRE SE MUESTRA */}
      <polygon
        points={geometryUtils.toPointsAttr(area.points)}
        className={`area-polygon__shape area-polygon__shape--${area.tipo} ${
          area.destacado ? 'area-polygon__shape--destacado' : ''
        }`}
        fill={getSafeColor()}
      />
      
      {/* 🔥 EFECTO DE BRILLO PARA ELEMENTOS DESTACADOS */}
      {area.destacado && (
        <polygon
          points={geometryUtils.toPointsAttr(area.points)}
          className="area-polygon__destacado-glow"
        />
      )}

      {/* 🔥 ICONO EN EL CENTRO DEL ÁREA - SIEMPRE VISIBLE */}
      {zoomScale >= 1.2 && ICONS[area.tipo] && (
          <text
            x={centerX}
            y={centerY}
            textAnchor="middle"
            dominantBaseline="central"
            className="area-polygon__icon"
            fontSize={getAreaIconSize(zoomScale)}
          >
            {ICONS[area.tipo]}
          </text>
        )}
      
      {/* 🔥 SOLO LA ETIQUETA DEL NOMBRE SE OCULTA */}
      {!hideNames && zoomScale >= 2.5 && (
        <text
          x={centerX}
          y={centerY + 20}
          textAnchor="middle"
          className={`area-polygon__label ${
            zoomScale >= 3 ? 'area-polygon__label--medium' : 'area-polygon__label--small'
          }`}
        >
          {area.nombre}
          {area.destacado && ' ⭐'}
        </text>
      )}
    </g>
  );
};

// Función auxiliar para tamaño de iconos en áreas
const getAreaIconSize = (zoomScale) => {
  // Iconos en áreas también se escalan con zoom
  if (zoomScale >= 5) return '10px';
  if (zoomScale >= 4) return '12px';
  if (zoomScale >= 3) return '14px';
  if (zoomScale >= 2) return '16px';
  if (zoomScale >= 1.5) return '18px';
  return '20px';
};

export default AreaPolygon;