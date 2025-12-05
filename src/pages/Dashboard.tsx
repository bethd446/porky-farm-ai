import { useEffect, useState, useCallback, useMemo } from 'react';
import { PiggyBank, DollarSign, Wheat, Bell } from 'lucide-react';
import { StatCard } from '@/components/features/StatCard';
import { QuickActions } from '@/components/features/QuickActions';
import { WeightChart } from '@/components/features/WeightChart';
import { UpcomingEvents } from '@/components/features/UpcomingEvents';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Event, DashboardStats } from '@/types/database';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/formatters';
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh';
import { hapticMedium } from '@/lib/haptic-feedback';

const mockWeightData = [
  { month: 'Jan', weight: 30 },
  { month: 'Fév', weight: 38 },
  { month: 'Mar', weight: 45 },
  { month: 'Avr', weight: 52 },
  { month: 'Mai', weight: 58 },
  { month: 'Juin', weight: 65 },
];

/**
 * Page Dashboard - Vue d'ensemble de la ferme
 * Affiche les statistiques, graphiques et événements à venir
 */
export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch pigs count
      const { count: pigsCount } = await supabase
        .from('pigs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'active');

      // Fetch upcoming events
      const { data: eventsData } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id)
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true })
        .limit(5);

      // Mock stats for now (would come from aggregated queries)
      setStats({
        totalPigs: pigsCount || 0,
        pigsChange: 12,
        monthlyRevenue: 2400000,
        revenueChange: 8,
        feedCost: 850000,
        feedCostChange: -3,
        alertsCount: 5,
      });

      setEvents((eventsData || []) as Event[]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Pull to refresh
  const { isPulling } = usePullToRefresh({
    onRefresh: async () => {
      hapticMedium();
      setLoading(true);
      await fetchDashboardData();
    },
  });

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="content-area space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  // Données mockées pour le graphique (sera remplacé par des données réelles)
  const weightData = useMemo(() => [
    { month: 'Jan', weight: 30 },
    { month: 'Fév', weight: 38 },
    { month: 'Mar', weight: 45 },
    { month: 'Avr', weight: 52 },
    { month: 'Mai', weight: 58 },
    { month: 'Juin', weight: 65 },
  ], []);

  return (
    <div className={`content-area space-y-6 transition-transform duration-300 ${isPulling ? 'translate-y-2' : ''}`}>
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Porcs"
          value={stats?.totalPigs || 0}
          change={stats?.pigsChange}
          icon={PiggyBank}
          variant="success"
        />
        <StatCard
          title="Revenu mensuel"
          value={formatCurrency(stats?.monthlyRevenue || 0)}
          change={stats?.revenueChange}
          icon={DollarSign}
          variant="revenue"
          suffix="FCFA"
        />
        <StatCard
          title="Coût alimentaire"
          value={formatCurrency(stats?.feedCost || 0)}
          change={stats?.feedCostChange}
          icon={Wheat}
          variant="warning"
          suffix="FCFA"
        />
        <StatCard
          title="Alertes"
          value={stats?.alertsCount || 0}
          icon={Bell}
          variant="info"
        />
      </div>

      {/* Charts and Actions */}
      <div className="grid lg:grid-cols-2 gap-6">
        <WeightChart data={weightData} />
        <QuickActions />
      </div>

      {/* Upcoming Events */}
      <UpcomingEvents events={events} />
    </div>
  );
}
