import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, TrendingUp } from "lucide-react";
import type { DataRecord } from "@/pages/Dashboard";

interface TopPerformersProps {
  data: DataRecord[];
}

export const TopPerformers = ({ data }: TopPerformersProps) => {
  // Top stores by revenue
  const storeRevenue = data.reduce((acc, item) => {
    const existing = acc.find(d => d.name === item.store);
    if (existing) {
      existing.value += item.value_sold || 0;
      existing.profit += item.profit_value || 0;
    } else {
      acc.push({ 
        name: item.store, 
        value: item.value_sold || 0,
        profit: item.profit_value || 0
      });
    }
    return acc;
  }, [] as { name: string; value: number; profit: number }[]);

  // Top sessions by revenue
  const sessionRevenue = data.reduce((acc, item) => {
    const existing = acc.find(d => d.name === item.session);
    if (existing) {
      existing.value += item.value_sold || 0;
      existing.profit += item.profit_value || 0;
    } else {
      acc.push({ 
        name: item.session, 
        value: item.value_sold || 0,
        profit: item.profit_value || 0
      });
    }
    return acc;
  }, [] as { name: string; value: number; profit: number }[]);

  // Top products by revenue
  const productRevenue = data.reduce((acc, item) => {
    if (!item.product_code) return acc;
    const existing = acc.find(d => d.code === item.product_code);
    if (existing) {
      existing.value += item.value_sold || 0;
      existing.profit += item.profit_value || 0;
      existing.quantity += item.quantity_sold || 0;
    } else {
      acc.push({ 
        code: item.product_code,
        description: item.product_description || 'N/A',
        value: item.value_sold || 0,
        profit: item.profit_value || 0,
        quantity: item.quantity_sold || 0
      });
    }
    return acc;
  }, [] as { code: string; description: string; value: number; profit: number; quantity: number }[]);

  const topStores = storeRevenue.sort((a, b) => b.value - a.value).slice(0, 5);
  const topSessions = sessionRevenue.sort((a, b) => b.value - a.value).slice(0, 5);
  const topProducts = productRevenue.sort((a, b) => b.value - a.value).slice(0, 5);

  const getRankBadge = (index: number) => {
    const colors = [
      'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black',
      'bg-gradient-to-r from-gray-300 to-gray-500 text-black',
      'bg-gradient-to-r from-amber-600 to-amber-800 text-white',
      'bg-primary text-primary-foreground',
      'bg-secondary text-secondary-foreground'
    ];
    return colors[index] || 'bg-muted text-muted-foreground';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Top Stores */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Top 5 Lojas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {topStores.map((store, index) => (
            <div key={store.name} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Badge className={getRankBadge(index)}>
                  #{index + 1}
                </Badge>
                <div>
                  <p className="font-medium">{store.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Lucro: R$ {store.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-primary">
                  R$ {store.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Top Sessions */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Top 5 Sessões
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {topSessions.map((session, index) => (
            <div key={session.name} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Badge className={getRankBadge(index)}>
                  #{index + 1}
                </Badge>
                <div>
                  <p className="font-medium">{session.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Lucro: R$ {session.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-primary">
                  R$ {session.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Top Products */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Top 5 Produtos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {topProducts.map((product, index) => (
            <div key={product.code} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Badge className={getRankBadge(index)}>
                  #{index + 1}
                </Badge>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{product.code}</p>
                  <p className="text-xs text-muted-foreground truncate">{product.description}</p>
                  <p className="text-xs text-muted-foreground">
                    Qtd: {product.quantity.toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-primary text-sm">
                  R$ {product.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};