import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, BarChart3, Users, ShoppingBag, DollarSign } from "lucide-react";
import type { DataRecord } from "@/pages/Dashboard";

interface DashboardMetricsProps {
  data: DataRecord[];
}

export const DashboardMetrics = ({ data }: DashboardMetricsProps) => {
  const totalSales = data.reduce((sum, item) => sum + (item.value_sold || item.total), 0);
  const totalQuantity = data.reduce((sum, item) => sum + (item.quantity_sold || 0), 0);
  const totalProfit = data.reduce((sum, item) => sum + (item.profit_value || 0), 0);
  const uniqueSessions = new Set(data.map(item => item.session)).size;
  const uniqueGroups = new Set(data.map(item => item.group)).size;
  const uniqueStores = new Set(data.map(item => item.store)).size;
  const uniqueProducts = new Set(data.map(item => item.product_code).filter(Boolean)).size;
  const averagePerStore = uniqueStores > 0 ? totalSales / uniqueStores : 0;
  
  // Calculate profit margin
  const profitMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;
  
  // Top performers
  const storesSales = data.reduce((acc, item) => {
    const store = item.store;
    const sales = item.value_sold || item.total;
    acc[store] = (acc[store] || 0) + sales;
    return acc;
  }, {} as Record<string, number>);
  
  const topStore = Object.entries(storesSales)
    .sort(([,a], [,b]) => b - a)[0];

  const sessionsSales = data.reduce((acc, item) => {
    const session = item.session;
    const sales = item.value_sold || item.total;
    acc[session] = (acc[session] || 0) + sales;
    return acc;
  }, {} as Record<string, number>);
  
  const topSession = Object.entries(sessionsSales)
    .sort(([,a], [,b]) => b - a)[0];

  const metrics = [
    {
      title: "Vendas Totais",
      value: `R$ ${totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      trend: "+12%",
      trendUp: true,
      description: "faturamento total"
    },
    {
      title: "Quantidade Vendida",
      value: `${totalQuantity.toLocaleString('pt-BR')} un.`,
      icon: ShoppingBag,
      trend: "+8%",
      trendUp: true,
      description: "unidades vendidas"
    },
    {
      title: "Lucro Total",
      value: `R$ ${totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      trend: `${profitMargin.toFixed(1)}%`,
      trendUp: profitMargin > 0,
      description: "margem de lucro"
    },
    {
      title: "Produtos Únicos",
      value: uniqueProducts.toString(),
      icon: BarChart3,
      trend: topSession ? topSession[0].substring(0, 12) : "N/A",
      trendUp: true,
      description: "sessão líder"
    },
    {
      title: "Lojas Ativas",
      value: uniqueStores.toString(),
      icon: Users,
      trend: topStore ? topStore[0] : "N/A",
      trendUp: true,
      description: "loja líder"
    },
    {
      title: "Média por Loja",
      value: `R$ ${Math.round(averagePerStore).toLocaleString('pt-BR')}`,
      icon: TrendingUp,
      trend: `${uniqueGroups}`,
      trendUp: true,
      description: "grupos ativos"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
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