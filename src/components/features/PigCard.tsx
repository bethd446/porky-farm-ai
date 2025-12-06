import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Scale, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Pig } from '@/types/database';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export type PigStatus = 'active' | 'for-sale' | 'sick';

interface PigCardProps {
  pig: Pig;
}

const statusStyles: Record<PigStatus, { 
  border: string;
  label: string;
  badge: string;
  glow: string;
}> = {
  active: {
    border: 'border-primary/30 hover:border-primary/60',
    label: 'Actif',
    badge: 'bg-primary/10 text-primary',
    glow: 'group-hover:shadow-primary/20',
  },
  'for-sale': {
    border: 'border-warning/30 hover:border-warning/60',
    label: 'En vente',
    badge: 'bg-warning/20 text-warning-foreground',
    glow: 'group-hover:shadow-warning/20',
  },
  sick: {
    border: 'border-destructive/30 hover:border-destructive/60',
    label: 'Malade',
    badge: 'bg-destructive/10 text-destructive',
    glow: 'group-hover:shadow-destructive/20',
  },
};

/**
 * Calculer l'âge en format lisible
 */
function calculateAge(birthDate: string | null): string {
  if (!birthDate) return 'N/A';
  const birth = new Date(birthDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - birth.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 30) {
    return `${diffDays} jours`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} mois`;
  } else {
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    return `${years} an${years > 1 ? 's' : ''} ${months > 0 ? `${months} mois` : ''}`;
  }
}

/**
 * Calculer le score de santé basé sur le poids et l'historique
 */
function calculateHealthScore(pig: Pig): number {
  let score = 70; // Score de base
  
  // Bonus si poids récent
  if (pig.weight_history && pig.weight_history.length > 0) {
    score += 10;
  }
  
  // Bonus si photo
  if (pig.photo_url) {
    score += 10;
  }
  
  // Pénalité si statut breeding (peut nécessiter attention)
  if (pig.status === 'breeding') {
    score -= 5;
  }
  
  return Math.min(100, Math.max(0, score));
}

/**
 * Mapper le statut de la base de données vers le statut du card
 */
function mapStatus(status: string): PigStatus {
  if (status === 'sold') return 'for-sale';
  if (status === 'deceased') return 'sick';
  return 'active';
}

export function PigCard({ pig }: PigCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  
  const status = mapStatus(pig.status);
  const statusStyle = statusStyles[status];
  const age = calculateAge(pig.birth_date);
  const currentWeight = pig.weight_history?.length > 0 
    ? pig.weight_history[pig.weight_history.length - 1].weight 
    : null;
  const healthScore = calculateHealthScore(pig);
  const name = pig.tag_number; // Utiliser tag_number comme nom

  return (
    <div
      className={cn(
        'bg-card rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden border-2 group',
        statusStyle.border,
        statusStyle.glow,
      )}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-secondary overflow-hidden">
        <img
          src={pig.photo_url || '/placeholder-pig.jpg'}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmZGY0Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iNDgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7wn5K3PC90ZXh0Pjwvc3ZnPg==';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="px-2.5 py-1 rounded-lg bg-card/95 backdrop-blur-sm text-xs font-bold text-foreground shadow-sm">
            #{pig.tag_number}
          </span>
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsLiked(!isLiked);
            }}
            className="p-2 rounded-full bg-card/95 backdrop-blur-sm shadow-sm transition-all duration-300 hover:scale-110 active:scale-95"
          >
            <Heart
              className={cn(
                'w-4 h-4 transition-colors',
                isLiked ? 'fill-destructive text-destructive' : 'text-muted-foreground',
              )}
            />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-foreground text-lg">{name}</h3>
            <span
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-300',
                statusStyle.badge,
              )}
            >
              {statusStyle.label}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{pig.breed || 'Race non spécifiée'}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 bg-secondary/50 rounded-xl p-3 group/stat hover:bg-secondary transition-colors">
            <Clock className="w-4 h-4 text-muted-foreground group-hover/stat:text-primary transition-colors" />
            <div>
              <p className="text-xs text-muted-foreground">Âge</p>
              <p className="font-semibold text-foreground text-sm">{age}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-secondary/50 rounded-xl p-3 group/stat hover:bg-secondary transition-colors">
            <Scale className="w-4 h-4 text-muted-foreground group-hover/stat:text-primary transition-colors" />
            <div>
              <p className="text-xs text-muted-foreground">Poids</p>
              <p className="font-semibold text-foreground text-sm">
                {currentWeight ? `${currentWeight} kg` : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Health Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Santé</span>
            <span
              className={cn(
                'font-semibold',
                healthScore >= 70 ? 'text-primary' : 
                healthScore >= 40 ? 'text-warning' : 'text-destructive',
              )}
            >
              {healthScore}%
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-700 ease-out',
                healthScore >= 70 ? 'bg-primary' : 
                healthScore >= 40 ? 'bg-warning' : 'bg-destructive',
              )}
              style={{ width: `${healthScore}%` }}
            />
          </div>
        </div>

        {/* Action Button */}
        <Button
          asChild
          variant="outline"
          className="w-full hover:bg-primary hover:text-primary-foreground hover:border-primary bg-transparent font-semibold transition-all duration-300 group-hover:shadow-md"
        >
          <Link to={`/pigs/${pig.id}`}>Voir détails</Link>
        </Button>
      </div>
    </div>
  );
}