import { memo } from 'react';
import { TrendingUp, TrendingDown, LucideIcon, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface HealthMetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  status: 'healthy' | 'warning' | 'critical' | 'excellent';
  trend?: number;
  icon: LucideIcon;
  description?: string;
  index: number;
}

const statusStyles = {
  healthy: {
    bg: 'bg-green-50 dark:bg-green-950/20',
    border: 'border-green-200 dark:border-green-800',
    text: 'text-green-700 dark:text-green-400',
    icon: 'text-green-600 dark:text-green-500',
    dot: 'bg-green-500',
  },
  warning: {
    bg: 'bg-yellow-50 dark:bg-yellow-950/20',
    border: 'border-yellow-200 dark:border-yellow-800',
    text: 'text-yellow-700 dark:text-yellow-400',
    icon: 'text-yellow-600 dark:text-yellow-500',
    dot: 'bg-yellow-500',
  },
  critical: {
    bg: 'bg-red-50 dark:bg-red-950/20',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-700 dark:text-red-400',
    icon: 'text-red-600 dark:text-red-500',
    dot: 'bg-red-500',
  },
  excellent: {
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-700 dark:text-blue-400',
    icon: 'text-blue-600 dark:text-blue-500',
    dot: 'bg-blue-500',
  },
} as const;

/**
 * Carte de métrique de santé - Style Healthcare Dashboard
 * Inspiré du design Healthcare Dashboard App Concept
 */
export const HealthMetricCard = memo(function HealthMetricCard({
  title,
  value,
  unit,
  status,
  trend,
  icon: Icon,
  description,
  index,
}: HealthMetricCardProps) {
  const styles = statusStyles[status];
  const isPositive = trend !== undefined && trend > 0;

  const formattedValue = typeof value === 'number' ? value.toLocaleString('fr-FR') : value;

  return (
    <Card
      className={cn(
        'relative overflow-hidden border-2 transition-all duration-300',
        'hover:shadow-xl hover:-translate-y-1',
        styles.bg,
        styles.border,
        'animate-fade-in animate-slide-up',
        `animation-delay-${index * 100}ms`
      )}
    >
      {/* Status indicator dot */}
      <div className={cn('absolute top-4 right-4 h-3 w-3 rounded-full', styles.dot)} />

      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Icon className={cn('h-5 w-5', styles.icon)} />
              <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={cn('text-3xl font-bold', styles.text)}>
                {formattedValue}
              </span>
              {unit && (
                <span className={cn('text-lg font-medium', styles.text, 'opacity-70')}>
                  {unit}
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground mt-2">{description}</p>
            )}
          </div>
        </div>

        {trend !== undefined && (
          <div className={cn(
            'flex items-center gap-1.5 mt-4 pt-4 border-t',
            styles.border
          )}>
            {isPositive ? (
              <TrendingUp className={cn('h-4 w-4', styles.icon)} />
            ) : (
              <TrendingDown className={cn('h-4 w-4', styles.icon)} />
            )}
            <span className={cn('text-sm font-semibold', styles.text)}>
              {isPositive ? '+' : ''}{trend}%
            </span>
            <span className="text-xs text-muted-foreground ml-1">vs mois dernier</span>
          </div>
        )}

        {/* Status badge */}
        <div className="mt-4 flex items-center gap-2">
          {status === 'healthy' || status === 'excellent' ? (
            <CheckCircle2 className={cn('h-4 w-4', styles.icon)} />
          ) : (
            <AlertCircle className={cn('h-4 w-4', styles.icon)} />
          )}
          <span className={cn('text-xs font-medium', styles.text)}>
            {status === 'healthy' && 'En bonne santé'}
            {status === 'excellent' && 'Excellent'}
            {status === 'warning' && 'Attention requise'}
            {status === 'critical' && 'Action urgente'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
});

