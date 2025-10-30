import { useState, useCallback } from 'react';
import { PLANOS_CONFIG, getPlanosByCarrera, getCarrerasDisponibles, CARRERAS } from '../utils/constants';

export const usePlanoManager = () => {
  const [planoActual, setPlanoActual] = useState(PLANOS_CONFIG.planta_principal);
  const [carreraActual, setCarreraActual] = useState('general');
  const [planosCarreraActual, setPlanosCarreraActual] = useState([]);

  // Inicializar planos para una carrera
  const inicializarPlanosCarrera = useCallback((carrera) => {
    const planos = getPlanosByCarrera(carrera);
    setPlanosCarreraActual(planos);
    setCarreraActual(carrera);
    
    // Si hay planos, establecer el primero como activo
    if (planos.length > 0) {
      setPlanoActual(planos[0]);
    }
    
    return planos;
  }, []);

  // Cambiar de carrera
  const cambiarCarrera = useCallback((nuevaCarrera) => {
    const planos = inicializarPlanosCarrera(nuevaCarrera);
    
    if (planos.length > 0) {
      setPlanoActual(planos[0]);
    }
  }, [inicializarPlanosCarrera]);

  // Cambiar de plano específico
  const cambiarPlano = useCallback((planoId) => {
    const nuevoPlano = PLANOS_CONFIG[planoId];
    if (nuevoPlano) {
      setPlanoActual(nuevoPlano);
    }
  }, []);

  // Obtener el plano siguiente en la misma carrera
  const planoSiguiente = useCallback(() => {
    if (!planoActual || planosCarreraActual.length === 0) return null;
    
    const indiceActual = planosCarreraActual.findIndex(p => p.id === planoActual.id);
    const siguienteIndice = (indiceActual + 1) % planosCarreraActual.length;
    return planosCarreraActual[siguienteIndice];
  }, [planoActual, planosCarreraActual]);

  // Obtener el plano anterior en la misma carrera
  const planoAnterior = useCallback(() => {
    if (!planoActual || planosCarreraActual.length === 0) return null;
    
    const indiceActual = planosCarreraActual.findIndex(p => p.id === planoActual.id);
    const anteriorIndice = (indiceActual - 1 + planosCarreraActual.length) % planosCarreraActual.length;
    return planosCarreraActual[anteriorIndice];
  }, [planoActual, planosCarreraActual]);

  // Avanzar al siguiente plano
  const avanzarPlano = useCallback(() => {
    const siguiente = planoSiguiente();
    if (siguiente) {
      setPlanoActual(siguiente);
    }
  }, [planoSiguiente]);

  // Retroceder al plano anterior
  const retrocederPlano = useCallback(() => {
    const anterior = planoAnterior();
    if (anterior) {
      setPlanoActual(anterior);
    }
  }, [planoAnterior]);

  // Información del plano actual
  const infoPlanoActual = useCallback(() => {
    if (!planoActual) return null;
    
    const indice = planosCarreraActual.findIndex(p => p.id === planoActual.id);
    
    return {
      ...planoActual,
      numero: indice + 1,
      total: planosCarreraActual.length,
      tieneSiguiente: planoSiguiente() !== null,
      tieneAnterior: planoAnterior() !== null
    };
  }, [planoActual, planosCarreraActual, planoSiguiente, planoAnterior]);

  // Obtener todos los planos disponibles para la carrera actual
  const getPlanosDisponibles = useCallback(() => {
    return planosCarreraActual;
  }, [planosCarreraActual]);

  return {
    // Estado
    planoActual,
    carreraActual,
    planosCarreraActual,
    
    // Acciones
    cambiarCarrera,
    cambiarPlano,
    avanzarPlano,
    retrocederPlano,
    inicializarPlanosCarrera,
    
    // Información
    infoPlanoActual,
    getPlanosDisponibles,
    carrerasDisponibles: getCarrerasDisponibles(),
    
    // Datos del plano actual
    src: planoActual?.src,
    naturalWidth: planoActual?.naturalWidth || 1012,
    naturalHeight: planoActual?.naturalHeight || 768
  };
};