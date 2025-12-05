import { memo, useMemo } from 'react';
import { Pig } from '@/types/database';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { LazyImage } from '@/components/ui/lazy-image';

interface PigCardProps {
  pig: Pig;
  onClick?: () => void;
}

const statusLabels = {
  active: { label: 'Actif', variant: 'default' as const },
  sold: { label: 'Vendu', variant: 'secondary' as const },
  deceased: { label: 'Décédé', variant: 'destructive' as const },
  breeding: { label: 'Reproduction', variant: 'outline' as const },
};

/**
 * Composant de carte pour afficher un porc
 * Optimisé avec React.memo pour éviter les re-renders inutiles
 */
export const PigCard = memo(function PigCard({ pig, onClick }: PigCardProps) {
  const currentWeight = useMemo(() => {
    return pig.weight_history?.length > 0 
      ? pig.weight_history[pig.weight_history.length - 1].weight 
      : null;
  }, [pig.weight_history]);

  const status = useMemo(() => statusLabels[pig.status], [pig.status]);

  const formattedBirthDate = useMemo(() => {
    if (!pig.birth_date) return null;
    return format(new Date(pig.birth_date), 'd MMM yyyy', { locale: fr });
  }, [pig.birth_date]);

  return (
    <Card 
      className={cn(
        "overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-card-hover",
        "border border-border/50"
      )}
      onClick={onClick}
    >
      <div className="aspect-square relative bg-muted">
        {pig.photo_url ? (
          <LazyImage 
            src={pig.photo_url} 
            alt={`Porc ${pig.tag_number}`}
            fallback="🐷"
            className="w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            🐷
          </div>
        )}
        <Badge 
          variant={status.variant}
          className="absolute top-2 right-2"
        >
          {status.label}
        </Badge>
      </div>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-foreground">#{pig.tag_number}</h3>
          <span className="text-lg">{pig.sex === 'male' ? '♂️' : '♀️'}</span>
        </div>
        <div className="space-y-1 text-sm text-muted-foreground">
          {pig.breed && <p>{pig.breed}</p>}
          {formattedBirthDate && (
            <p>Né le {formattedBirthDate}</p>
          )}
          {currentWeight && (
            <p className="font-medium text-foreground">{currentWeight} kg</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}, (prevProps, nextProps) => {
  // Comparaison personnalisée pour éviter les re-renders inutiles
  return (
    prevProps.pig.id === nextProps.pig.id &&
    prevProps.pig.tag_number === nextProps.pig.tag_number &&
    prevProps.pig.status === nextProps.pig.status &&
    prevProps.pig.photo_url === nextProps.pig.photo_url &&
    JSON.stringify(prevProps.pig.weight_history) === JSON.stringify(nextProps.pig.weight_history) &&
    prevProps.onClick === nextProps.onClick
  );
});
