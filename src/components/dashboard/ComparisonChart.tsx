import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { GitCompare } from "lucide-react";
import type { DataRecord } from "@/pages/Dashboard";

interface ComparisonChartProps {
  period1Data: DataRecord[];
  period2Data: DataRecord[];
  period1Name: string;
  period2Name: string;
}

export const ComparisonChart = ({ 
  period1Data, 
  period2Data, 
  period1Name, 
  period2Name 
}: ComparisonChartProps) => {
  const processDataBySession = (data: DataRecord[]) => {
    return data.reduce((acc, item) => {
      const existing = acc.find(d => d.session === item.session);
      if (existing) {
        existing.total += item.total;
      } else {
        acc.push({ session: item.session, total: item.total });
      }
      return acc;
    }, [] as { session: string; total: number }[]);
  };

  const period1Sessions = processDataBySession(period1Data);
  const period2Sessions = processDataBySession(period2Data);

  // Combine data for comparison
  const allSessions = [...new Set([
    ...period1Sessions.map(s => s.session),
    ...period2Sessions.map(s => s.session)
  ])];

  const chartData = allSessions.map(session => {
    const period1Value = period1Sessions.find(s => s.session === session)?.total || 0;
    const period2Value = period2Sessions.find(s => s.session === session)?.total || 0;
    
    return {
      session: session.length > 15 ? session.substring(0, 12) + "..." : session,
      fullSession: session,
      [period1Name]: period1Value,
      [period2Name]: period2Value
    };
  });

  const sortedData = chartData.sort((a, b) => 
    ((b[period1Name] as number) + (b[period2Name] as number)) - ((a[period1Name] as number) + (a[period2Name] as number))
  );

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitCompare className="h-5 w-5 text-primary" />
          Comparação por Sessão: {period1Name} vs {period2Name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sortedData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="session" 
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  value.toLocaleString('pt-BR'), 
                  name
                ]}
                labelFormatter={(label, payload) => {
                  const item = payload?.[0]?.payload;
                  return item?.fullSession || label;
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius)'
                }}
              />
              <Legend />
              <Bar 
                dataKey={period1Name} 
                fill="hsl(var(--primary))" 
                radius={[2, 2, 0, 0]}
                opacity={0.8}
              />
              <Bar 
                dataKey={period2Name} 
                fill="hsl(var(--accent))" 
                radius={[2, 2, 0, 0]}
                opacity={0.8}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};