import { memo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface HealthChartProps {
  data: { date: string; value: number; target?: number }[];
  title: string;
  unit?: string;
  color?: string;
  showTarget?: boolean;
}

const CustomTooltip = ({ active, payload, label, unit }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-card p-3 shadow-lg">
        <p className="text-sm font-medium text-foreground mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <p className="text-sm text-muted-foreground">
              {entry.name}: <span className="font-semibold text-foreground">{entry.value}{unit}</span>
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

/**
 * Graphique de santé - Style Healthcare Dashboard
 * Inspiré du design Healthcare Dashboard App Concept
 */
export const HealthChart = memo(function HealthChart({
  data,
  title,
  unit = '',
  color = 'hsl(var(--primary))',
  showTarget = false,
}: HealthChartProps) {
  return (
    <Card className="shadow-lg border-border/50 hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis
                dataKey="date"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                unit={unit}
              />
              <Tooltip content={<CustomTooltip unit={unit} />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                fill={`url(#gradient-${title})`}
                strokeWidth={2}
                dot={{ fill: color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: color }}
              />
              {showTarget && (
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="hsl(var(--muted-foreground))"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  dot={false}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
});

