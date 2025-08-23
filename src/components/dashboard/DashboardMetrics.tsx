import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Target, Trophy, BarChart3, Users, DollarSign, Package } from "lucide-react";
import type { DataRecord } from "@/pages/Dashboard";

interface DashboardMetricsProps {
  data: DataRecord[];
}

export const DashboardMetrics = ({ data }: DashboardMetricsProps) => {
  if (data.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="shadow-card animate-pulse">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-20"></div>
                  <div className="h-6 bg-muted rounded w-16"></div>
                </div>
                <div className="h-8 w-8 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Calculações principais
  const totalValue = data.reduce((sum, item) => sum + (item.value_sold || 0), 0);
  const totalProfit = data.reduce((sum, item) => sum + (item.profit_value || 0), 0);
  const totalQuantity = data.reduce((sum, item) => sum + (item.quantity_sold || 0), 0);
  const uniqueProducts = [...new Set(data.map(item => item.product_code))].filter(Boolean).length;
  const uniqueStores = [...new Set(data.map(item => item.store))].length;
  const uniqueSessions = [...new Set(data.map(item => item.session))].length;

  // Cálculo da margem de lucro
  const profitMargin = totalValue > 0 ? (totalProfit / totalValue) * 100 : 0;

  // Produto mais vendido por valor
  const productSales = data.reduce((acc, item) => {
    if (!item.product_code) return acc;
    const key = item.product_code;
    if (acc[key]) {
      acc[key].value += item.value_sold || 0;
      acc[key].quantity += item.quantity_sold || 0;
    } else {
      acc[key] = {
        code: item.product_code,
        description: item.product_description || 'N/A',
        value: item.value_sold || 0,
        quantity: item.quantity_sold || 0
      };
    }
    return acc;
  }, {} as Record<string, { code: string; description: string; value: number; quantity: number }>);

  const topProduct = Object.values(productSales).sort((a, b) => b.value - a.value)[0];

  // Loja com melhor performance
  const storePerformance = data.reduce((acc, item) => {
    const key = item.store;
    if (acc[key]) {
      acc[key] += item.value_sold || 0;
    } else {
      acc[key] = item.value_sold || 0;
    }
    return acc;
  }, {} as Record<string, number>);

  const topStore = Object.entries(storePerformance).sort(([,a], [,b]) => b - a)[0];

  const metrics = [
    {
      title: "Faturamento Total",
      value: `R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/20",
      description: `${data.length} registros`
    },
    {
      title: "Lucro Total", 
      value: `R$ ${totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: "text-success",
      bgColor: "bg-success/10", 
      borderColor: "border-success/20",
      description: `Margem: ${profitMargin.toFixed(1)}%`
    },
    {
      title: "Produtos Vendidos",
      value: totalQuantity.toLocaleString('pt-BR'),
      icon: Package,
      color: "text-warning",
      bgColor: "bg-warning/10",
      borderColor: "border-warning/20",
      description: `${uniqueProducts} produtos únicos`
    },
    {
      title: "Lojas Ativas",
      value: uniqueStores.toString(),
      icon: Users,
      color: "text-accent",
      bgColor: "bg-accent/10",
      borderColor: "border-accent/20",
      description: `${uniqueSessions} sessões`
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Main Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {metrics.map((metric, index) => (
          <Card key={metric.title} className={`shadow-card ${metric.bgColor} ${metric.borderColor} animate-scale-in`} style={{ animationDelay: `${index * 0.1}s` }}>
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className={`text-xs sm:text-sm font-medium ${metric.color}`}>{metric.title}</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground truncate">{metric.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
                </div>
                <metric.icon className={`h-6 w-6 sm:h-8 sm:w-8 ${metric.color} flex-shrink-0`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Top Product */}
        {topProduct && (
          <Card className="shadow-card bg-gradient-to-r from-primary/5 to-success/5 border-primary/20 animate-fade-in">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                Produto Destaque
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">{topProduct.code}</Badge>
                    <Badge className="text-xs bg-primary/20 text-primary">Top Vendas</Badge>
                  </div>
                  <p className="font-semibold text-sm sm:text-base truncate">{topProduct.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Faturamento</p>
                    <p className="font-bold text-primary text-sm sm:text-base">
                      R$ {topProduct.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Quantidade</p>
                    <p className="font-bold text-success text-sm sm:text-base">
                      {topProduct.quantity.toLocaleString('pt-BR')} un
                    </p>
                  </div>
                </div>
                <Progress value={(topProduct.value / totalValue) * 100} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {((topProduct.value / totalValue) * 100).toFixed(1)}% do faturamento total
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Store */}
        {topStore && (
          <Card className="shadow-card bg-gradient-to-r from-success/5 to-warning/5 border-success/20 animate-fade-in">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Target className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
                Loja Destaque
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="text-xs bg-success/20 text-success">Melhor Performance</Badge>
                  </div>
                  <p className="font-semibold text-lg sm:text-xl">{topStore[0]}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Faturamento</p>
                  <p className="font-bold text-success text-xl sm:text-2xl">
                    R$ {topStore[1].toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <Progress value={(topStore[1] / totalValue) * 100} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {((topStore[1] / totalValue) * 100).toFixed(1)}% do faturamento total
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};