import { useState, useEffect, useCallback } from 'react';

export const useRouteAnimation = () => {
  const [animatedPath, setAnimatedPath] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentAnimation, setCurrentAnimation] = useState(null);

  // Función para iniciar la animación de la ruta
  const startRouteAnimation = useCallback((rutaCompleta, getPointCoordinates, duration = 2000) => {
    // Limpiar animación anterior
    if (currentAnimation) {
      clearTimeout(currentAnimation);
    }
    
    if (!rutaCompleta || rutaCompleta.length < 2) {
      setAnimatedPath([]);
      setIsAnimating(false);
      return;
    }

    setIsAnimating(true);
    setAnimatedPath([]);

    // Convertir la ruta completa a coordenadas
    const puntosCompletos = rutaCompleta.map(id => getPointCoordinates(id));
    
    // Animación paso a paso
    const segmentDuration = duration / (puntosCompletos.length - 1);
    let currentSegment = 0;
    
    const animateNextSegment = () => {
      if (currentSegment < puntosCompletos.length - 1) {
        const segmentPath = puntosCompletos.slice(0, currentSegment + 2);
        setAnimatedPath(segmentPath);
        currentSegment++;
        
        const timeoutId = setTimeout(animateNextSegment, segmentDuration);
        setCurrentAnimation(timeoutId);
      } else {
        setIsAnimating(false);
      }
    };

    // Iniciar con el primer punto
    setAnimatedPath([puntosCompletos[0]]);
    const timeoutId = setTimeout(() => {
      animateNextSegment();
    }, 100);
    
    setCurrentAnimation(timeoutId);
  }, [currentAnimation]);

  // Limpiar animación al desmontar
  useEffect(() => {
    return () => {
      if (currentAnimation) {
        clearTimeout(currentAnimation);
      }
    };
  }, [currentAnimation]);

  // Función para detener la animación
  const stopAnimation = useCallback(() => {
    if (currentAnimation) {
      clearTimeout(currentAnimation);
      setCurrentAnimation(null);
    }
    setIsAnimating(false);
  }, [currentAnimation]);

  // Función para reiniciar la animación
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