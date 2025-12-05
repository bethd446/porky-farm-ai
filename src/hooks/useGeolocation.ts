import { useState, useEffect, useCallback } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: GeolocationPositionError | null;
  loading: boolean;
}

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watch?: boolean;
}

/**
 * Hook pour accéder à la géolocalisation de l'utilisateur
 * @param options - Options de géolocalisation
 * @returns État de la géolocalisation et fonctions pour obtenir/arrêter la position
 */
export function useGeolocation(options: UseGeolocationOptions = {}) {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 0,
    watch = false,
  } = options;

  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: false,
  });

  const updatePosition = useCallback((position: GeolocationPosition) => {
    setState({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      error: null,
      loading: false,
    });
  }, []);

  const handleError = useCallback((error: GeolocationPositionError) => {
    setState((prev) => ({
      ...prev,
      error,
      loading: false,
    }));
  }, []);

  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: {
          code: 0,
          message: 'La géolocalisation n\'est pas supportée par ce navigateur',
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        } as GeolocationPositionError,
        loading: false,
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      updatePosition,
      handleError,
      {
        enableHighAccuracy,
        timeout,
        maximumAge,
      }
    );
  }, [enableHighAccuracy, timeout, maximumAge, updatePosition, handleError]);

  useEffect(() => {
    if (watch) {
      if (!navigator.geolocation) {
        handleError({
          code: 0,
          message: 'La géolocalisation n\'est pas supportée par ce navigateur',
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        } as GeolocationPositionError);
        return;
      }

      setState((prev) => ({ ...prev, loading: true }));

      const watchId = navigator.geolocation.watchPosition(
        updatePosition,
        handleError,
        {
          enableHighAccuracy,
          timeout,
          maximumAge,
        }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    }
  }, [watch, enableHighAccuracy, timeout, maximumAge, updatePosition, handleError]);

  const clearWatch = useCallback(() => {
    setState({
      latitude: null,
      longitude: null,
      accuracy: null,
      error: null,
      loading: false,
    });
  }, []);

  return {
    ...state,
    getCurrentPosition,
    clearWatch,
  };
}

/**
 * Hook simplifié pour obtenir la position actuelle une seule fois
 */
export function useCurrentPosition() {
  const geolocation = useGeolocation({ enableHighAccuracy: true });
  
  const getPosition = useCallback(() => {
    geolocation.getCurrentPosition();
  }, [geolocation]);

  return {
    ...geolocation,
    getPosition,
  };
}

