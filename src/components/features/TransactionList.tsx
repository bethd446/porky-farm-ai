import { memo } from 'react';
import { ArrowUpRight, ArrowDownRight, MoreVertical, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Transaction } from '@/types/database';
import { formatCurrencyFull } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
}

/**
 * Liste de transactions - Style TimeNote Finance
 * Design épuré avec actions contextuelles
 */
export const TransactionList = memo(function TransactionList({
  transactions,
  onEdit,
  onDelete,
}: TransactionListProps) {
  const groupedTransactions = transactions.reduce((acc, transaction) => {
    const date = format(new Date(transaction.transaction_date), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(transaction);
    return acc;
  }, {} as Record<string, Transaction[]>);

  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
          <Filter className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-lg font-medium text-foreground mb-2">Aucune transaction</p>
        <p className="text-sm text-muted-foreground">
          Commencez par ajouter votre première transaction
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sortedDates.map((date) => {
        const dayTransactions = groupedTransactions[date];
        const dayTotal = dayTransactions.reduce((sum, t) => {
          return sum + (t.type === 'income' ? t.amount : -t.amount);
        }, 0);

        return (
          <div key={date} className="space-y-3">
            {/* Date header */}
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  {format(new Date(date), 'EEEE d MMMM yyyy', { locale: fr })}
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <span className={cn(
                'text-sm font-semibold px-2 py-1 rounded',
                dayTotal >= 0 ? 'text-success bg-success/10' : 'text-destructive bg-destructive/10'
              )}>
                {dayTotal >= 0 ? '+' : ''}{formatCurrencyFull(dayTotal)} FCFA
              </span>
            </div>

            {/* Transactions du jour */}
            <div className="space-y-2">
              {dayTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className={cn(
                    'group flex items-center justify-between p-4 rounded-xl',
                    'bg-card border border-border/50',
                    'hover:border-primary/50 hover:shadow-md',
                    'transition-all duration-200',
                    'animate-fade-in'
                  )}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Icon */}
                    <div className={cn(
                      'h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0',
                      transaction.type === 'income'
                        ? 'bg-success/10 text-success'
                        : 'bg-revenue/10 text-revenue'
                    )}>
                      {transaction.type === 'income' ? (
                        <ArrowUpRight className="h-6 w-6" />
                      ) : (
                        <ArrowDownRight className="h-6 w-6" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-foreground truncate">
                          {transaction.description || transaction.category}
                        </p>
                        {transaction.category && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                            {transaction.category}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(transaction.transaction_date), 'HH:mm', { locale: fr })}
                      </p>
                    </div>

                    {/* Amount */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <p className={cn(
                        'text-lg font-bold',
                        transaction.type === 'income' ? 'text-success' : 'text-revenue'
                      )}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrencyFull(transaction.amount)} FCFA
                      </p>

                      {/* Actions menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {onEdit && (
                            <DropdownMenuItem onClick={() => onEdit(transaction)}>
                              Modifier
                            </DropdownMenuItem>
                          )}
                          {onDelete && (
                            <DropdownMenuItem
                              onClick={() => onDelete(transaction)}
                              className="text-destructive"
                            >
                              Supprimer
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
});

