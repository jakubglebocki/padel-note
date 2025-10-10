"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea
} from 'recharts';
import { format } from 'date-fns';

export interface TrendsChartProps {
  type: 'srpe' | 'acwr';
  data: Array<{ date: string; value: number }>;
  optimalBand?: { min: number; max: number }; // dla ACWR 0.8–1.3
  title: string;
  subtitle?: string;
}

// Formatowanie daty dla tooltip
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return format(date, 'dd MMM');
};

// Formatowanie wartości dla tooltip
const formatValue = (value: number, type: 'srpe' | 'acwr') => {
  if (type === 'srpe') {
    return `${value.toFixed(0)} AU`;
  } else {
    return value.toFixed(2);
  }
};

// Custom tooltip
const CustomTooltip = ({ active, payload, label, type }: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  type: 'srpe' | 'acwr';
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card p-3 border border-border rounded-lg shadow-lg">
        <p className="font-medium text-card-foreground">
          {label ? formatDate(label) : ''}
        </p>
        <p className="text-sm text-muted-foreground">
          {type === 'srpe' ? 'sRPE' : 'ACWR'}: {formatValue(payload[0].value, type)}
        </p>
      </div>
    );
  }
  return null;
};

export function TrendsChart({
  type,
  data,
  optimalBand,
  title,
  subtitle,
}: TrendsChartProps) {
  // Przygotuj dane dla wykresu (ostatnie 28 dni)
  const chartData = data.slice(-28).map(item => ({
    date: item.date,
    value: item.value,
    formattedDate: formatDate(item.date),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          {title}
        </CardTitle>
        {subtitle && (
          <p className="text-sm text-muted-foreground">
            {subtitle}
          </p>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {type === 'srpe' ? (
              <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="formattedDate"
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  domain={[0, 'dataMax + 10']}
                />
                <Tooltip content={<CustomTooltip type="srpe" />} />
                <Bar 
                  dataKey="value" 
                  fill="var(--color-primary)"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            ) : (
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="formattedDate"
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  domain={[0, 'dataMax + 0.2']}
                />
                <Tooltip content={<CustomTooltip type="acwr" />} />
                
                {/* Pasmo optymalne dla ACWR */}
                {optimalBand && (
                  <ReferenceArea
                    y1={optimalBand.min}
                    y2={optimalBand.max}
                    fill="var(--color-success)"
                    fillOpacity={0.1}
                    stroke="var(--color-success)"
                    strokeOpacity={0.3}
                    strokeDasharray="2 2"
                  />
                )}
                
                {/* Linia referencyjna dla ACWR = 1.0 */}
                <ReferenceLine y={1.0} stroke="currentColor" strokeDasharray="2 2" opacity={0.4} />
                
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="var(--color-accent-blue)"
                  strokeWidth={2}
                  dot={{ fill: 'var(--color-accent-blue)', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: 'var(--color-accent-blue)', strokeWidth: 2 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
        
        {/* Legenda dla ACWR */}
        {type === 'acwr' && optimalBand && (
          <div className="mt-4 flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-success/20 rounded"></div>
              <span>Pasmo optymalne ({optimalBand.min}-{optimalBand.max})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border border-muted-foreground border-dashed rounded"></div>
              <span>ACWR = 1.0</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
