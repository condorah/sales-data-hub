import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Package, DollarSign } from "lucide-react";
import type { DataRecord } from "@/pages/Dashboard";

interface ABCAnalysisProps {
  data: DataRecord[];
}

interface ProductAnalysis {
  product_code: string;
  product_description: string;
  total_value: number;
  total_quantity: number;
  percentage_value: number;
  cumulative_percentage: number;
  category: 'A' | 'B' | 'C';
}

export const ABCAnalysis = ({ data }: ABCAnalysisProps) => {
  // Group products by code and calculate totals
  const productTotals = data.reduce((acc, item) => {
    if (!item.product_code) return acc;
    
    const key = item.product_code;
    if (acc[key]) {
      acc[key].total_value += item.value_sold || 0;
      acc[key].total_quantity += item.quantity_sold || 0;
    } else {
      acc[key] = {
        product_code: item.product_code,
        product_description: item.product_description || 'N/A',
        total_value: item.value_sold || 0,
        total_quantity: item.quantity_sold || 0,
      };
    }
    return acc;
  }, {} as Record<string, Omit<ProductAnalysis, 'percentage_value' | 'cumulative_percentage' | 'category'>>);

  // Calculate percentages and ABC classification
  const totalValue = Object.values(productTotals).reduce((sum, product) => sum + product.total_value, 0);
  
  const productsWithAnalysis: ProductAnalysis[] = Object.values(productTotals)
    .map(product => ({
      ...product,
      percentage_value: (product.total_value / totalValue) * 100,
      cumulative_percentage: 0,
      category: 'C' as const,
    }))
    .sort((a, b) => b.total_value - a.total_value);

  // Calculate cumulative percentages and assign ABC categories
  let cumulativeSum = 0;
  productsWithAnalysis.forEach((product, index) => {
    cumulativeSum += product.percentage_value;
    product.cumulative_percentage = cumulativeSum;
    
    if (cumulativeSum <= 80) {
      product.category = 'A';
    } else if (cumulativeSum <= 95) {
      product.category = 'B';
    } else {
      product.category = 'C';
    }
  });

  // Calculate category summaries
  const categoryStats = {
    A: { count: 0, value: 0, percentage: 0 },
    B: { count: 0, value: 0, percentage: 0 },
    C: { count: 0, value: 0, percentage: 0 },
  };

  productsWithAnalysis.forEach(product => {
    categoryStats[product.category].count++;
    categoryStats[product.category].value += product.total_value;
  });

  Object.keys(categoryStats).forEach(key => {
    const cat = key as 'A' | 'B' | 'C';
    categoryStats[cat].percentage = (categoryStats[cat].value / totalValue) * 100;
  });

  const getCategoryColor = (category: 'A' | 'B' | 'C') => {
    switch (category) {
      case 'A': return 'bg-success text-success-foreground';
      case 'B': return 'bg-warning text-warning-foreground';
      case 'C': return 'bg-muted text-muted-foreground';
    }
  };

  const getCategoryDescription = (category: 'A' | 'B' | 'C') => {
    switch (category) {
      case 'A': return 'Alto valor - 80% do faturamento';
      case 'B': return 'Médio valor - 15% do faturamento';
      case 'C': return 'Baixo valor - 5% do faturamento';
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(['A', 'B', 'C'] as const).map(category => (
          <Card key={category} className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getCategoryColor(category)}>
                      Categoria {category}
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold">
                    {categoryStats[category].count}
                  </p>
                  <p className="text-sm text-muted-foreground">produtos</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-primary">
                    {categoryStats[category].percentage.toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    R$ {categoryStats[category].value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              <Progress 
                value={categoryStats[category].percentage} 
                className="mt-3"
              />
              <p className="text-xs text-muted-foreground mt-2">
                {getCategoryDescription(category)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top Products Table */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Análise ABC - Top 20 Produtos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground text-sm">#</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground text-sm">Produto</th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground text-sm">Valor</th>
                  <th className="text-center py-3 px-2 font-medium text-muted-foreground text-sm">% Individual</th>
                  <th className="text-center py-3 px-2 font-medium text-muted-foreground text-sm">% Acumulado</th>
                  <th className="text-center py-3 px-2 font-medium text-muted-foreground text-sm">Categoria</th>
                </tr>
              </thead>
              <tbody>
                {productsWithAnalysis.slice(0, 20).map((product, index) => (
                  <tr key={product.product_code} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-2 text-sm font-medium">{index + 1}</td>
                    <td className="py-3 px-2">
                      <div className="max-w-[200px]">
                        <div className="font-medium text-sm truncate">{product.product_code}</div>
                        <div className="text-xs text-muted-foreground truncate">{product.product_description}</div>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-right font-semibold text-primary text-sm">
                      R$ {product.total_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-2 text-center text-sm">
                      {product.percentage_value.toFixed(2)}%
                    </td>
                    <td className="py-3 px-2 text-center text-sm">
                      {product.cumulative_percentage.toFixed(2)}%
                    </td>
                    <td className="py-3 px-2 text-center">
                      <Badge className={getCategoryColor(product.category)} variant="secondary">
                        {product.category}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};