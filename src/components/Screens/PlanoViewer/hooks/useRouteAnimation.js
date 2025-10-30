// useRouteAnimation.js - ENFOQUE SIMPLIFICADO
import { useState, useCallback } from 'react';

export const useRouteAnimation = () => {
  const [animatedPath, setAnimatedPath] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentAnimation, setCurrentAnimation] = useState(null);

  const startRouteAnimation = useCallback((rutaCompleta, getPointCoordinates, duration = 3000) => {
    if (currentAnimation) clearTimeout(currentAnimation);
    
    if (!rutaCompleta || rutaCompleta.length < 2) {
      setAnimatedPath([]);
      setIsAnimating(false);
      return;
    }

    console.log("🎬 Animando ruta:", rutaCompleta);
    setIsAnimating(true);
    setAnimatedPath([]);

    const puntos = rutaCompleta.map(id => getPointCoordinates(id));
    const pointDuration = duration / puntos.length;
    let currentIndex = 0;

    const animateNext = () => {
      if (currentIndex < puntos.length) {
        const pathSoFar = puntos.slice(0, currentIndex + 1);
        setAnimatedPath(pathSoFar);
        currentIndex++;
        
        const timeoutId = setTimeout(animateNext, pointDuration);
        setCurrentAnimation(timeoutId);
      } else {
        setIsAnimating(false);
      }
    };

    setAnimatedPath([puntos[0]]);
    const initialTimeout = setTimeout(animateNext, 200);
    setCurrentAnimation(initialTimeout);
  }, [currentAnimation]);

  const stopAnimation = useCallback(() => {
    if (currentAnimation) clearTimeout(currentAnimation);
    setIsAnimating(false);
  }, [currentAnimation]);

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