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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Transaction } from '@/types/database';
import { toast } from 'sonner';
import { hapticSuccess, hapticError } from '@/lib/haptic-feedback';
import { z } from 'zod';

const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number().positive('Le montant doit être positif'),
  description: z.string().min(3, 'La description doit contenir au moins 3 caractères'),
  category: z.string().min(1, 'La catégorie est requise'),
  transaction_date: z.string(),
});

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<Transaction>) => Promise<{ error: Error | null }>;
}

export function AddTransactionDialog({ open, onOpenChange, onSubmit }: AddTransactionDialogProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    description: '',
    category: '',
    transaction_date: new Date().toISOString().split('T')[0],
  });

  const categories = {
    income: ['Vente de porcs', 'Vente de produits', 'Subventions', 'Autres revenus'],
    expense: ['Alimentation', 'Médicaments', 'Équipement', 'Maintenance', 'Transport', 'Autres dépenses'],
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const validationResult = transactionSchema.safeParse({
        type: formData.type,
        amount: parseFloat(formData.amount),
        description: formData.description,
        category: formData.category,
        transaction_date: formData.transaction_date,
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

      const transactionData: Partial<Transaction> = {
        type: formData.type,
        amount: parseFloat(formData.amount),
        description: formData.description,
        category: formData.category,
        transaction_date: formData.transaction_date,
      };

      const { error } = await onSubmit(transactionData);

      setLoading(false);

      if (!error) {
        setFormData({
          type: 'expense',
          amount: '',
          description: '',
          category: '',
          transaction_date: new Date().toISOString().split('T')[0],
        });
        setErrors({});
        onOpenChange(false);
        hapticSuccess();
        toast.success('Transaction ajoutée avec succès !');
      } else {
        hapticError();
        toast.error('Erreur lors de l\'ajout de la transaction');
      }
    } catch (error) {
      setLoading(false);
      hapticError();
      toast.error('Une erreur est survenue');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouvelle transaction</DialogTitle>
          <DialogDescription>
            Ajoutez une nouvelle transaction à votre registre
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => {
                setFormData({ ...formData, type: value as 'income' | 'expense', category: '' });
                setErrors({ ...errors, category: '' });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">
                  <div className="flex items-center gap-2">
                    <ArrowUpRight className="h-4 w-4 text-success" />
                    <span>Revenu</span>
                  </div>
                </SelectItem>
                <SelectItem value="expense">
                  <div className="flex items-center gap-2">
                    <ArrowDownRight className="h-4 w-4 text-revenue" />
                    <span>Dépense</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Montant (FCFA) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="Ex: 50000"
              value={formData.amount}
              onChange={(e) => {
                setFormData({ ...formData, amount: e.target.value });
                if (errors.amount) setErrors({ ...errors, amount: '' });
              }}
              required
              className={errors.amount ? 'border-destructive' : ''}
            />
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Catégorie *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => {
                setFormData({ ...formData, category: value });
                if (errors.category) setErrors({ ...errors, category: '' });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories[formData.type].map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-destructive">{errors.category}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Description de la transaction..."
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
                if (errors.description) setErrors({ ...errors, description: '' });
              }}
              required
              className={errors.description ? 'border-destructive' : ''}
              maxLength={500}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {formData.description.length}/500 caractères
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="transaction_date">Date *</Label>
            <Input
              id="transaction_date"
              type="date"
              value={formData.transaction_date}
              onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading || !formData.amount || !formData.description || !formData.category}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ajouter
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

