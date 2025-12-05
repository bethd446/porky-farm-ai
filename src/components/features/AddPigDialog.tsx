import { useState } from 'react';
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
import { Loader2 } from 'lucide-react';
import { Pig, PigSex, PigStatus } from '@/types/database';
import { PIG_BREEDS } from '@/lib/constants';

interface AddPigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<Pig>) => Promise<{ error: Error | null }>;
}

export function AddPigDialog({ open, onOpenChange, onSubmit }: AddPigDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tag_number: '',
    sex: 'male' as PigSex,
    breed: '',
    birth_date: '',
    status: 'active' as PigStatus,
    notes: '',
    initial_weight: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const pigData: Partial<Pig> = {
      tag_number: formData.tag_number,
      sex: formData.sex,
      breed: formData.breed || null,
      birth_date: formData.birth_date || null,
      status: formData.status,
      notes: formData.notes || null,
      weight_history: formData.initial_weight
        ? [{ date: new Date().toISOString(), weight: parseFloat(formData.initial_weight) }]
        : [],
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
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter un porc</DialogTitle>
          <DialogDescription>
            Remplissez les informations du nouveau porc
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tag_number">Numéro d'identification *</Label>
              <Input
                id="tag_number"
                placeholder="Ex: 001"
                value={formData.tag_number}
                onChange={(e) => setFormData({ ...formData, tag_number: e.target.value })}
                required
              />
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
                onChange={(e) => setFormData({ ...formData, initial_weight: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Notes additionnelles..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

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
      </DialogContent>
    </Dialog>
  );
}
