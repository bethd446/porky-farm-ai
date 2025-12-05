import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, AlertCircle, Camera, MapPin, X } from 'lucide-react';
import { Pig, PigSex, PigStatus } from '@/types/database';
import { PIG_BREEDS } from '@/lib/constants';
import { pigSchema, sanitizeInput, sanitizeText } from '@/lib/validation';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { hapticSuccess, hapticError } from '@/lib/haptic-feedback';
import { CameraCapture } from './CameraCapture';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AddPigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<Pig>) => Promise<{ error: Error | null }>;
}

export function AddPigDialog({ open, onOpenChange, onSubmit }: AddPigDialogProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCamera, setShowCamera] = useState(false);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const { latitude, longitude, getCurrentPosition, loading: geoLoading } = useGeolocation();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  const [formData, setFormData] = useState({
    tag_number: '',
    sex: 'male' as PigSex,
    breed: '',
    birth_date: '',
    status: 'active' as PigStatus,
    notes: '',
    initial_weight: '',
  });

  useEffect(() => {
    if (open && !location && !geoLoading) {
      getCurrentPosition();
    }
  }, [open]);

  useEffect(() => {
    if (latitude && longitude) {
      setLocation({ lat: latitude, lng: longitude });
    }
  }, [latitude, longitude]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      // Validation avec Zod
      const validationResult = pigSchema.safeParse({
        tag_number: formData.tag_number,
        sex: formData.sex,
        breed: formData.breed || null,
        birth_date: formData.birth_date || null,
        status: formData.status,
        notes: formData.notes || null,
        initial_weight: formData.initial_weight,
      });

      if (!validationResult.success) {
        const fieldErrors: Record<string, string> = {};
        validationResult.error.errors.forEach((error) => {
          if (error.path[0]) {
            fieldErrors[error.path[0].toString()] = error.message;
          }
        });
        setErrors(fieldErrors);
        setLoading(false);
        toast.error('Veuillez corriger les erreurs dans le formulaire');
        return;
      }

      // Sanitization des données
      const pigData: Partial<Pig> = {
        tag_number: sanitizeInput(formData.tag_number),
        sex: formData.sex,
        breed: formData.breed ? sanitizeInput(formData.breed) : null,
        birth_date: formData.birth_date || null,
        status: formData.status,
        notes: sanitizeText(formData.notes),
        weight_history: formData.initial_weight
          ? [{ date: new Date().toISOString(), weight: parseFloat(formData.initial_weight) }]
          : [],
        // Ajouter la photo et la localisation si disponibles
        ...(photoDataUrl && { photo_url: photoDataUrl }),
        ...(location && { location: { latitude: location.lat, longitude: location.lng } }),
      };

      const { error } = await onSubmit(pigData);

      setLoading(false);

      if (!error) {
        setFormData({
          tag_number: '',
          sex: 'male',
          breed: '',
          birth_date: '',
          status: 'active',
          notes: '',
          initial_weight: '',
        });
        setPhotoDataUrl(null);
        setLocation(null);
        setShowCamera(false);
        setErrors({});
        onOpenChange(false);
        hapticSuccess();
        toast.success('Porc ajouté avec succès !');
      } else {
        hapticError();
      }
    } catch (error) {
      setLoading(false);
      hapticError();
      toast.error('Une erreur est survenue lors de l\'ajout du porc');
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
          {Object.keys(errors).length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Veuillez corriger les erreurs dans le formulaire
              </AlertDescription>
            </Alert>
          )}

          {/* Photo et Localisation */}
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">Informations</TabsTrigger>
              <TabsTrigger value="photo">Photo</TabsTrigger>
              <TabsTrigger value="location">Localisation</TabsTrigger>
            </TabsList>

            <TabsContent value="photo" className="space-y-4">
              {showCamera ? (
                <CameraCapture
                  onCapture={(photo) => {
                    setPhotoDataUrl(photo);
                    setShowCamera(false);
                    toast.success('Photo capturée avec succès !');
                  }}
                  onCancel={() => setShowCamera(false)}
                  initialPhoto={photoDataUrl}
                />
              ) : (
                <div className="space-y-4">
                  {photoDataUrl ? (
                    <div className="relative rounded-lg overflow-hidden border-2 border-primary">
                      <img src={photoDataUrl} alt="Porc" className="w-full h-48 object-cover" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => setPhotoDataUrl(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                      <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-sm text-muted-foreground mb-4">
                        Aucune photo ajoutée
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowCamera(true)}
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Prendre une photo
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="location" className="space-y-4">
              <div className="space-y-4">
                {location ? (
                  <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Localisation enregistrée</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Latitude: {location.lat.toFixed(6)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Longitude: {location.lng.toFixed(6)}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        setLocation(null);
                        getCurrentPosition();
                      }}
                    >
                      Actualiser
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                    <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground mb-4">
                      {geoLoading ? 'Récupération de la localisation...' : 'Aucune localisation enregistrée'}
                    </p>
                    {!geoLoading && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={getCurrentPosition}
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        Obtenir la localisation
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="info" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tag_number">Numéro d'identification *</Label>
              <Input
                id="tag_number"
                placeholder="Ex: 001"
                value={formData.tag_number}
                onChange={(e) => {
                  setFormData({ ...formData, tag_number: e.target.value });
                  if (errors.tag_number) {
                    setErrors({ ...errors, tag_number: '' });
                  }
                }}
                required
                className={errors.tag_number ? 'border-destructive' : ''}
              />
              {errors.tag_number && (
                <p className="text-sm text-destructive">{errors.tag_number}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="sex">Sexe *</Label>
              <Select
                value={formData.sex}
                onValueChange={(value) => setFormData({ ...formData, sex: value as PigSex })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Mâle ♂️</SelectItem>
                  <SelectItem value="female">Femelle ♀️</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="breed">Race</Label>
              <Select
                value={formData.breed}
                onValueChange={(value) => setFormData({ ...formData, breed: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {PIG_BREEDS.map((breed) => (
                    <SelectItem key={breed} value={breed}>
                      {breed}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="birth_date">Date de naissance</Label>
              <Input
                id="birth_date"
                type="date"
                value={formData.birth_date}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as PigStatus })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="breeding">Reproduction</SelectItem>
                  <SelectItem value="sold">Vendu</SelectItem>
                  <SelectItem value="deceased">Décédé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="initial_weight">Poids initial (kg)</Label>
              <Input
                id="initial_weight"
                type="number"
                step="0.1"
                placeholder="Ex: 15.5"
                value={formData.initial_weight}
                onChange={(e) => {
                  setFormData({ ...formData, initial_weight: e.target.value });
                  if (errors.initial_weight) {
                    setErrors({ ...errors, initial_weight: '' });
                  }
                }}
                className={errors.initial_weight ? 'border-destructive' : ''}
                min="0"
                max="500"
              />
              {errors.initial_weight && (
                <p className="text-sm text-destructive">{errors.initial_weight}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Notes additionnelles..."
              value={formData.notes}
              onChange={(e) => {
                setFormData({ ...formData, notes: e.target.value });
                if (errors.notes) {
                  setErrors({ ...errors, notes: '' });
                }
              }}
              className={errors.notes ? 'border-destructive' : ''}
              maxLength={1000}
            />
            {errors.notes && (
              <p className="text-sm text-destructive">{errors.notes}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {formData.notes.length}/1000 caractères
            </p>
          </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading || !formData.tag_number}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ajouter
            </Button>
          </div>
        </form>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter un porc</DialogTitle>
          <DialogDescription>
            Remplissez les informations du nouveau porc
          </DialogDescription>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}
