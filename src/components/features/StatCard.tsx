import { memo, useMemo } from 'react';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  variant: 'success' | 'revenue' | 'warning' | 'info';
  suffix?: string;
  index?: number;
}

const variantStyles = {
  success: {
    icon: 'bg-success-light text-success',
    iconBg: 'bg-success/10',
    trend: 'text-success',
    border: 'border-l-success',
  },
  revenue: {
    icon: 'bg-revenue-light text-revenue',
    iconBg: 'bg-revenue/10',
    trend: 'text-success',
    border: 'border-l-revenue',
  },
  warning: {
    icon: 'bg-warning-light text-warning',
    iconBg: 'bg-warning/10',
    trend: 'text-warning',
    border: 'border-l-warning',
  },
  info: {
    icon: 'bg-info-light text-info',
    iconBg: 'bg-info/10',
    trend: 'text-info',
    border: 'border-l-info',
  },
} as const;

/**
 * Composant de carte statistique amélioré
 * Avec animations d'entrée, icônes plus grandes, hover effects et trends animées
 */
export const StatCard = memo(function StatCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  variant, 
  suffix,
  index = 0
}: StatCardProps) {
  const styles = useMemo(() => variantStyles[variant], [variant]);
  const isPositive = useMemo(() => change && change > 0, [change]);
  const isNegative = useMemo(() => change && change < 0, [change]);

  const formattedValue = useMemo(() => {
    return typeof value === 'number' ? value.toLocaleString('fr-FR') : value;
  }, [value]);

  return (
    <div 
      className={cn(
        "stat-card border-l-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-default",
        styles.border,
        "animate-fade-in animate-slide-up"
      )}
      style={{ 
        animationDelay: `${index * 100}ms`,
        animationFillMode: 'both'
      }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl md:text-3xl font-display font-bold text-foreground">
            {formattedValue}
            {suffix && <span className="text-lg font-normal text-muted-foreground ml-1">{suffix}</span>}
          </p>
        </div>
        <div className={cn(
          "stat-icon w-14 h-14 rounded-xl flex items-center justify-center transition-transform duration-300 hover:scale-110",
          styles.iconBg,
          styles.icon
        )}>
          <Icon className="h-7 w-7" />
        </div>
      </div>
      
      {change !== undefined && (
        <div className={cn(
          "flex items-center gap-1.5 mt-4 text-sm font-semibold",
          isPositive && "text-success",
          isNegative && (variant === 'warning' ? "text-success" : "text-destructive")
        )}>
          {isPositive ? (
            <TrendingUp className="h-4 w-4 animate-bounce" />
          ) : isNegative ? (
            <TrendingDown className="h-4 w-4 animate-bounce" />
          ) : null}
          <span className="flex items-center gap-1">
            <span className="animate-pulse">{isPositive ? '+' : ''}{change}%</span>
          </span>
        </div>
      )}
    </div>
  );
});
