import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Users, TrendingUp, DollarSign, Plus, Calendar, Beaker } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const [pigsRes, transactionsRes] = await Promise.all([
        supabase.from('pigs').select('*').eq('user_id', user.id).eq('status', 'active'),
        supabase.from('transactions').select('*').eq('user_id', user.id)
          .gte('transaction_date', new Date(new Date().setDate(1)).toISOString())
      ]);
      
      const revenue = transactionsRes.data
        ?.filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0) || 0;
      
      const expenses = transactionsRes.data
        ?.filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0) || 0;
      
      return {
        totalPigs: pigsRes.data?.length || 0,
        revenue,
        expenses,
        profit: revenue - expenses
      };
    }
  });

  const statCards = [
    {
      title: 'Total Porcs',
      value: stats?.totalPigs || 0,
      icon: Users,
      bgColor: 'bg-primary/10',
      iconColor: 'text-primary',
      trend: '+12%',
      trendUp: true
    },
    {
      title: 'Revenus ce mois',
      value: `${((stats?.revenue || 0) / 1000).toFixed(1)}K`,
      suffix: 'FCFA',
      icon: DollarSign,
      bgColor: 'bg-accent/10',
      iconColor: 'text-accent',
      trend: '+8.5%',
      trendUp: true
    },
    {
      title: 'Dépenses',
      value: `${((stats?.expenses || 0) / 1000).toFixed(1)}K`,
      suffix: 'FCFA',
      icon: TrendingUp,
      bgColor: 'bg-warning/10',
      iconColor: 'text-warning',
      trend: '-3.2%',
      trendUp: false
    }
  ];

  const quickActions = [
    { label: 'Nouveau porc', icon: Plus, href: '/pigs?action=add', color: 'primary' },
    { label: 'Formuler aliment', icon: Beaker, href: '/formulator', color: 'accent' },
    { label: 'Nouvelle vente', icon: DollarSign, href: '/finances?action=add', color: 'primary' },
    { label: 'Calendrier', icon: Calendar, href: '/calendar', color: 'muted' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse-soft">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="animate-fade-in-up">
              <h1 className="text-3xl font-bold text-foreground">
                Tableau de bord
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                {new Date().toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
            <Button 
              className="gap-2 animate-scale-in"
              onClick={() => window.location.href = '/pigs?action=add'}
            >
              <Plus className="w-4 h-4" />
              Ajouter un porc
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat, i) => (
            <div
              key={i}
              className={cn(
                'bg-card rounded-2xl p-6 border-2 border-border hover:border-primary/30 transition-all duration-500 hover:shadow-xl group animate-fade-in-up',
                `stagger-${i + 1}`
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', stat.bgColor)}>
                  <stat.icon className={cn('w-6 h-6', stat.iconColor)} />
                </div>
                {stat.trend && (
                  <span className={cn(
                    'text-sm font-semibold',
                    stat.trendUp ? 'text-primary' : 'text-destructive'
                  )}>
                    {stat.trend}
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-foreground">
                  {stat.value}
                  {stat.suffix && (
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      {stat.suffix}
                    </span>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-card rounded-2xl p-6 border-2 border-border mb-8 animate-fade-in-up stagger-4">
          <h2 className="text-lg font-semibold text-foreground mb-4">Actions rapides</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map((action, i) => (
              <Link
                key={i}
                to={action.href}
                className="flex items-center gap-3 p-4 bg-secondary/30 hover:bg-secondary rounded-xl transition-all duration-300 group/action"
              >
                <div className="w-10 h-10 bg-background rounded-lg flex items-center justify-center group-hover/action:scale-110 transition-transform">
                  <action.icon className="w-5 h-5 text-muted-foreground group-hover/action:text-primary transition-colors" />
                </div>
                <span className="text-sm font-medium text-foreground">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
