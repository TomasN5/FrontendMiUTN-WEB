import { useCallback } from 'react';

export const useEdgeDetection = (naturalWidth, naturalHeight) => {
  
  const detectEdges = useCallback((imageSrc) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.crossOrigin = "Anonymous";
      
      img.onload = () => {
        canvas.width = naturalWidth;
        canvas.height = naturalHeight;
        
        ctx.drawImage(img, 0, 0, naturalWidth, naturalHeight);
        const imageData = ctx.getImageData(0, 0, naturalWidth, naturalHeight);
        const data = imageData.data;
        
        const edges = [];
        detectSimpleEdges(data, naturalWidth, naturalHeight, edges);
        
    
        resolve(edges);
      };
      
      img.onerror = () => {
        console.warn('No se pudo cargar la imagen para detección de bordes');
        resolve([]);
      };
      
      img.src = imageSrc;
    });
  }, [naturalWidth, naturalHeight]);

  const detectSimpleEdges = (data, width, height, edges) => {
    const step = 2;
    
    for (let y = 5; y < height - 5; y += step) {
      for (let x = 5; x < width - 5; x += step) {
        const idx = (y * width + x) * 4;
        
        const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
        if (brightness < 60) {
          edges.push({ 
            x, 
            y, 
            orientation: getPixelOrientation(data, width, x, y),
            strength: 100 - brightness
          });
          continue;
        }
        
        if (hasHighContrast(data, width, height, x, y)) {
          edges.push({ 
            x, 
            y, 
            orientation: getPixelOrientation(data, width, x, y),
            strength: 80
          });
        }
      }
    }
  };

  const getPixelOrientation = (data, width, x, y) => {
    const idx = (y * width + x) * 4;
    const currentBrightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
    
    const leftIdx = (y * width + (x - 2)) * 4;
    const rightIdx = (y * width + (x + 2)) * 4;
    const horizontalContrast = Math.max(
      Math.abs(currentBrightness - (data[leftIdx] + data[leftIdx + 1] + data[leftIdx + 2]) / 3),
      Math.abs(currentBrightness - (data[rightIdx] + data[rightIdx + 1] + data[rightIdx + 2]) / 3)
    );
    
    const topIdx = ((y - 2) * width + x) * 4;
    const bottomIdx = ((y + 2) * width + x) * 4;
    const verticalContrast = Math.max(
      Math.abs(currentBrightness - (data[topIdx] + data[topIdx + 1] + data[topIdx + 2]) / 3),
      Math.abs(currentBrightness - (data[bottomIdx] + data[bottomIdx + 1] + data[bottomIdx + 2]) / 3)
    );
    
    return horizontalContrast > verticalContrast ? 'horizontal' : 'vertical';
  };

  const hasHighContrast = (data, width, height, x, y) => {
    const idx = (y * width + x) * 4;
    const currentBrightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
    
    const neighbors = [
      { dx: -3, dy: 0 }, { dx: 3, dy: 0 },
      { dx: 0, dy: -3 }, { dx: 0, dy: 3 },
    ];
    
    let highContrastCount = 0;
    
    for (const neighbor of neighbors) {
      const newX = x + neighbor.dx;
      const newY = y + neighbor.dy;
      
      if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
        const newIdx = (newY * width + newX) * 4;
        const newBrightness = (data[newIdx] + data[newIdx + 1] + data[newIdx + 2]) / 3;
        const contrast = Math.abs(currentBrightness - newBrightness);
        
        if (contrast > 25) {
          highContrastCount++;
        }
      }
    }
    
    return highContrastCount >= 2;
  };

  // FUNCIÓN AJUSTADA - Busca SOLO paredes MUY cercanas
  const findMidPointBetweenWalls = useCallback((edges, point, searchRadius = 60) => { // Radio más pequeño
    if (edges.length === 0) {
      return {
        point: point,
        snapType: 'none',
        originalPoint: point
      };
    }

    let bestSnap = { point: point, snapType: 'none', distance: Infinity };
    
    // Buscar en un radio MUY pequeño para pasillos estrechos
    const nearbyEdges = edges.filter(edge => 
      Math.abs(edge.x - point.x) < searchRadius && 
      Math.abs(edge.y - point.y) < searchRadius
    );
    
    if (nearbyEdges.length < 2) {
      return {
        point: point,
        snapType: 'none',
        originalPoint: point
      };
    }

    // BUSCAR PASILLOS VERTICALES (entre paredes horizontales MUY cercanas)
    const horizontalEdges = nearbyEdges.filter(edge => edge.orientation === 'horizontal');
    if (horizontalEdges.length >= 2) {
      // Filtrar paredes que estén aproximadamente a la misma altura (muy cercanas en Y)
      const similarYEdges = horizontalEdges.filter(edge => Math.abs(edge.y - point.y) < 15);
      
      if (similarYEdges.length >= 2) {
        // Buscar pares de paredes que estén a izquierda y derecha del punto
        for (let i = 0; i < similarYEdges.length; i++) {
          for (let j = i + 1; j < similarYEdges.length; j++) {
            const edge1 = similarYEdges[i];
            const edge2 = similarYEdges[j];
            
            // Una debe estar a la izquierda y otra a la derecha
            if ((edge1.x < point.x && edge2.x > point.x) || (edge2.x < point.x && edge1.x > point.x)) {
              const leftEdge = edge1.x < edge2.x ? edge1 : edge2;
              const rightEdge = edge1.x > edge2.x ? edge1 : edge2;
              
              const distanceBetween = rightEdge.x - leftEdge.x;
              
              // Rango MUY ESTRECHO para pasillos (15-80 píxeles) - SOLO pasillos angostos
              if (distanceBetween >= 15 && distanceBetween <= 80) {
                const midX = Math.round((leftEdge.x + rightEdge.x) / 2);
                const distanceToMid = Math.abs(midX - point.x);
                
                // Solo hacer snap si está muy cerca del centro
                if (distanceToMid < 30 && distanceToMid < bestSnap.distance) {
                  bestSnap = {
                    point: { ...point, x: midX },
                    snapType: 'horizontal',
                    distance: distanceToMid
                  };
                }
              }
            }
          }
        }
      }
    }
    
    // BUSCAR PASILLOS HORIZONTALES (entre paredes verticales MUY cercanas)
    const verticalEdges = nearbyEdges.filter(edge => edge.orientation === 'vertical');
    if (verticalEdges.length >= 2) {
      // Filtrar paredes que estén aproximadamente en la misma columna (muy cercanas en X)
      const similarXEdges = verticalEdges.filter(edge => Math.abs(edge.x - point.x) < 15);
      
      if (similarXEdges.length >= 2) {
        // Buscar pares de paredes que estén arriba y abajo del punto
        for (let i = 0; i < similarXEdges.length; i++) {
          for (let j = i + 1; j < similarXEdges.length; j++) {
            const edge1 = similarXEdges[i];
            const edge2 = similarXEdges[j];
            
            // Una debe estar arriba y otra abajo
            if ((edge1.y < point.y && edge2.y > point.y) || (edge2.y < point.y && edge1.y > point.y)) {
              const topEdge = edge1.y < edge2.y ? edge1 : edge2;
              const bottomEdge = edge1.y > edge2.y ? edge1 : edge2;
              
              const distanceBetween = bottomEdge.y - topEdge.y;
              
              // Rango MUY ESTRECHO para pasillos (15-80 píxeles) - SOLO pasillos angostos
              if (distanceBetween >= 15 && distanceBetween <= 80) {
                const midY = Math.round((topEdge.y + bottomEdge.y) / 2);
                const distanceToMid = Math.abs(midY - point.y);
                
                // Solo hacer snap si está muy cerca del centro
                if (distanceToMid < 30 && distanceToMid < bestSnap.distance) {
                  if (bestSnap.snapType === 'horizontal') {
                    bestSnap.point.y = midY;
                    bestSnap.snapType = 'both';
                    bestSnap.distance = Math.min(bestSnap.distance, distanceToMid);
                  } else {
                    bestSnap = {
                      point: { ...point, y: midY },
                      snapType: 'vertical',
                      distance: distanceToMid
                    };
                  }
                }
              }
            }
          }
        }
      }
    }
    
    return {
      point: bestSnap.point,
      snapType: bestSnap.snapType,
      originalPoint: point
    };
  }, []);

  return {
    detectEdges,
    findMidPointBetweenWalls
  };
};