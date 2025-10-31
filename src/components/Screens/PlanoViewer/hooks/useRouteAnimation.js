import { useState, useCallback, useRef } from 'react';
export const useRouteAnimation = () => {
  const [animatedPath, setAnimatedPath] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [finalPath, setFinalPath] = useState([]); // 🔥 NUEVO: Ruta final
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
      setFinalPath([]); // 🔥 Limpiar ruta final también
      setIsAnimating(false);
      return;
    }

    console.log("🎬 Iniciando animación de ruta con", rutaCompleta.length, "puntos");
    setIsAnimating(true);
    setAnimatedPath([]);
    setFinalPath([]); // 🔥 Limpiar ruta final al empezar

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

      // Calcular cuántos puntos mostrar basado en el progreso
      const pointsToShow = Math.ceil(progress * puntos.length);
      const currentPath = puntos.slice(0, pointsToShow);

      setAnimatedPath(currentPath);

      // 🔥 GUARDAR LA RUTA COMPLETA CUANDO TERMINE
      if (progress >= 1) {
        setFinalPath(puntos); // 🔥 Guardar ruta completa
        setIsAnimating(false);
        animationRef.current = null;
        console.log("✅ Animación completada - Ruta guardada");
        return;
      }

      // Detectar transiciones entre pisos
      if (pointsToShow > 1 && onFloorTransition) {
        const previousPoint = puntos[pointsToShow - 2];
        const currentPoint = puntos[pointsToShow - 1];
        
        if (previousPoint && currentPoint && previousPoint.planoId !== currentPoint.planoId) {
          console.log("🏢 Transición detectada:", previousPoint.planoId, "→", currentPoint.planoId);
          onFloorTransition(previousPoint.planoId, currentPoint.planoId);
        }
      }

      animationRef.current = requestAnimationFrame(animate);
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
    setFinalPath([]); // 🔥 Limpiar ruta final también
  }, [stopAnimation]);

  return {
    animatedPath,
    isAnimating,
    finalPath, // 🔥 EXPORTAR la ruta final
    startRouteAnimation,
    stopAnimation,
    resetAnimation
  };
};