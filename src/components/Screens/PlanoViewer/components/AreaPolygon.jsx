import React from 'react';
import { COLORS, AREA_TYPES, ICONS } from '../utils/constants';
import { geometryUtils } from '../utils/geometry';
import Staircase from './Staircase';
import SpecialPoint from './SpecialPoint';
import './../styles/AreaPolygon.css';

const AreaPolygon = ({ 
  area, 
  zoomScale, 
  isSelectable, 
  onNodeClick,
  getPolygonCenter,
  tipoActual
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

  // 🔥 TODOS los puntos (normales y especiales) usan SpecialPoint y son seleccionables
  if (isSpecialPoint || isPointWithIcon) {
    return (
      <SpecialPoint
        area={area}
        zoomScale={zoomScale}
        isSelectable={isSelectable} // 🔥 Esto debe ser true cuando estemos en modo pasillo
        onNodeClick={onNodeClick}
        tipoActual={tipoActual}
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
  } ${tipoActual === AREA_TYPES.PASILLO ? 'area-polygon--pasillo-mode' : ''}`;

  // Para áreas (aulas, halls, baños) - mostrar polígono + icono
  const [centerX, centerY] = getPolygonCenter(area.points);

  return (
    <g
      onClick={handleClick}
      className={polygonClass}
    >
      <polygon
        points={geometryUtils.toPointsAttr(area.points)}
        className={`area-polygon__shape area-polygon__shape--${area.tipo}`}
      />
      
      {/* 🔥 ICONO EN EL CENTRO DEL ÁREA */}
      {zoomScale >= 1.2 && ICONS[area.tipo] && ( // 🔥 Mostrar desde zoom 1.2x
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
      
      {zoomScale >= 2.5 && (
        <text
          x={centerX}
          y={centerY + 20}
          textAnchor="middle"
          className={`area-polygon__label ${
            zoomScale >= 3 ? 'area-polygon__label--medium' : 'area-polygon__label--small'
          }`}
        >
          {area.nombre}
        </text>
      )}
    </g>
  );
};

// Función auxiliar para tamaño de iconos en áreas
const getAreaIconSize = (zoomScale) => {
  // Iconos en áreas también se escalan con zoom
  if (zoomScale >= 5) return '10px';   // Zoom muy alto
  if (zoomScale >= 4) return '12px';   // Zoom alto
  if (zoomScale >= 3) return '14px';   // Zoom medio-alto
  if (zoomScale >= 2) return '16px';   // Zoom medio
  if (zoomScale >= 1.5) return '18px'; // Zoom bajo-medio
  return '20px';                       // Zoom normal
};
export default AreaPolygon;