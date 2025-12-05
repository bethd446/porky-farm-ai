import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Wallet, Search, Filter, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/database';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { formatCurrency, formatCurrencyFull } from '@/lib/formatters';
import { FinanceSummary } from '@/components/features/FinanceSummary';
import { TransactionList } from '@/components/features/TransactionList';
import { AddTransactionDialog } from '@/components/features/AddTransactionDialog';
import { hapticLight } from '@/lib/haptic-feedback';
import { toast } from 'sonner';

const COLORS = ['hsl(142, 71%, 45%)', 'hsl(340, 82%, 52%)', 'hsl(38, 92%, 50%)', 'hsl(217, 91%, 60%)', 'hsl(215, 16%, 47%)'];

export default function Finances() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [period, setPeriod] = useState('month');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(searchParams.get('action') === 'sale' || searchParams.get('action') === 'add');

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('transaction_date', { ascending: false });

        if (error) throw error;
        setTransactions((data || []) as Transaction[]);
        setFilteredTransactions((data || []) as Transaction[]);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user]);

  // Filtrage des transactions
  useEffect(() => {
    let filtered = [...transactions];

    // Filtre par type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(t => t.type === typeFilter);
    }

    // Filtre par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.description?.toLowerCase().includes(query) ||
        t.category?.toLowerCase().includes(query) ||
        formatCurrencyFull(t.amount).includes(query)
      );
    }

    setFilteredTransactions(filtered);
  }, [transactions, typeFilter, searchQuery]);

  // Calculate totals avec useMemo pour optimiser
  const income = useMemo(() => 
    transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  );

  const expenses = useMemo(() =>
    transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  );

  const balance = useMemo(() => income - expenses, [income, expenses]);

  // Calculer les changements (mock pour l'instant)
  const incomeChange = useMemo(() => 8, []);
  const expensesChange = useMemo(() => -3, []);
  const balanceChange = useMemo(() => 12, []);

  // Group expenses by category
  const expensesByCategory = useMemo(() =>
    transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>),
    [transactions]
  );

  const pieData = useMemo(() =>
    Object.entries(expensesByCategory).map(([name, value]) => ({
      name,
      value,
    })),
    [expensesByCategory]
  );

  // Mock monthly data (sera remplacé par des données réelles)
  const monthlyData = useMemo(() => [
    { month: 'Jan', revenus: 1800000, depenses: 650000 },
    { month: 'Fév', revenus: 2100000, depenses: 720000 },
    { month: 'Mar', revenus: 1950000, depenses: 680000 },
    { month: 'Avr', revenus: 2400000, depenses: 850000 },
    { month: 'Mai', revenus: 2200000, depenses: 780000 },
    { month: 'Juin', revenus: 2600000, depenses: 900000 },
  ], []);

  // Utiliser la fonction formatCurrencyFull du module formatters
  const formatCurrency = useCallback((value: number) => {
    return formatCurrencyFull(value);
  }, []);

  // Ajouter une transaction
  const addTransaction = useCallback(async (data: Partial<Transaction>) => {
    if (!user) return { error: new Error('Non authentifié') };

    try {
      const { error } = await supabase
        .from('transactions')
        .insert([{
          ...data,
          user_id: user.id,
        }]);

      if (error) throw error;

      // Rafraîchir les transactions
      const { data: newData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('transaction_date', { ascending: false });

      if (newData) {
        setTransactions(newData as Transaction[]);
      }

      return { error: null };
    } catch (error) {
      console.error('Error adding transaction:', error);
      return { error: error as Error };
    }
  }, [user]);

  // Exporter les données
  const handleExport = useCallback(() => {
    hapticLight();
    const csv = [
      ['Type', 'Montant', 'Catégorie', 'Description', 'Date'].join(','),
      ...filteredTransactions.map(t => [
        t.type === 'income' ? 'Revenu' : 'Dépense',
        t.amount,
        t.category || '',
        `"${(t.description || '').replace(/"/g, '""')}"`,
        format(new Date(t.transaction_date), 'dd/MM/yyyy', { locale: fr }),
      ].join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `transactions-${format(new Date(), 'yyyy-MM-dd', { locale: fr })}.csv`;
    link.click();
  }, [filteredTransactions]);

  return (
    <div className="content-area space-y-6 pb-20">
      {/* Header - Style TimeNote */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent flex items-center gap-3">
              <Wallet className="h-8 w-8 text-primary" />
              Finances
            </h1>
            <p className="text-muted-foreground mt-1">Gérez vos revenus et dépenses de votre élevage</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleExport} disabled={filteredTransactions.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
            <Button onClick={() => {
              hapticLight();
              setDialogOpen(true);
              setSearchParams({});
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Transaction
            </Button>
          </div>
        </div>

        {/* Filtres et recherche - Style TimeNote */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une transaction..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as 'all' | 'income' | 'expense')}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="income">Revenus</SelectItem>
              <SelectItem value="expense">Dépenses</SelectItem>
            </SelectContent>
          </Select>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Cette semaine</SelectItem>
              <SelectItem value="month">Ce mois</SelectItem>
              <SelectItem value="year">Cette année</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards - Style TimeNote */}
      <FinanceSummary
        income={income}
        expenses={expenses}
        balance={balance}
        incomeChange={incomeChange}
        expensesChange={expensesChange}
        balanceChange={balanceChange}
      />

      {/* Charts - Style TimeNote */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="shadow-lg border-border/50 hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Évolution mensuelle</CardTitle>
            <CardDescription>Revenus et dépenses sur 6 mois</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                    formatter={(value: number) => [formatCurrencyFull(value) + ' FCFA', '']}
                  />
                  <Legend />
                  <Bar 
                    dataKey="revenus" 
                    fill="hsl(var(--success))" 
                    radius={[8, 8, 0, 0]}
                    name="Revenus"
                  />
                  <Bar 
                    dataKey="depenses" 
                    fill="hsl(var(--revenue))" 
                    radius={[8, 8, 0, 0]}
                    name="Dépenses"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-border/50 hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Répartition des dépenses</CardTitle>
            <CardDescription>Par catégorie</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                      formatter={(value: number) => [formatCurrencyFull(value) + ' FCFA', '']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Filter className="h-12 w-12 mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Aucune donnée</p>
                  <p className="text-sm">Ajoutez des transactions pour voir les statistiques</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List - Style TimeNote */}
      <Card className="shadow-lg border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>
              {filteredTransactions.length} transaction{filteredTransactions.length > 1 ? 's' : ''} trouvée{filteredTransactions.length > 1 ? 's' : ''}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <TransactionList
            transactions={filteredTransactions}
            onEdit={(transaction) => {
              hapticLight();
              toast.info('Édition de transaction à venir');
            }}
            onDelete={async (transaction) => {
              hapticLight();
              if (confirm('Êtes-vous sûr de vouloir supprimer cette transaction ?')) {
                try {
                  const { error } = await supabase
                    .from('transactions')
                    .delete()
                    .eq('id', transaction.id);

                  if (error) throw error;

                  setTransactions(prev => prev.filter(t => t.id !== transaction.id));
                  setFilteredTransactions(prev => prev.filter(t => t.id !== transaction.id));
                  toast.success('Transaction supprimée');
                } catch (error) {
                  console.error('Error deleting transaction:', error);
                  toast.error('Erreur lors de la suppression');
                }
              }
            }}
          />
        </CardContent>
      </Card>

      {/* Add Transaction Dialog */}
      <AddTransactionDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setSearchParams({});
          }
        }}
        onSubmit={addTransaction}
      />
    </div>
  );
}
