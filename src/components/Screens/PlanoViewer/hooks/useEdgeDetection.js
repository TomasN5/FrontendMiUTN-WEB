import { useCallback, useRef } from 'react';

export const useEdgeDetection = (naturalWidth, naturalHeight) => {
  const canvasRef = useRef(null);
  
  // Función para detectar bordes en la imagen
  const detectEdges = useCallback((imageSrc) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = naturalWidth;
        canvas.height = naturalHeight;
        
        // Dibujar la imagen
        ctx.drawImage(img, 0, 0, naturalWidth, naturalHeight);
        
        // Obtener los datos de la imagen
        const imageData = ctx.getImageData(0, 0, naturalWidth, naturalHeight);
        const data = imageData.data;
        
        // Detectar bordes (algoritmo simplificado)
        const edges = [];
        const edgeThreshold = 50; // Sensibilidad para detectar bordes
        
        for (let y = 1; y < naturalHeight - 1; y++) {
          for (let x = 1; x < naturalWidth - 1; x++) {
            const idx = (y * naturalWidth + x) * 4;
            
            // Calcular gradiente (detección de bordes simple)
            const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
            const rightBrightness = (data[idx + 4] + data[idx + 5] + data[idx + 6]) / 3;
            const bottomBrightness = (data[idx + naturalWidth * 4] + data[idx + naturalWidth * 4 + 1] + data[idx + naturalWidth * 4 + 2]) / 3;
            
            const horizontalDiff = Math.abs(brightness - rightBrightness);
            const verticalDiff = Math.abs(brightness - bottomBrightness);
            
            if (horizontalDiff > edgeThreshold || verticalDiff > edgeThreshold) {
              edges.push({ x, y });
            }
          }
        }
        
        resolve(edges);
      };
      
      img.src = imageSrc;
    });
  }, [naturalWidth, naturalHeight]);

  // Función para encontrar el punto más cercano a una pared
  const findClosestEdge = useCallback((edges, point, maxDistance = 50) => {
    let closestEdge = null;
    let minDistance = maxDistance;
    
    for (const edge of edges) {
      const distance = Math.sqrt(
        Math.pow(edge.x - point.x, 2) + Math.pow(edge.y - point.y, 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closestEdge = edge;
      }
    }
    
    return closestEdge;
  }, []);

  // Función para encontrar el punto medio entre dos paredes paralelas
  const findMidPointBetweenWalls = useCallback((edges, point, searchRadius = 100) => {
    // Buscar bordes horizontales (paredes verticales)
    const horizontalEdges = edges.filter(edge => 
      Math.abs(edge.y - point.y) < searchRadius
    );
    
    // Buscar bordes verticales (paredes horizontales)
    const verticalEdges = edges.filter(edge => 
      Math.abs(edge.x - point.x) < searchRadius
    );
    
    let snappedPoint = { ...point };
    let snapType = 'none';
    
    // Snap a paredes verticales (buscar puntos a izquierda y derecha)
    if (horizontalEdges.length >= 2) {
      const leftEdges = horizontalEdges.filter(edge => edge.x < point.x);
      const rightEdges = horizontalEdges.filter(edge => edge.x > point.x);
      
      if (leftEdges.length > 0 && rightEdges.length > 0) {
        const leftMost = Math.max(...leftEdges.map(e => e.x));
        const rightMost = Math.min(...rightEdges.map(e => e.x));
        
        const midX = (leftMost + rightMost) / 2;
        if (Math.abs(midX - point.x) < searchRadius) {
          snappedPoint.x = midX;
          snapType = 'horizontal';
        }
      }
    }
    
    // Snap a paredes horizontales (buscar puntos arriba y abajo)
    if (verticalEdges.length >= 2) {
      const topEdges = verticalEdges.filter(edge => edge.y < point.y);
      const bottomEdges = verticalEdges.filter(edge => edge.y > point.y);
      
      if (topEdges.length > 0 && bottomEdges.length > 0) {
        const topMost = Math.max(...topEdges.map(e => e.y));
        const bottomMost = Math.min(...bottomEdges.map(e => e.y));
        
        const midY = (topMost + bottomMost) / 2;
        if (Math.abs(midY - point.y) < searchRadius) {
          snappedPoint.y = midY;
          snapType = snapType === 'horizontal' ? 'both' : 'vertical';
        }
      }
    }
    
    return {
      point: snappedPoint,
      snapType,
      originalPoint: point
    };
  }, []);

  return {
    detectEdges,
    findClosestEdge,
    findMidPointBetweenWalls
  };
};