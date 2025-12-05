import { useState, useEffect } from 'react';
import { Camera, X, RotateCcw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCamera } from '@/hooks/useCamera';
import { PermissionRequest } from '@/components/ui/permission-request';
import { cn } from '@/lib/utils';

interface CameraCaptureProps {
  onCapture: (photoDataUrl: string) => void;
  onCancel: () => void;
  initialPhoto?: string | null;
}

/**
 * Composant pour capturer une photo avec la caméra
 */
export function CameraCapture({ onCapture, onCancel, initialPhoto }: CameraCaptureProps) {
  const { videoRef, isActive, error, startCamera, stopCamera, capturePhoto, hasPermission, requestPermission } = useCamera();
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(initialPhoto || null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (hasPermission && !isActive && !capturedPhoto) {
      startCamera();
    }
  }, [hasPermission, isActive, capturedPhoto]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleCapture = () => {
    const photo = capturePhoto();
    if (photo) {
      setCapturedPhoto(photo);
      setShowPreview(true);
      stopCamera();
    }
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    setShowPreview(false);
    startCamera();
  };

  const handleConfirm = () => {
    if (capturedPhoto) {
      onCapture(capturedPhoto);
    }
  };

  if (!hasPermission) {
    return (
      <div className="space-y-4">
        <PermissionRequest
          type="camera"
          onGranted={() => requestPermission()}
        />
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Annuler
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
          <p className="text-sm text-destructive">{error.message}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Annuler
          </Button>
          <Button onClick={startCamera} className="flex-1">
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showPreview && capturedPhoto ? (
        <div className="space-y-4">
          <div className="relative rounded-lg overflow-hidden border-2 border-primary">
            <img src={capturedPhoto} alt="Captured" className="w-full h-64 object-cover" />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRetake} className="flex-1">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reprendre
            </Button>
            <Button onClick={handleConfirm} className="flex-1">
              <Check className="h-4 w-4 mr-2" />
              Confirmer
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-lg overflow-hidden border-2 border-primary bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-64 object-cover"
            />
            {!isActive && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <Button onClick={startCamera} size="lg">
                  <Camera className="h-5 w-5 mr-2" />
                  Démarrer la caméra
                </Button>
              </div>
            )}
          </div>
          {isActive && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={onCancel} className="flex-1">
                <X className="h-4 w-4 mr-2" />
                Annuler
              </Button>
              <Button onClick={handleCapture} className="flex-1">
                <Camera className="h-4 w-4 mr-2" />
                Capturer
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

