import { memo, useMemo, useCallback } from 'react';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Event } from '@/types/database';
import { EVENT_TYPES } from '@/lib/constants';
import { hapticLight } from '@/lib/haptic-feedback';
import { cn } from '@/lib/utils';

interface UpcomingEventsProps {
  events: Event[];
}

/**
 * Composant d'affichage des événements à venir amélioré
 * Avec icônes colorées par type, badges de statut et dates formatées en français
 */
export const UpcomingEvents = memo(function UpcomingEvents({ events }: UpcomingEventsProps) {
  const navigate = useNavigate();

  const getEventIcon = useCallback((type: string) => {
    const eventType = EVENT_TYPES.find(e => e.value === type);
    return eventType?.icon || '📝';
  }, []);

  const getEventColor = useCallback((type: string) => {
    const colors: Record<string, string> = {
      vaccination: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
      weighing: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
      birth: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
      sale: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
      treatment: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
      other: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400',
    };
    return colors[type] || colors.other;
  }, []);

  const getEventStatus = useCallback((eventDate: Date) => {
    if (isPast(eventDate)) {
      return { label: 'Passé', variant: 'secondary' as const };
    }
    if (isToday(eventDate)) {
      return { label: "Aujourd'hui", variant: 'default' as const };
    }
    if (isTomorrow(eventDate)) {
      return { label: 'Demain', variant: 'default' as const };
    }
    return { label: 'À venir', variant: 'outline' as const };
  }, []);

  const formatEventDate = useCallback((date: Date) => {
    if (isToday(date)) {
      return "Aujourd'hui";
    }
    if (isTomorrow(date)) {
      return 'Demain';
    }
    return format(date, "EEEE d MMMM", { locale: fr });
  }, []);

  const handleViewAll = useCallback(() => {
    hapticLight();
    navigate('/calendar');
  }, [navigate]);

  const displayedEvents = useMemo(() => events.slice(0, 3), [events]);

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Événements à venir</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleViewAll}
          className="text-muted-foreground hover:text-foreground min-h-[44px]"
        >
          Voir tout
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      <div className="space-y-3">
        {displayedEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Aucun événement à venir
          </p>
        ) : (
          displayedEvents.map((event, index) => {
            const eventDate = new Date(event.event_date);
            const status = getEventStatus(eventDate);
            const eventColor = getEventColor(event.event_type);
            
            return (
              <div 
                key={event.id}
                className={cn(
                  "flex items-start gap-3 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all duration-300 hover:shadow-md cursor-pointer",
                  "animate-fade-in animate-slide-up"
                )}
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: 'both'
                }}
              >
                <div className={cn(
                  "flex flex-col items-center justify-center w-14 h-14 rounded-xl font-bold",
                  eventColor
                )}>
                  <span className="text-2xl leading-none">
                    {getEventIcon(event.event_type)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-foreground truncate">{event.title}</h4>
                    <Badge variant={status.variant} className="text-xs">
                      {status.label}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {formatEventDate(eventDate)} • {format(eventDate, 'HH:mm', { locale: fr })}
                  </p>
                  {event.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {event.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
});
