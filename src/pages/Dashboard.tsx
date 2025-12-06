import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, DollarSign, Calendar, Plus, Beaker, ShoppingCart } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Event } from '@/types/database';
import { StatCardSkeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/formatters';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { pageTransition, staggerContainer, fadeInUp } from '@/lib/animations';
import { UpcomingEvents } from '@/components/features/UpcomingEvents';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { designSystem } from '@/lib/design-system';

const mockWeightData = [
  { month: 'Jan', weight: 30 },
  { month: 'Fév', weight: 38 },
  { month: 'Mar', weight: 45 },
  { month: 'Avr', weight: 52 },
  { month: 'Mai', weight: 58 },
  { month: 'Juin', weight: 65 },
];

/**
 * Dashboard moderne - Vue d'ensemble professionnelle
 */
export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Fetch pigs count
      const { count: pigsCount } = await supabase
        .from('pigs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'active');

      // Fetch transactions for current month
      const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('transaction_date', firstDayOfMonth.toISOString());

      const revenue = transactions
        ?.filter((t) => t.type === 'revenue')
        .reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

      const expenses = transactions
        ?.filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

      return {
        totalPigs: pigsCount || 0,
        revenue,
        expenses,
        profit: revenue - expenses,
      };
    },
    enabled: !!user,
  });

  const { data: events } = useQuery({
    queryKey: ['upcoming-events', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id)
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true })
        .limit(3);
      return (data || []) as Event[];
    },
    enabled: !!user,
  });

  const statCards = [
    {
      title: 'Total Porcs',
      value: stats?.totalPigs || 0,
      icon: Users,
      color: 'bg-green-50 text-green-600',
      trend: '+12%',
    },
    {
      title: 'Revenus ce mois',
      value: `${Math.round((stats?.revenue || 0) / 1000)}K`,
      icon: DollarSign,
      color: 'bg-blue-50 text-blue-600',
      suffix: 'FCFA',
    },
    {
      title: 'Dépenses',
      value: `${Math.round((stats?.expenses || 0) / 1000)}K`,
      icon: TrendingUp,
      color: 'bg-orange-50 text-orange-600',
      suffix: 'FCFA',
    },
  ];

  const handleAddPig = () => {
    navigate('/pigs?action=add');
  };

  const handleFormulateFeed = () => {
    navigate('/formulator');
  };

  const handleNewSale = () => {
    navigate('/finances?action=add');
  };

  const handleCalendar = () => {
    navigate('/calendar');
  };

  const currentDate = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <motion.div
      className="min-h-screen bg-gray-50 pb-20"
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
              <p className="text-gray-500 mt-1">{currentDate}</p>
            </div>
            <Button onClick={handleAddPig} className="gap-2">
              <Plus className="w-4 h-4" />
              Ajouter un porc
            </Button>
          </div>
        </div>
      </header>

      {/* Stats */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {isLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            statCards.map((stat, i) => (
              <motion.div key={i} variants={fadeInUp}>
                <Card className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {stat.value}
                        {stat.suffix && (
                          <span className="text-sm font-normal text-gray-500 ml-2">
                            {stat.suffix}
                          </span>
                        )}
                      </p>
                      {stat.trend && (
                        <p className="text-sm font-medium text-green-600 mt-2">{stat.trend}</p>
                      )}
                    </div>
                    <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Graphique */}
        <motion.div
          variants={fadeInUp}
          className="bg-white rounded-xl p-6 border border-gray-200 mb-8 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Évolution du poids moyen</h2>
          {isLoading ? (
            <div className="h-80 w-full bg-gray-100 rounded-lg animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockWeightData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={designSystem.colors.border.light} vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke={designSystem.colors.text.tertiary}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke={designSystem.colors.text.tertiary}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}kg`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: designSystem.colors.background.DEFAULT,
                    border: `1px solid ${designSystem.colors.border.DEFAULT}`,
                    borderRadius: designSystem.radius.DEFAULT,
                    boxShadow: designSystem.shadows.DEFAULT,
                  }}
                  labelStyle={{ color: designSystem.colors.text.secondary }}
                  itemStyle={{ color: designSystem.colors.text.primary }}
                  formatter={(value: number) => [`${value}kg`, 'Poids']}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke={designSystem.colors.primary.DEFAULT}
                  strokeWidth={2}
                  dot={{ fill: designSystem.colors.primary.DEFAULT, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 2, fill: designSystem.colors.primary.DEFAULT, stroke: designSystem.colors.primary.light }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Actions Rapides */}
        <motion.div variants={fadeInUp} className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" onClick={handleAddPig} className="h-auto py-4 flex-col gap-2">
              <Plus className="w-5 h-5" />
              <span className="text-sm">Nouveau porc</span>
            </Button>
            <Button variant="outline" onClick={handleFormulateFeed} className="h-auto py-4 flex-col gap-2">
              <Beaker className="w-5 h-5" />
              <span className="text-sm">Formuler aliment</span>
            </Button>
            <Button variant="outline" onClick={handleNewSale} className="h-auto py-4 flex-col gap-2">
              <ShoppingCart className="w-5 h-5" />
              <span className="text-sm">Nouvelle vente</span>
            </Button>
            <Button variant="outline" onClick={handleCalendar} className="h-auto py-4 flex-col gap-2">
              <Calendar className="w-5 h-5" />
              <span className="text-sm">Calendrier</span>
            </Button>
          </div>
        </motion.div>

        {/* Mini liste "À venir" */}
        <motion.div variants={fadeInUp}>
          <UpcomingEvents events={events || []} />
        </motion.div>
      </main>
    </motion.div>
  );
}
