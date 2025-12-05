import { useState, useRef, useCallback, useEffect } from 'react';

interface UseAudioOptions {
  mimeType?: string;
  audioBitsPerSecond?: number;
}

interface UseAudioReturn {
  isRecording: boolean;
  audioBlob: Blob | null;
  audioUrl: string | null;
  duration: number;
  error: Error | null;
  hasPermission: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  clearRecording: () => void;
  requestPermission: () => Promise<boolean>;
}

/**
 * Hook pour enregistrer de l'audio
 * @param options - Options d'enregistrement
 * @returns Fonctions et état pour contrôler l'enregistrement audio
 */
export function useAudio(options: UseAudioOptions = {}): UseAudioReturn {
  const { mimeType = 'audio/webm', audioBitsPerSecond = 128000 } = options;

  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setHasPermission(true);
      return true;
    } catch (err) {
      setError(err as Error);
      setHasPermission(false);
      return false;
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      chunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond,
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
          durationIntervalRef.current = null;
        }
      };

      mediaRecorder.onerror = (event) => {
        setError(new Error('Erreur lors de l\'enregistrement audio'));
        console.error('MediaRecorder error:', event);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setHasPermission(true);
      startTimeRef.current = Date.now();

      // Mettre à jour la durée toutes les secondes
      durationIntervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
        }
      }, 1000);
    } catch (err) {
      const error = err as Error;
      setError(error);
      setIsRecording(false);

      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setError(new Error('Permission d\'accès au microphone refusée'));
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setError(new Error('Aucun microphone trouvé'));
      } else {
        setError(new Error(`Erreur d'accès au microphone: ${error.message}`));
      }
    }
  }, [mimeType, audioBitsPerSecond]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    }
  }, [isRecording]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
    }
  }, [isRecording]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
    }
  }, []);

  const clearRecording = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    chunksRef.current = [];
  }, [audioUrl]);

  // Nettoyage lors du démontage
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [audioUrl]);

  return {
    isRecording,
    audioBlob,
    audioUrl,
    duration,
    error,
    hasPermission,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    clearRecording,
    requestPermission,
  };
}

