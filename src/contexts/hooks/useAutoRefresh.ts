// src/context/hooks/useAutoRefresh.ts
import { useEffect, useRef, useCallback } from 'react';

export const useAutoRefresh = (
  callback: () => void,
  interval: number = 300000, // 5 minutos por defecto
  immediate: boolean = true // Ejecutar inmediatamente al montar
) => {
  const savedCallback = useRef<() => void>();
  const intervalId = useRef<NodeJS.Timeout>();

  // Guarda el callback más reciente
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Función para limpiar el intervalo
  const stopAutoRefresh = useCallback(() => {
    if (intervalId.current) {
      clearInterval(intervalId.current);
      intervalId.current = undefined;
    }
  }, []);

  // Función para iniciar/reiniciar el intervalo
  const startAutoRefresh = useCallback(() => {
    stopAutoRefresh(); // Limpia cualquier intervalo existente
    
    if (interval > 0) {
      // Ejecuta inmediatamente si está configurado
      if (immediate && savedCallback.current) {
        savedCallback.current();
      }
      
      // Configura el intervalo
      intervalId.current = setInterval(() => {
        if (savedCallback.current) {
          savedCallback.current();
        }
      }, interval);
    }
  }, [interval, immediate, stopAutoRefresh]);

  // Configuración inicial y cleanup al desmontar
  useEffect(() => {
    if (immediate) {
      startAutoRefresh();
    }
    return stopAutoRefresh;
  }, [startAutoRefresh, stopAutoRefresh, immediate]);

  return {
    startAutoRefresh,
    stopAutoRefresh
  };
};
