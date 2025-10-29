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
      {/* Línea desde el punto original al punto ajustado */}
      <line
        x1={originalPoint.x}
        y1={originalPoint.y}
        x2={point.x}
        y2={point.y}
        stroke="rgba(59, 130, 246, 0.6)"
        strokeWidth="2"
        strokeDasharray="4,2"
      />
      
      {/* Punto original (transparente) */}
      <circle
        cx={originalPoint.x}
        cy={originalPoint.y}
        r="4"
        fill="rgba(59, 130, 246, 0.3)"
        stroke="rgba(59, 130, 246, 0.6)"
        strokeWidth="1"
      />
      
      {/* Punto ajustado (destacado) */}
      <circle
        cx={point.x}
        cy={point.y}
        r="6"
        fill="rgba(34, 197, 94, 0.8)"
        stroke="#16a34a"
        strokeWidth="2"
      />
      
      {/* Indicador visual del tipo de snap */}
      {snapType.includes('horizontal') && (
        <line
          x1={point.x - 15}
          y1={point.y}
          x2={point.x + 15}
          y2={point.y}
          stroke="#16a34a"
          strokeWidth="2"
        />
      )}
      
      {snapType.includes('vertical') && (
        <line
          x1={point.x}
          y1={point.y - 15}
          x2={point.x}
          y2={point.y + 15}
          stroke="#16a34a"
          strokeWidth="2"
        />
      )}
      
      {/* Texto indicador */}
      <text
        x={point.x}
        y={point.y - 20}
        textAnchor="middle"
        fill="#16a34a"
        fontSize="10"
        fontWeight="bold"
        style={{ pointerEvents: "none" }}
      >
        {snapType === 'both' ? 'Centrado' : snapType === 'horizontal' ? 'Centro X' : 'Centro Y'}
      </text>
    </>
  );
};

export default SnapIndicators;