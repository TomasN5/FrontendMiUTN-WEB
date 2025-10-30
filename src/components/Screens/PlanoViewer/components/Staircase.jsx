import React from 'react';
import { COLORS, CARRERAS } from '../utils/constants';
import { geometryUtils } from '../utils/geometry';

const Staircase = ({ 
  area, 
  zoomScale, 
  isSelectable, 
  onNodeClick,
  getPolygonCenter 
}) => {
  const handleClick = () => {
    if (isSelectable && onNodeClick) {
      onNodeClick(area);
    }
  };

  const [centerX, centerY] = getPolygonCenter(area.points);

  // Calcular el ancho y alto del polígono para el patrón de escaleras
  const xs = area.points.map(p => p[0]);
  const ys = area.points.map(p => p[1]);
  const width = Math.max(...xs) - Math.min(...xs);
  const height = Math.max(...ys) - Math.min(...ys);

  // Determinar orientación (horizontal o vertical)
  const isHorizontal = width > height;

  // Función para obtener el nombre completo de la carrera
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

  return (
    <g
      onClick={handleClick}
      style={{ cursor: isSelectable ? "pointer" : "default" }}
    >
      {/* Fondo de la escalera */}
      <polygon
        points={geometryUtils.toPointsAttr(area.points)}
        fill={COLORS.escalera}
        stroke={COLORS.borde}
        strokeWidth={2}
      />

      {/* Patrón de escalones */}
      {generateStairPattern(area.points, isHorizontal)}
      
      {/* Símbolo de escalera en el centro */}
      <text
        x={centerX}
        y={centerY}
        textAnchor="middle"
        fill="#7f1d1d"
        fontSize={Math.min(width, height) > 50 ? "20" : "14"}
        fontWeight="bold"
        style={{ pointerEvents: "none" }}
      >
        ⬆️⬇️
      </text>

      {/* Nombre de la escalera */}
      {zoomScale >= 2.5 && (
        <text
          x={centerX}
          y={centerY + 25}
          textAnchor="middle"
          fill="#7f1d1d"
          fontSize="12"
          fontWeight="bold"
          style={{ pointerEvents: "none" }}
        >
          {area.nombre}
        </text>
      )}

      {/* Información de la conexión entre pisos/carreras */}
      {area.carreraActual && area.pisoActual && area.carreraDestino && area.pisoDestino && (
        <text
          x={centerX}
          y={centerY + 40}
          textAnchor="middle"
          fill="#7f1d1d"
          fontSize="10"
          style={{ pointerEvents: "none" }}
        >
          {getCarreraNombre(area.carreraActual)} {area.pisoActual} → {getCarreraNombre(area.carreraDestino)} {area.pisoDestino}
        </text>
      )}

      {/* Indicador de dirección */}
      {area.direccion && area.direccion !== "ambos" && (
        <text
          x={centerX}
          y={centerY + 55}
          textAnchor="middle"
          fill="#7f1d1d"
          fontSize="8"
          style={{ pointerEvents: "none" }}
        >
          {area.direccion === "subida" ? "⬆️ Solo subida" : "⬇️ Solo bajada"}
        </text>
      )}
    </g>
  );
};

// Función para generar el patrón de escalones (mantener igual)
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
          stroke="rgba(120, 40, 40, 0.6)"
          strokeWidth="1"
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
          stroke="rgba(120, 40, 40, 0.6)"
          strokeWidth="1"
        />
      );
    }
  }

  return elements;
};

export default Staircase;