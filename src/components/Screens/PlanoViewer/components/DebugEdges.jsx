import React from 'react';
import './../styles/DebugEdges.css';

const DebugEdges = ({ 
  edges, 
  isVisible 
}) => {
  if (!isVisible || !edges || edges.length === 0) {
    return null;
  }

  const sampleEdges = edges.filter((_, index) => index % 3 === 0);

  return (
    <g className="debug-edges">
      {sampleEdges.map((edge, index) => (
        <circle
          key={`debug-${index}`}
          cx={edge.x}
          cy={edge.y}
          r="2"
          className={`debug-edges__point--${edge.orientation}`}
        />
      ))}
      
      <text
        x="20"
        y="30"
        className="debug-edges__info debug-edges__info--horizontal"
      >
        🔴 Horiz: {edges.filter(e => e.orientation === 'horizontal').length}
      </text>
      <text
        x="20"
        y="45"
        className="debug-edges__info debug-edges__info--vertical"
      >
        🔵 Vert: {edges.filter(e => e.orientation === 'vertical').length}
      </text>
      <text
        x="20"
        y="60"
        className="debug-edges__info debug-edges__info--total"
      >
        Total: {edges.length} bordes
      </text>
      <text
        x="20"
        y="75"
        className="debug-edges__info debug-edges__info--config"
      >
        Snap: Pasillos 15-80px, radio 60px
      </text>
    </g>
  );
};

export default DebugEdges;