import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { TrendingUp } from "lucide-react";
import type { DataRecord } from "@/pages/Dashboard";

interface PieChartProps {
  data: DataRecord[];
  title: string;
  dataKey: 'session' | 'store' | 'group';
  valueKey: 'value_sold' | 'profit_value' | 'quantity_sold';
  valueLabel: string;
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--success))',
  'hsl(var(--warning))',
  'hsl(var(--destructive))',
  'hsl(var(--accent))',
  'hsl(220 91% 70%)',
  'hsl(142 76% 56%)',
  'hsl(38 92% 60%)',
];

export const CustomPieChart = ({ data, title, dataKey, valueKey, valueLabel }: PieChartProps) => {
  const chartData = data.reduce((acc, item) => {
    const key = item[dataKey];
    const value = item[valueKey] || 0;
    const existing = acc.find(d => d.name === key);
    if (existing) {
      existing.value += value;
    } else {
      acc.push({ name: key, value });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const sortedData = chartData
    .sort((a, b) => b.value - a.value)
    .slice(0, 8); // Limit to top 8 items

  const formatValue = (value: number) => {
    if (valueKey === 'quantity_sold') {
      return value.toLocaleString('pt-BR');
    }
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{payload[0].payload.name}</p>
          <p className="text-primary">
            {valueLabel}: {formatValue(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderLabel = (entry: any) => {
    const percent = ((entry.value / sortedData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1);
    return `${percent}%`;
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sortedData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {sortedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => (
                  <span className="text-sm text-foreground">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};