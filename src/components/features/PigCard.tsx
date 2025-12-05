import { Pig } from '@/types/database';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

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

export function PigCard({ pig, onClick }: PigCardProps) {
  const currentWeight = pig.weight_history?.length > 0 
    ? pig.weight_history[pig.weight_history.length - 1].weight 
    : null;

  const status = statusLabels[pig.status];

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
          <img 
            src={pig.photo_url} 
            alt={`Porc ${pig.tag_number}`}
            className="w-full h-full object-cover"
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
          {pig.birth_date && (
            <p>Né le {format(new Date(pig.birth_date), 'd MMM yyyy', { locale: fr })}</p>
          )}
          {currentWeight && (
            <p className="font-medium text-foreground">{currentWeight} kg</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
