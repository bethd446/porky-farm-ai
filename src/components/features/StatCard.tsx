import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  variant: 'success' | 'revenue' | 'warning' | 'info';
  suffix?: string;
}

const variantStyles = {
  success: {
    icon: 'bg-success-light text-success-foreground',
    trend: 'text-success',
  },
  revenue: {
    icon: 'bg-revenue-light text-revenue-foreground',
    trend: 'text-success',
  },
  warning: {
    icon: 'bg-warning-light text-warning-foreground',
    trend: 'text-warning',
  },
  info: {
    icon: 'bg-info-light text-info-foreground',
    trend: 'text-info',
  },
};

export function StatCard({ title, value, change, icon: Icon, variant, suffix }: StatCardProps) {
  const styles = variantStyles[variant];
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <div className="stat-card animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl md:text-3xl font-display font-bold text-foreground">
            {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
            {suffix && <span className="text-lg font-normal text-muted-foreground ml-1">{suffix}</span>}
          </p>
        </div>
        <div className={cn("stat-icon", styles.icon)}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      
      {change !== undefined && (
        <div className={cn(
          "flex items-center gap-1 mt-3 text-sm font-medium",
          isPositive && "text-success",
          isNegative && (variant === 'warning' ? "text-success" : "text-destructive")
        )}>
          {isPositive ? (
            <TrendingUp className="h-4 w-4" />
          ) : isNegative ? (
            <TrendingDown className="h-4 w-4" />
          ) : null}
          <span>{isPositive ? '+' : ''}{change}%</span>
        </div>
      )}
    </div>
  );
}
