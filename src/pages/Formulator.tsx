import { useState } from 'react';
import { Beaker, Sparkles, Loader2, Save, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { PIG_CATEGORIES, FREEMIUM_FORMULATION_LIMIT } from '@/lib/constants';
import { PigCategory, FeedFormulation, Ingredient, NutritionalValues } from '@/types/database';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Formulator() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    ingredients: Ingredient[];
    nutritionalValues: NutritionalValues;
    costPerKg: number;
    recommendations: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    pigCategory: '' as PigCategory,
    targetWeight: '',
    budget: '',
    availableIngredients: '',
  });

  const usedFormulations = profile?.formulations_count || 0;
  const remainingFormulations = Math.max(0, FREEMIUM_FORMULATION_LIMIT - usedFormulations);
  const isLimitReached = remainingFormulations === 0 && profile?.subscription_tier === 'free';

  const handleGenerate = async () => {
    if (!formData.pigCategory || !formData.targetWeight) {
      toast.error('Veuillez remplir les champs obligatoires');
      return;
    }

    if (isLimitReached) {
      toast.error('Limite de formulations atteinte. Passez en Premium pour continuer.');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-feed-formulation', {
        body: {
          pigCategory: formData.pigCategory,
          targetWeight: parseFloat(formData.targetWeight),
          budget: formData.budget ? parseFloat(formData.budget) : undefined,
          availableIngredients: formData.availableIngredients,
        },
      });

      if (error) throw error;

      setResult(data);
      toast.success('Formulation générée avec succès !');
    } catch (error: any) {
      console.error('Error generating formulation:', error);
      toast.error(error.message || 'Erreur lors de la génération');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result || !user) return;

    try {
      const { error } = await supabase.from('feed_formulations').insert({
        user_id: user.id,
        name: formData.name || `Formule ${formData.pigCategory}`,
        pig_category: formData.pigCategory,
        ingredients: result.ingredients,
        nutritional_values: result.nutritionalValues,
        cost_per_kg: result.costPerKg,
      });

      if (error) throw error;

      toast.success('Formulation sauvegardée !');
    } catch (error: any) {
      console.error('Error saving formulation:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  return (
    <div className="content-area space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <Beaker className="h-7 w-7 text-primary" />
            Formulateur IA
          </h1>
          <p className="text-muted-foreground">
            Créez des formules alimentaires optimisées
          </p>
        </div>
        <Badge variant={isLimitReached ? 'destructive' : 'secondary'} className="text-sm">
          {remainingFormulations} formulations restantes
        </Badge>
      </div>

      {isLimitReached && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Vous avez atteint la limite de {FREEMIUM_FORMULATION_LIMIT} formulations gratuites.
            Passez en Premium pour des formulations illimitées.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>Paramètres</CardTitle>
            <CardDescription>
              Définissez les critères de votre formule
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de la formule</Label>
              <Input
                id="name"
                placeholder="Ex: Formule croissance été 2024"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Catégorie de porc *</Label>
              <Select
                value={formData.pigCategory}
                onValueChange={(value) => setFormData({ ...formData, pigCategory: value as PigCategory })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {PIG_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Poids cible (kg) *</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="Ex: 60"
                  value={formData.targetWeight}
                  onChange={(e) => setFormData({ ...formData, targetWeight: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget">Budget max (FCFA/kg)</Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="Ex: 300"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ingredients">Ingrédients disponibles</Label>
              <Textarea
                id="ingredients"
                placeholder="Ex: maïs, tourteau de soja, son de blé..."
                value={formData.availableIngredients}
                onChange={(e) => setFormData({ ...formData, availableIngredients: e.target.value })}
                rows={3}
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading || isLimitReached}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Générer la formule
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle>Résultat</CardTitle>
            <CardDescription>
              Formule optimisée par l'IA
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center py-8">
                  <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                    <p className="text-muted-foreground">Optimisation en cours...</p>
                  </div>
                </div>
              </div>
            ) : result ? (
              <div className="space-y-6">
                {/* Ingredients */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">Composition</h4>
                  {result.ingredients.map((ing, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{ing.name}</span>
                        <span className="font-medium">{ing.percentage}%</span>
                      </div>
                      <Progress value={ing.percentage} className="h-2" />
                    </div>
                  ))}
                </div>

                {/* Nutritional Values */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Valeurs nutritionnelles</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between p-2 bg-muted/50 rounded">
                      <span>Protéines</span>
                      <span className="font-medium">{result.nutritionalValues.protein}%</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted/50 rounded">
                      <span>Énergie</span>
                      <span className="font-medium">{result.nutritionalValues.energy} kcal</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted/50 rounded">
                      <span>Fibres</span>
                      <span className="font-medium">{result.nutritionalValues.fiber}%</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted/50 rounded">
                      <span>Lysine</span>
                      <span className="font-medium">{result.nutritionalValues.lysine}%</span>
                    </div>
                  </div>
                </div>

                {/* Cost */}
                <div className="p-4 bg-success-light rounded-xl">
                  <div className="flex justify-between items-center">
                    <span className="text-success-foreground font-medium">Coût estimé</span>
                    <span className="text-2xl font-bold text-success-foreground">
                      {result.costPerKg} FCFA/kg
                    </span>
                  </div>
                </div>

                {/* Recommendations */}
                {result.recommendations && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">Recommandations</h4>
                    <p className="text-sm text-muted-foreground">{result.recommendations}</p>
                  </div>
                )}

                <Button onClick={handleSave} variant="outline" className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Sauvegarder la formule
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Beaker className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">
                  Configurez les paramètres et générez une formule
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
