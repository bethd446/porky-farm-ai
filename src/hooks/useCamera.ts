import { useState, useRef, useCallback } from 'react';

interface UseCameraOptions {
  facingMode?: 'user' | 'environment';
  aspectRatio?: number;
  width?: number;
  height?: number;
}

interface UseCameraReturn {
  stream: MediaStream | null;
  videoRef: React.RefObject<HTMLVideoElement>;
  isActive: boolean;
  error: Error | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  capturePhoto: () => string | null;
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
}

/**
 * Hook pour accéder à la caméra de l'utilisateur
 * @param options - Options de la caméra
 * @returns Fonctions et état pour contrôler la caméra
 */
export function useCamera(options: UseCameraOptions = {}): UseCameraReturn {
  const {
    facingMode = 'environment',
    aspectRatio = 16 / 9,
    width = 1280,
    height = 720,
  } = options;

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());
      setHasPermission(true);
      return true;
    } catch (err) {
      setError(err as Error);
      setHasPermission(false);
      return false;
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setError(null);

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode,
          aspectRatio,
          width: { ideal: width },
          height: { ideal: height },
        },
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setIsActive(true);
      setHasPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
    } catch (err) {
      const error = err as Error;
      setError(error);
      setIsActive(false);
      setHasPermission(false);

      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setError(new Error('Permission d\'accès à la caméra refusée'));
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setError(new Error('Aucune caméra trouvée'));
      } else {
        setError(new Error(`Erreur d'accès à la caméra: ${error.message}`));
      }
    }
  }, [facingMode, aspectRatio, width, height]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setIsActive(false);
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stream]);

  const capturePhoto = useCallback((): string | null => {
    if (!videoRef.current || !isActive) {
      return null;
    }

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return null;
    }

    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.8);
  }, [isActive]);

  return {
    stream,
    videoRef,
    isActive,
    error,
    startCamera,
    stopCamera,
    capturePhoto,
    hasPermission,
    requestPermission,
  };
}

