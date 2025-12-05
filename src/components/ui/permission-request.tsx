import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Camera, Mic, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PermissionRequestProps {
  type: 'camera' | 'microphone' | 'geolocation';
  onGranted?: () => void;
  onDenied?: () => void;
  className?: string;
}

const permissionConfig = {
  camera: {
    icon: Camera,
    title: 'Accès à la caméra',
    description: 'Autoriser l\'accès à la caméra pour prendre des photos de vos porcs',
    permissionName: 'camera' as PermissionName,
  },
  microphone: {
    icon: Mic,
    title: 'Accès au microphone',
    description: 'Autoriser l\'accès au microphone pour enregistrer des notes vocales',
    permissionName: 'microphone' as PermissionName,
  },
  geolocation: {
    icon: MapPin,
    title: 'Accès à la localisation',
    description: 'Autoriser l\'accès à la localisation pour enregistrer l\'emplacement de vos porcs',
    permissionName: 'geolocation' as PermissionName,
  },
};

/**
 * Composant pour demander les permissions utilisateur
 */
export function PermissionRequest({ type, onGranted, onDenied, className }: PermissionRequestProps) {
  const [status, setStatus] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [checking, setChecking] = useState(true);
  const config = permissionConfig[type];
  const Icon = config.icon;

  useEffect(() => {
    checkPermission();
  }, [type]);

  const checkPermission = async () => {
    try {
      if (navigator.permissions) {
        const result = await navigator.permissions.query({ name: config.permissionName });
        setStatus(result.state === 'granted' ? 'granted' : result.state === 'denied' ? 'denied' : 'prompt');
        
        result.onchange = () => {
          setStatus(result.state === 'granted' ? 'granted' : result.state === 'denied' ? 'denied' : 'prompt');
        };
      } else {
        // Fallback pour les navigateurs qui ne supportent pas l'API Permissions
        setStatus('prompt');
      }
    } catch (error) {
      console.error('Error checking permission:', error);
      setStatus('prompt');
    } finally {
      setChecking(false);
    }
  };

  const handleRequest = async () => {
    try {
      if (type === 'camera') {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach((track) => track.stop());
        setStatus('granted');
        onGranted?.();
      } else if (type === 'microphone') {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
        setStatus('granted');
        onGranted?.();
      } else if (type === 'geolocation') {
        await new Promise<void>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            () => {
              setStatus('granted');
              onGranted?.();
              resolve();
            },
            (error) => {
              if (error.code === error.PERMISSION_DENIED) {
                setStatus('denied');
                onDenied?.();
              }
              reject(error);
            }
          );
        });
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      setStatus('denied');
      onDenied?.();
    }
  };

  if (checking) {
    return null;
  }

  if (status === 'granted') {
    return (
      <Alert className={cn('border-success/50 bg-success/10', className)}>
        <CheckCircle2 className="h-4 w-4 text-success" />
        <AlertTitle className="text-success">Permission accordée</AlertTitle>
        <AlertDescription>
          L'accès à {config.title.toLowerCase()} a été autorisé.
        </AlertDescription>
      </Alert>
    );
  }

  if (status === 'denied') {
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Permission refusée</AlertTitle>
        <AlertDescription>
          Veuillez autoriser l'accès à {config.title.toLowerCase()} dans les paramètres de votre navigateur.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className={cn('border-primary/50 bg-primary/5', className)}>
      <Icon className="h-4 w-4 text-primary" />
      <AlertTitle>{config.title}</AlertTitle>
      <AlertDescription className="mb-4">
        {config.description}
      </AlertDescription>
      <Button onClick={handleRequest} size="sm" className="mt-2">
        Autoriser l'accès
      </Button>
    </Alert>
  );
}

