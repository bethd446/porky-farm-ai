import { memo } from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrencyFull } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface FinanceSummaryProps {
  income: number;
  expenses: number;
  balance: number;
  incomeChange?: number;
  expensesChange?: number;
  balanceChange?: number;
}

/**
 * Résumé financier - Style TimeNote Finance
 * Cartes modernes avec indicateurs de tendance
 */
export const FinanceSummary = memo(function FinanceSummary({
  income,
  expenses,
  balance,
  incomeChange,
  expensesChange,
  balanceChange,
}: FinanceSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Revenus */}
      <Card className="relative overflow-hidden border-2 border-success/20 bg-gradient-to-br from-success/5 to-success/10 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Revenus</p>
              <p className="text-3xl font-bold text-success">
                {formatCurrencyFull(income)}
                <span className="text-lg font-normal text-muted-foreground ml-1">FCFA</span>
              </p>
            </div>
            <div className="h-14 w-14 rounded-xl bg-success/20 flex items-center justify-center">
              <ArrowUpRight className="h-7 w-7 text-success" />
            </div>
          </div>
          {incomeChange !== undefined && (
            <div className={cn(
              'flex items-center gap-1.5 text-sm font-semibold',
              incomeChange >= 0 ? 'text-success' : 'text-destructive'
            )}>
              {incomeChange >= 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span>{incomeChange >= 0 ? '+' : ''}{incomeChange}%</span>
              <span className="text-muted-foreground font-normal">vs mois dernier</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dépenses */}
      <Card className="relative overflow-hidden border-2 border-revenue/20 bg-gradient-to-br from-revenue/5 to-revenue/10 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Dépenses</p>
              <p className="text-3xl font-bold text-revenue">
                {formatCurrencyFull(expenses)}
                <span className="text-lg font-normal text-muted-foreground ml-1">FCFA</span>
              </p>
            </div>
            <div className="h-14 w-14 rounded-xl bg-revenue/20 flex items-center justify-center">
              <ArrowDownRight className="h-7 w-7 text-revenue" />
            </div>
          </div>
          {expensesChange !== undefined && (
            <div className={cn(
              'flex items-center gap-1.5 text-sm font-semibold',
              expensesChange <= 0 ? 'text-success' : 'text-destructive'
            )}>
              {expensesChange <= 0 ? (
                <TrendingDown className="h-4 w-4" />
              ) : (
                <TrendingUp className="h-4 w-4" />
              )}
              <span>{expensesChange >= 0 ? '+' : ''}{expensesChange}%</span>
              <span className="text-muted-foreground font-normal">vs mois dernier</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Solde */}
      <Card className={cn(
        'relative overflow-hidden border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1',
        balance >= 0
          ? 'border-success/20 bg-gradient-to-br from-success/5 to-success/10'
          : 'border-destructive/20 bg-gradient-to-br from-destructive/5 to-destructive/10'
      )}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Solde</p>
              <p className={cn(
                'text-3xl font-bold',
                balance >= 0 ? 'text-success' : 'text-destructive'
              )}>
                {formatCurrencyFull(balance)}
                <span className="text-lg font-normal text-muted-foreground ml-1">FCFA</span>
              </p>
            </div>
            <div className={cn(
              'h-14 w-14 rounded-xl flex items-center justify-center',
              balance >= 0 ? 'bg-success/20' : 'bg-destructive/20'
            )}>
              {balance >= 0 ? (
                <Wallet className="h-7 w-7 text-success" />
              ) : (
                <TrendingDown className="h-7 w-7 text-destructive" />
              )}
            </div>
          </div>
          {balanceChange !== undefined && (
            <div className={cn(
              'flex items-center gap-1.5 text-sm font-semibold',
              balanceChange >= 0 ? 'text-success' : 'text-destructive'
            )}>
              {balanceChange >= 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span>{balanceChange >= 0 ? '+' : ''}{balanceChange}%</span>
              <span className="text-muted-foreground font-normal">vs mois dernier</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

