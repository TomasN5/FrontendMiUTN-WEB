import React from 'react';

const DebugEdges = ({ 
  edges, 
  isVisible 
}) => {
  if (!isVisible || !edges || edges.length === 0) {
    return null;
  }

  // Mostrar una muestra de los bordes (cada 3 para no saturar)
  const sampleEdges = edges.filter((_, index) => index % 3 === 0);

  return (
    <>
      {sampleEdges.map((edge, index) => (
        <circle
          key={`debug-${index}`}
          cx={edge.x}
          cy={edge.y}
          r="2"
          fill={edge.orientation === 'horizontal' ? 'rgba(255, 0, 0, 0.7)' : 'rgba(0, 0, 255, 0.7)'}
          stroke="none"
        />
      ))}
      
      {/* Texto informativo */}
      <text
        x="20"
        y="30"
        fill="red"
        fontSize="12"
        fontWeight="bold"
        style={{ pointerEvents: "none" }}
      >
        🔴 Horiz: {edges.filter(e => e.orientation === 'horizontal').length}
      </text>
      <text
        x="20"
        y="45"
        fill="blue"
        fontSize="12"
        fontWeight="bold"
        style={{ pointerEvents: "none" }}
      >
        🔵 Vert: {edges.filter(e => e.orientation === 'vertical').length}
      </text>
      <text
        x="20"
        y="60"
        fill="green"
        fontSize="12"
        fontWeight="bold"
        style={{ pointerEvents: "none" }}
      >
        Total: {edges.length} bordes
      </text>
      // En DebugEdges.jsx
        <text
        x="20"
        y="75"
        fill="purple"
        fontSize="10"
        style={{ pointerEvents: "none" }}
        >
        Snap: Pasillos 15-80px, radio 60px
        </text>
    </>
  );
};

export default DebugEdges;