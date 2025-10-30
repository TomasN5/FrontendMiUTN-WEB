import { useState, useCallback, useRef } from 'react';

export const useRouteAnimation = () => {
  const [animatedPath, setAnimatedPath] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);

  const startRouteAnimation = useCallback((rutaCompleta, getPointCoordinates, getNodeInfo, onFloorTransition, duration = 4000) => {
    // Limpiar animación anterior
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    if (!rutaCompleta || rutaCompleta.length < 2) {
      setAnimatedPath([]);
      setIsAnimating(false);
      return;
    }

    console.log("🎬 Iniciando animación de ruta con", rutaCompleta.length, "puntos");
    setIsAnimating(true);
    setAnimatedPath([]);

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
    }).filter(point => point.x !== -1000 && point.y !== -1000); // Filtrar puntos inválidos

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

      // Calcular cuántos puntos mostrar basado en el progreso
      const pointsToShow = Math.ceil(progress * puntos.length);
      const currentPath = puntos.slice(0, pointsToShow);

      setAnimatedPath(currentPath);

      // Detectar transiciones entre pisos
      if (pointsToShow > 1 && onFloorTransition) {
        const previousPoint = puntos[pointsToShow - 2];
        const currentPoint = puntos[pointsToShow - 1];
        
        if (previousPoint && currentPoint && previousPoint.planoId !== currentPoint.planoId) {
          console.log("🏢 Transición detectada:", previousPoint.planoId, "→", currentPoint.planoId);
          onFloorTransition(previousPoint.planoId, currentPoint.planoId);
        }
      }

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        animationRef.current = null;
        console.log("✅ Animación completada");
      }
    };

    // Iniciar animación
    animationRef.current = requestAnimationFrame(animate);
  }, []);

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
  }, [stopAnimation]);

  return {
    animatedPath,
    isAnimating,
    startRouteAnimation,
    stopAnimation,
    resetAnimation
  };
};