import React from 'react';

const SnapIndicators = ({ 
  snapResult, 
  isVisible 
}) => {
  if (!isVisible || !snapResult || snapResult.snapType === 'none') {
    return null;
  }

  const { point, snapType, originalPoint } = snapResult;

  return (
    <>
      {/* Línea desde el punto original al punto ajustado - MÁS FINA */}
      <line
        x1={originalPoint.x}
        y1={originalPoint.y}
        x2={point.x}
        y2={point.y}
        stroke="rgba(59, 130, 246, 0.4)"  // Más transparente
        strokeWidth="1"                    // Más fina
        strokeDasharray="3,2"              // Puntos más pequeños
      />
      
      {/* Punto original - MÁS PEQUEÑO */}
      <circle
        cx={originalPoint.x}
        cy={originalPoint.y}
        r="2"                             // Más pequeño (antes 4)
        fill="rgba(59, 130, 246, 0.2)"   // Más transparente
        stroke="rgba(59, 130, 246, 0.4)" // Más transparente
        strokeWidth="0.5"                 // Más fino
      />
      
      {/* Punto ajustado - MÁS PEQUEÑO */}
      <circle
        cx={point.x}
        cy={point.y}
        r="3"                             // Más pequeño (antes 6)
        fill="rgba(34, 197, 94, 0.6)"    // Más transparente
        stroke="#16a34a"
        strokeWidth="1"                   // Más fino
      />
      
      {/* Indicador visual del tipo de snap - MÁS FINO */}
      {snapType.includes('horizontal') && (
        <line
          x1={point.x - 12}               // Más corto
          y1={point.y}
          x2={point.x + 12}               // Más corto
          y2={point.y}
          stroke="#16a34a"
          strokeWidth="1"                 // Más fino
        />
      )}
      
      {snapType.includes('vertical') && (
        <line
          x1={point.x}
          y1={point.y - 12}               // Más corto
          x2={point.x}
          y2={point.y + 12}               // Más corto
          stroke="#16a34a"
          strokeWidth="1"                 // Más fino
        />
      )}
      
      {/* Texto indicador - MÁS PEQUEÑO */}
      <text
        x={point.x}
        y={point.y - 15}                  // Más cerca
        textAnchor="middle"
        fill="#16a34a"
        fontSize="8"                      // Más pequeño
        fontWeight="bold"
        style={{ pointerEvents: "none" }}
      >
        {snapType === 'both' ? 'Centrado' : snapType === 'horizontal' ? 'Centro X' : 'Centro Y'}
      </text>
    </>
  );
};

export default SnapIndicators;