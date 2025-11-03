import { useState, useCallback, useRef } from 'react';

export const useRouteAnimation = () => {
  const [animatedPath, setAnimatedPath] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [finalPath, setFinalPath] = useState([]);
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);
  const lastPointRef = useRef(null);

  // 🔥 NUEVA FUNCIÓN: Interpolación suave entre puntos
  const interpolatePoints = useCallback((startPoint, endPoint, progress) => {
    return {
      x: startPoint.x + (endPoint.x - startPoint.x) * progress,
      y: startPoint.y + (endPoint.y - startPoint.y) * progress,
      nodeId: endPoint.nodeId, // Mantener el ID del punto destino
      isStair: endPoint.isStair,
      planoId: endPoint.planoId
    };
  });

  // 🔥 FUNCIÓN MEJORADA: Animación más fluida
  const startRouteAnimation = useCallback((rutaCompleta, getPointCoordinates, getNodeInfo, onFloorTransition, duration = 5000) => {
    // Limpiar animación anterior
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    if (!rutaCompleta || rutaCompleta.length < 2) {
      setAnimatedPath([]);
      setFinalPath([]);
      setIsAnimating(false);
      return;
    }

    console.log("🎬 Iniciando animación de ruta mejorada con", rutaCompleta.length, "puntos");
    setIsAnimating(true);
    setAnimatedPath([]);
    setFinalPath([]);
    lastPointRef.current = null;

    // Preparar todos los puntos de la ruta
    const puntos = rutaCompleta.map(id => {
      const coords = getPointCoordinates(id);
      const nodeInfo = getNodeInfo ? getNodeInfo(id) : null;
      return {
        ...coords,
        nodeId: id,
        isStair: nodeInfo?.tipo === 'escalera',
        planoId: nodeInfo?.planoId
      };
    }).filter(point => point.x !== -1000 && point.y !== -1000);

    if (puntos.length < 2) {
      console.log("❌ No hay puntos válidos para animar");
      setIsAnimating(false);
      return;
    }

    startTimeRef.current = null;
    const totalDuration = duration;

    const animate = (currentTime) => {
      if (!startTimeRef.current) startTimeRef.current = currentTime;
      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / totalDuration, 1);

      // 🔥 CÁLCULO MEJORADO: Animación continua en lugar de por segmentos discretos
      const totalDistance = puntos.length - 1;
      const continuousProgress = progress * totalDistance;
      
      const segmentIndex = Math.floor(continuousProgress);
      const segmentProgress = continuousProgress - segmentIndex;

      let currentPath = [];
      
      if (segmentIndex < puntos.length - 1) {
        // Agregar todos los puntos completados
        currentPath = puntos.slice(0, segmentIndex + 1);
        
        // 🔥 INTERPOLACIÓN SUCIA: Agregar punto interpolado entre segmentos
        const currentSegment = puntos[segmentIndex];
        const nextSegment = puntos[segmentIndex + 1];
        
        if (currentSegment && nextSegment) {
          const interpolatedPoint = interpolatePoints(currentSegment, nextSegment, segmentProgress);
          currentPath.push(interpolatedPoint);
          lastPointRef.current = interpolatedPoint;
        }
      } else {
        // Animación completada
        currentPath = puntos;
        lastPointRef.current = puntos[puntos.length - 1];
      }

      setAnimatedPath(currentPath);

      // Detectar transiciones entre pisos
      if (segmentIndex > 0 && segmentIndex < puntos.length - 1 && onFloorTransition) {
        const previousPoint = puntos[segmentIndex];
        const currentPoint = puntos[segmentIndex + 1];
        
        if (previousPoint && currentPoint && previousPoint.planoId !== currentPoint.planoId) {
          console.log("🏢 Transición detectada:", previousPoint.planoId, "→", currentPoint.planoId);
          onFloorTransition(previousPoint.planoId, currentPoint.planoId);
        }
      }

      if (progress >= 1) {
        // 🔥 ANIMACIÓN COMPLETADA MEJORADA
        setFinalPath(puntos);
        setIsAnimating(false);
        animationRef.current = null;
        console.log("✅ Animación completada - Ruta guardada");
        
        // 🔥 EFECTO FINAL: Pequeño pulso al terminar
        setTimeout(() => {
          setAnimatedPath([...puntos]); // Forzar re-render para efectos finales
        }, 100);
        
        return;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    // Iniciar animación
    animationRef.current = requestAnimationFrame(animate);
  }, [interpolatePoints]);

  const stopAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setIsAnimating(false);
  }, []);

  const resetAnimation = useCallback(() => {
    stopAnimation();
    setAnimatedPath([]);
    setFinalPath([]);
    lastPointRef.current = null;
  }, [stopAnimation]);

  return {
    animatedPath,
    isAnimating,
    finalPath,
    startRouteAnimation,
    stopAnimation,
    resetAnimation,
    lastPoint: lastPointRef.current // 🔥 NUEVO: Punto actual para efectos especiales
  };
};