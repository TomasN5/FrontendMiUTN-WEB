import React from 'react';
import './../styles/SnapIndicators.css';

const SnapIndicators = ({ 
  snapResult, 
  isVisible 
}) => {
  if (!isVisible || !snapResult || snapResult.snapType === 'none') {
    return null;
  }

  const { point, snapType, originalPoint } = snapResult;

  return (
    <g className="snap-indicators">
      <line
        x1={originalPoint.x}
        y1={originalPoint.y}
        x2={point.x}
        y2={point.y}
        className="snap-indicators__line"
      />
      
      <circle
        cx={originalPoint.x}
        cy={originalPoint.y}
        r="2"
        className="snap-indicators__original-point"
      />
      
      <circle
        cx={point.x}
        cy={point.y}
        r="3"
        className="snap-indicators__snap-point"
      />
      
      {snapType.includes('horizontal') && (
        <line
          x1={point.x - 12}
          y1={point.y}
          x2={point.x + 12}
          y2={point.y}
          className="snap-indicators__guide-line--horizontal"
        />
      )}
      
      {snapType.includes('vertical') && (
        <line
          x1={point.x}
          y1={point.y - 12}
          x2={point.x}
          y2={point.y + 12}
          className="snap-indicators__guide-line--vertical"
        />
      )}
      
      <text
        x={point.x}
        y={point.y - 15}
        textAnchor="middle"
        className="snap-indicators__label"
      >
        {snapType === 'both' ? 'Centrado' : snapType === 'horizontal' ? 'Centro X' : 'Centro Y'}
      </text>
    </g>
  );
};

export default SnapIndicators;