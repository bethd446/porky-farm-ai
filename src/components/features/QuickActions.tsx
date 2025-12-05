import { memo, useCallback } from 'react';
import { Plus, Beaker, ShoppingCart, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { hapticLight } from '@/lib/haptic-feedback';

const actions = [
  { 
    label: 'Ajouter porc', 
    icon: Plus, 
    color: 'bg-success-light text-success-foreground',
    path: '/pigs?action=add'
  },
  { 
    label: 'Formuler aliment', 
    icon: Beaker, 
    color: 'bg-info-light text-info-foreground',
    path: '/formulator'
  },
  { 
    label: 'Nouvelle vente', 
    icon: ShoppingCart, 
    color: 'bg-revenue-light text-revenue-foreground',
    path: '/finances?action=sale'
  },
  { 
    label: 'Calendrier', 
    icon: Calendar, 
    color: 'bg-warning-light text-warning-foreground',
    path: '/calendar'
  },
] as const;

/**
 * Composant d'actions rapides pour le dashboard
 * Optimisé avec React.memo pour éviter les re-renders inutiles
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
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={() => handleAction(action.path)}
            className="quick-action hover:bg-muted/50 rounded-xl interactive min-h-[44px]"
          >
            <div className={`quick-action-icon ${action.color}`}>
              <action.icon className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium text-foreground">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
});
