import { memo, useCallback } from 'react';
import { Plus, Beaker, ShoppingCart, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { hapticLight } from '@/lib/haptic-feedback';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const actions = [
  { 
    label: 'Ajouter porc', 
    icon: Plus, 
    variant: 'default' as const,
    className: 'bg-success hover:bg-success/90 text-success-foreground',
    path: '/pigs?action=add'
  },
  { 
    label: 'Formuler aliment', 
    icon: Beaker, 
    variant: 'default' as const,
    className: 'bg-info hover:bg-info/90 text-info-foreground',
    path: '/formulator'
  },
  { 
    label: 'Nouvelle vente', 
    icon: ShoppingCart, 
    variant: 'outline' as const,
    className: 'border-revenue text-revenue hover:bg-revenue-light',
    path: '/finances?action=sale'
  },
  { 
    label: 'Calendrier', 
    icon: Calendar, 
    variant: 'ghost' as const,
    className: 'hover:bg-warning-light text-warning hover:text-warning-foreground',
    path: '/calendar'
  },
] as const;

/**
 * Composant d'actions rapides amélioré pour le dashboard
 * Grid 4 boutons avec variantes de couleurs et animations hover
 */
export const QuickActions = memo(function QuickActions() {
  const navigate = useNavigate();

  const handleAction = useCallback((path: string) => {
    hapticLight();
    navigate(path);
  }, [navigate]);

  return (
    <div className="stat-card">
      <h3 className="text-lg font-semibold text-foreground mb-4">Actions rapides</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <Button
            key={action.label}
            variant={action.variant}
            onClick={() => handleAction(action.path)}
            className={cn(
              "flex flex-col items-center gap-2 h-auto py-4 px-3 transition-all duration-300 hover:scale-105 hover:shadow-lg min-h-[44px]",
              action.className,
              "animate-fade-in animate-slide-up"
            )}
            style={{ 
              animationDelay: `${index * 100}ms`,
              animationFillMode: 'both'
            }}
          >
            <action.icon className="h-6 w-6" />
            <span className="text-sm font-medium">{action.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
});
