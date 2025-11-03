import React from 'react';
import { COLORS, CARRERAS } from '../utils/constants';
import { geometryUtils } from '../utils/geometry';
import './../styles/Staircase.css';

const Staircase = ({ 
  area, 
  zoomScale, 
  isSelectable, 
  onNodeClick,
  getPolygonCenter,
  hideNames // 🔥 NUEVO: Prop para ocultar nombres
}) => {
  const handleClick = () => {
    if (isSelectable && onNodeClick) {
      onNodeClick(area);
    }
  };

  const [centerX, centerY] = getPolygonCenter(area.points);

  const xs = area.points.map(p => p[0]);
  const ys = area.points.map(p => p[1]);
  const width = Math.max(...xs) - Math.min(...xs);
  const height = Math.max(...ys) - Math.min(...ys);
  const isHorizontal = width > height;

  const staircaseClass = `staircase ${
    isSelectable ? 'staircase--selectable' : ''
  }`;

  const getCarreraNombre = (carreraKey) => {
    const nombres = {
      [CARRERAS.SISTEMAS]: "Sistemas",
      [CARRERAS.QUIMICA]: "Química",
      [CARRERAS.MECANICA]: "Mecánica",
      [CARRERAS.CIVIL]: "Civil",
      [CARRERAS.INDUSTRIAL]: "Industrial",
      [CARRERAS.ELECTRICA]: "Eléctrica"
    };
    return nombres[carreraKey] || carreraKey;
  };

  // 🔥 NUEVA LÓGICA: Determinar si mostrar etiquetas
  const shouldShowLabels = !hideNames && zoomScale >= 2.5;

  return (
  <g
    onClick={handleClick}
    className={staircaseClass}
  >
    {/* 🔥 LA ESCALERA SIEMPRE SE MUESTRA */}
    <polygon
      points={geometryUtils.toPointsAttr(area.points)}
      className="staircase__background"
    />

    {generateStairPattern(area.points, isHorizontal)}
    
    {/* 🔥 EL ICONO SIEMPRE SE MUESTRA */}
    <text
      x={centerX}
      y={centerY}
      textAnchor="middle"
      className={`staircase__icon ${
        Math.min(width, height) > 50 ? 'staircase__icon--large' : 'staircase__icon--small'
      }`}
      fontSize={getStairIconSize(zoomScale)}
    >
      ⬆️⬇️
    </text>

    {/* 🔥 SOLO LAS ETIQUETAS DE NOMBRE SE OCULTAN */}
    {!hideNames && zoomScale >= 2.5 && (
      <>
        <text
          x={centerX}
          y={centerY + 25}
          textAnchor="middle"
          className="staircase__label staircase__label--main"
        >
          {area.nombre}
        </text>

        {area.carreraActual && area.pisoActual && area.carreraDestino && area.pisoDestino && (
          <text
            x={centerX}
            y={centerY + 40}
            textAnchor="middle"
            className="staircase__label staircase__label--info"
          >
            {getCarreraNombre(area.carreraActual)} {area.pisoActual} → {getCarreraNombre(area.carreraDestino)} {area.pisoDestino}
          </text>
        )}

        {area.direccion && area.direccion !== "ambos" && (
          <text
            x={centerX}
            y={centerY + 55}
            textAnchor="middle"
            className="staircase__label staircase__label--direction"
          >
            {area.direccion === "subida" ? "⬆️ Solo subida" : "⬇️ Solo bajada"}
          </text>
        )}
      </>
    )}
  </g>
);
};

const getStairIconSize = (zoomScale) => {
  if (zoomScale >= 5) return '12px';
  if (zoomScale >= 4) return '14px';
  if (zoomScale >= 3) return '16px';
  if (zoomScale >= 2) return '18px';
  return '20px';
};

const generateStairPattern = (points, isHorizontal) => {
  const steps = 5;
  const elements = [];

  const xs = points.map(p => p[0]);
  const ys = points.map(p => p[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  if (isHorizontal) {
    const stepWidth = (maxX - minX) / steps;
    for (let i = 0; i < steps; i++) {
      const x = minX + (i * stepWidth);
      elements.push(
        <line
          key={`step-${i}`}
          x1={x}
          y1={minY}
          x2={x}
          y2={maxY}
          className="staircase__step"
        />
      );
    }
  } else {
    const stepHeight = (maxY - minY) / steps;
    for (let i = 0; i < steps; i++) {
      const y = minY + (i * stepHeight);
      elements.push(
        <line
          key={`step-${i}`}
          x1={minX}
          y1={y}
          x2={maxX}
          y2={y}
          className="staircase__step"
        />
      );
    }
  }

  return elements;
};

export default Staircase;