import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Users, ShoppingBag, Store } from "lucide-react";
import type { DataRecord } from "@/pages/Dashboard";

interface ComparisonMetricsProps {
  period1Data: DataRecord[];
  period2Data: DataRecord[];
  period1Name: string;
  period2Name: string;
}

export const ComparisonMetrics = ({ 
  period1Data, 
  period2Data, 
  period1Name, 
  period2Name 
}: ComparisonMetricsProps) => {
  const calculateMetrics = (data: DataRecord[]) => ({
    totalSales: data.reduce((sum, item) => sum + item.total, 0),
    uniqueSessions: new Set(data.map(item => item.session)).size,
    uniqueStores: new Set(data.map(item => item.store)).size,
    averagePerStore: data.length > 0 ? data.reduce((sum, item) => sum + item.total, 0) / new Set(data.map(item => item.store)).size : 0
  });

  const period1Metrics = calculateMetrics(period1Data);
  const period2Metrics = calculateMetrics(period2Data);

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const salesChange = calculateChange(period2Metrics.totalSales, period1Metrics.totalSales);
  const sessionsChange = calculateChange(period2Metrics.uniqueSessions, period1Metrics.uniqueSessions);
  const storesChange = calculateChange(period2Metrics.uniqueStores, period1Metrics.uniqueStores);
  const avgChange = calculateChange(period2Metrics.averagePerStore, period1Metrics.averagePerStore);

  const metrics = [
    {
      title: "Total de Vendas",
      period1: period1Metrics.totalSales.toLocaleString('pt-BR'),
      period2: period2Metrics.totalSales.toLocaleString('pt-BR'),
      change: salesChange,
      icon: TrendingUp
    },
    {
      title: "Sessões Ativas",
      period1: period1Metrics.uniqueSessions.toString(),
      period2: period2Metrics.uniqueSessions.toString(),
      change: sessionsChange,
      icon: Users
    },
    {
      title: "Lojas Ativas",
      period1: period1Metrics.uniqueStores.toString(),
      period2: period2Metrics.uniqueStores.toString(),
      change: storesChange,
      icon: Store
    },
    {
      title: "Média por Loja",
      period1: Math.round(period1Metrics.averagePerStore).toLocaleString('pt-BR'),
      period2: Math.round(period2Metrics.averagePerStore).toLocaleString('pt-BR'),
      change: avgChange,
      icon: ShoppingBag
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <Card key={index} className="shadow-card hover:shadow-hover transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {metric.title}
            </CardTitle>
            <metric.icon className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Period 1 */}
              <div>
                <div className="text-xs text-muted-foreground mb-1">{period1Name}</div>
                <div className="text-lg font-semibold text-primary/80">
                  {metric.period1}
                </div>
              </div>

              {/* Period 2 */}
              <div>
                <div className="text-xs text-muted-foreground mb-1">{period2Name}</div>
                <div className="text-lg font-semibold text-foreground">
                  {metric.period2}
                </div>
              </div>

              {/* Change */}
              <div className="flex items-center text-xs pt-2 border-t border-border">
                {metric.change > 0 ? (
                  <TrendingUp className="h-3 w-3 text-success mr-1" />
                ) : metric.change < 0 ? (
                  <TrendingDown className="h-3 w-3 text-destructive mr-1" />
                ) : (
                  <div className="h-3 w-3 mr-1" />
                )}
                <span className={
                  metric.change > 0 
                    ? "text-success" 
                    : metric.change < 0 
                      ? "text-destructive" 
                      : "text-muted-foreground"
                }>
                  {metric.change > 0 ? "+" : ""}{metric.change.toFixed(1)}%
                </span>
                <span className="text-muted-foreground ml-1">
                  vs {period1Name}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};