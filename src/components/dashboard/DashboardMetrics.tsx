import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, BarChart3, Users } from "lucide-react";
import type { DataRecord } from "@/pages/Dashboard";

interface DashboardMetricsProps {
  data: DataRecord[];
}

export const DashboardMetrics = ({ data }: DashboardMetricsProps) => {
  const totalSales = data.reduce((sum, item) => sum + item.total, 0);
  const uniqueSessions = new Set(data.map(item => item.session)).size;
  const uniqueGroups = new Set(data.map(item => item.group)).size;
  const uniqueStores = new Set(data.map(item => item.store)).size;
  const averagePerStore = uniqueStores > 0 ? totalSales / uniqueStores : 0;
  
  // Análises avançadas
  const topSession = data.length > 0 ? 
    Object.entries(data.reduce((acc, item) => {
      acc[item.session] = (acc[item.session] || 0) + item.total;
      return acc;
    }, {} as Record<string, number>))
    .sort(([,a], [,b]) => b - a)[0] : null;

  const topStore = data.length > 0 ?
    Object.entries(data.reduce((acc, item) => {
      acc[item.store] = (acc[item.store] || 0) + item.total;
      return acc;
    }, {} as Record<string, number>))
    .sort(([,a], [,b]) => b - a)[0] : null;

  const growthRate = data.length > 1 ? 
    ((data[data.length - 1]?.total || 0) - (data[0]?.total || 0)) / (data[0]?.total || 1) * 100 : 0;

  const metrics = [
    {
      title: "Total de Vendas",
      value: totalSales.toLocaleString('pt-BR'),
      icon: TrendingUp,
      trend: `${growthRate >= 0 ? '+' : ''}${growthRate.toFixed(1)}%`,
      trendUp: growthRate >= 0,
      description: "crescimento geral"
    },
    {
      title: "Sessões Ativas",
      value: uniqueSessions.toString(),
      icon: Users,
      trend: topSession ? topSession[0].substring(0, 15) : "N/A",
      trendUp: true,
      description: "sessão líder"
    },
    {
      title: "Lojas Ativas", 
      value: uniqueStores.toString(),
      icon: BarChart3,
      trend: topStore ? topStore[0] : "N/A",
      trendUp: true,
      description: "loja líder"
    },
    {
      title: "Média por Loja",
      value: Math.round(averagePerStore).toLocaleString('pt-BR'),
      icon: TrendingUp,
      trend: `${uniqueGroups}`,
      trendUp: true,
      description: "grupos ativos"
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
            <div className="text-2xl font-bold text-foreground mb-2">
              {metric.value}
            </div>
            <div className="flex items-center text-xs">
              {metric.trendUp ? (
                <TrendingUp className="h-3 w-3 text-success mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-muted-foreground mr-1" />
              )}
              <span className={metric.trendUp ? "text-success" : "text-muted-foreground"}>
                {metric.trend}
              </span>
              <span className="text-muted-foreground ml-1">
                {metric.description}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};