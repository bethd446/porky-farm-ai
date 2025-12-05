import { memo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface WeightData {
  month: string;
  weight: number;
}

interface WeightEvolutionChartProps {
  data: WeightData[];
}

/**
 * Composant graphique d'évolution du poids moyen
 * Avec gradient fill et tooltip personnalisé
 */
export const WeightEvolutionChart = memo(function WeightEvolutionChart({ data }: WeightEvolutionChartProps) {
  // Tooltip personnalisé
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3">
          <p className="text-sm font-semibold text-foreground mb-1">
            {payload[0].payload.month}
          </p>
          <p className="text-sm text-success font-medium">
            Poids moyen: <span className="font-bold">{payload[0].value} kg</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="stat-card">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">Évolution poids moyen</h3>
        <p className="text-sm text-muted-foreground">Sur 6 mois</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis 
            dataKey="month" 
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
            label={{ value: 'kg', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="weight"
            stroke="hsl(142, 71%, 45%)"
            strokeWidth={3}
            fill="url(#colorWeight)"
            dot={{ fill: 'hsl(142, 71%, 45%)', r: 5, strokeWidth: 2, stroke: 'hsl(var(--background))' }}
            activeDot={{ r: 7, strokeWidth: 2, stroke: 'hsl(142, 71%, 45%)' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
});

