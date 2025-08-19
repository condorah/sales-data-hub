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
  const averagePerSession = uniqueSessions > 0 ? totalSales / uniqueSessions : 0;

  const metrics = [
    {
      title: "Total de Vendas",
      value: totalSales.toLocaleString('pt-BR'),
      icon: TrendingUp,
      trend: "+12%",
      trendUp: true,
      description: "vs mês anterior"
    },
    {
      title: "Sessões Ativas",
      value: uniqueSessions.toString(),
      icon: Users,
      trend: "+3",
      trendUp: true,
      description: "novas sessões"
    },
    {
      title: "Grupos Ativos",
      value: uniqueGroups.toString(),
      icon: BarChart3,
      trend: "0",
      trendUp: false,
      description: "sem alteração"
    },
    {
      title: "Média por Sessão",
      value: Math.round(averagePerSession).toLocaleString('pt-BR'),
      icon: TrendingUp,
      trend: "+8%",
      trendUp: true,
      description: "vs período anterior"
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