import { memo, useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Event } from '@/types/database';
import { EVENT_TYPES } from '@/lib/constants';
import { hapticLight } from '@/lib/haptic-feedback';

interface UpcomingEventsProps {
  events: Event[];
}

/**
 * Composant d'affichage des événements à venir
 * Optimisé avec React.memo pour éviter les re-renders inutiles
 */
export const UpcomingEvents = memo(function UpcomingEvents({ events }: UpcomingEventsProps) {
  const navigate = useNavigate();

  const getEventIcon = useCallback((type: string) => {
    const eventType = EVENT_TYPES.find(e => e.value === type);
    return eventType?.icon || '📝';
  }, []);

  const handleViewAll = useCallback(() => {
    hapticLight();
    navigate('/calendar');
  }, [navigate]);

  const displayedEvents = useMemo(() => events.slice(0, 3), [events]);

  return (
    <div className="stat-card">
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
          displayedEvents.map((event) => {
            const eventDate = new Date(event.event_date);
            return (
              <div 
                key={event.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-info-light text-info-foreground">
                  <span className="text-lg font-bold leading-none">
                    {format(eventDate, 'd')}
                  </span>
                  <span className="text-xs uppercase">
                    {format(eventDate, 'MMM', { locale: fr })}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getEventIcon(event.event_type)}</span>
                    <h4 className="font-medium text-foreground truncate">{event.title}</h4>
                  </div>
                  {event.description && (
                    <p className="text-sm text-muted-foreground truncate mt-0.5">
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
