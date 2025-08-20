import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, Award, AlertTriangle, Calendar, Zap } from "lucide-react";
import type { DataRecord } from "@/pages/Dashboard";

interface AdvancedAnalyticsProps {
  data: DataRecord[];
}

export const AdvancedAnalytics = ({ data }: AdvancedAnalyticsProps) => {
  if (data.length === 0) return null;

  // Performance por loja
  const storePerformance = data.reduce((acc, item) => {
    if (!acc[item.store]) {
      acc[item.store] = { total: 0, count: 0, sessions: new Set() };
    }
    acc[item.store].total += item.total;
    acc[item.store].count += 1;
    acc[item.store].sessions.add(item.session);
    return acc;
  }, {} as Record<string, { total: number; count: number; sessions: Set<string> }>);

  const maxStoreTotal = Math.max(...Object.values(storePerformance).map(s => s.total));
  
  // Performance por sessão
  const sessionPerformance = data.reduce((acc, item) => {
    if (!acc[item.session]) {
      acc[item.session] = { total: 0, count: 0, stores: new Set() };
    }
    acc[item.session].total += item.total;
    acc[item.session].count += 1;
    acc[item.session].stores.add(item.store);
    return acc;
  }, {} as Record<string, { total: number; count: number; stores: Set<string> }>);

  const topSessions = Object.entries(sessionPerformance)
    .sort(([,a], [,b]) => b.total - a.total)
    .slice(0, 5);

  // Análise temporal (se tiver múltiplos meses)
  const monthlyData = data.reduce((acc, item) => {
    const key = `${item.month} ${item.year}`;
    if (!acc[key]) {
      acc[key] = { total: 0, count: 0 };
    }
    acc[key].total += item.total;
    acc[key].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  const months = Object.keys(monthlyData).sort();
  const growthTrend = months.length > 1 ? 
    ((monthlyData[months[months.length - 1]]?.total || 0) - (monthlyData[months[0]]?.total || 0)) / (monthlyData[months[0]]?.total || 1) * 100 : 0;

  // Diversificação de grupos
  const groupDiversity = data.reduce((acc, item) => {
    acc[item.group] = (acc[item.group] || 0) + item.total;
    return acc;
  }, {} as Record<string, number>);

  const totalSales = data.reduce((sum, item) => sum + item.total, 0);
  const diversityScore = Object.keys(groupDiversity).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Performance por Loja */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Performance por Loja
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(storePerformance)
            .sort(([,a], [,b]) => b.total - a.total)
            .slice(0, 6)
            .map(([store, perf]) => (
              <div key={store} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm">{store}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {perf.sessions.size} sessões
                    </Badge>
                    <span className="text-sm font-semibold text-primary">
                      {perf.total.toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
                <Progress 
                  value={(perf.total / maxStoreTotal) * 100} 
                  className="h-2"
                />
              </div>
            ))}
        </CardContent>
      </Card>

      {/* Top Sessões */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Top 5 Sessões
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {topSessions.map(([session, perf], index) => (
            <div key={session} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0 ? 'bg-gradient-primary text-white' : 
                  index === 1 ? 'bg-secondary text-secondary-foreground' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium text-sm">{session}</div>
                  <div className="text-xs text-muted-foreground">
                    {perf.stores.size} lojas ativas
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-primary">
                  {perf.total.toLocaleString('pt-BR')}
                </div>
                <div className="text-xs text-muted-foreground">
                  {((perf.total / totalSales) * 100).toFixed(1)}% do total
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Análise de Tendências */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Análise de Tendências
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
            <div>
              <div className="font-medium">Crescimento Geral</div>
              <div className="text-sm text-muted-foreground">
                {months.length > 1 ? `${months[0]} vs ${months[months.length - 1]}` : 'Período atual'}
              </div>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${growthTrend >= 0 ? 'text-success' : 'text-destructive'}`}>
                {growthTrend >= 0 ? '+' : ''}{growthTrend.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">variação</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <Calendar className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="font-semibold">{months.length}</div>
              <div className="text-xs text-muted-foreground">Períodos</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <Zap className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="font-semibold">{diversityScore}</div>
              <div className="text-xs text-muted-foreground">Grupos</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Diversificação de Grupos */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Diversificação de Grupos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(groupDiversity)
            .sort(([,a], [,b]) => b - a)
            .map(([group, total]) => {
              const percentage = (total / totalSales) * 100;
              return (
                <div key={group} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">{group}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {percentage.toFixed(1)}%
                      </span>
                      <span className="text-sm font-semibold text-primary">
                        {total.toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          
          <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-border">
            <div className="text-sm text-muted-foreground">
              <strong>Análise:</strong> {diversityScore > 3 ? 
                'Boa diversificação de grupos, distribuindo riscos.' : 
                'Considere expandir para mais grupos para reduzir riscos.'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};