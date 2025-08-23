import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Activity, BarChart3, PieChart as PieChartIcon, Filter, Target, TrendingUp, Award, AlertTriangle, Calendar, Zap } from "lucide-react";
import type { DataRecord } from "@/pages/Dashboard";

interface AdvancedAnalyticsProps {
  data: DataRecord[];
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

export const AdvancedAnalytics = ({ data }: AdvancedAnalyticsProps) => {
  const [barChartFilter, setBarChartFilter] = useState<string>("store");
  const [pieChartFilter, setPieChartFilter] = useState<string>("session");
  
  if (data.length === 0) return null;

  // Bar Chart Data
  const getBarChartData = () => {
    const grouped = data.reduce((acc, item) => {
      const key = item[barChartFilter as keyof DataRecord] as string;
      const existing = acc.find(d => d.name === key);
      if (existing) {
        existing.faturamento += item.value_sold || 0;
        existing.lucro += item.profit_value || 0;
        existing.quantidade += item.quantity_sold || 0;
      } else {
        acc.push({ 
          name: key, 
          faturamento: item.value_sold || 0,
          lucro: item.profit_value || 0,
          quantidade: item.quantity_sold || 0
        });
      }
      return acc;
    }, [] as { name: string; faturamento: number; lucro: number; quantidade: number }[]);

    return grouped.sort((a, b) => b.faturamento - a.faturamento);
  };

  // Pie Chart Data
  const getPieChartData = () => {
    const grouped = data.reduce((acc, item) => {
      const key = item[pieChartFilter as keyof DataRecord] as string;
      const existing = acc.find(d => d.name === key);
      if (existing) {
        existing.value += item.value_sold || 0;
      } else {
        acc.push({ 
          name: key, 
          value: item.value_sold || 0
        });
      }
      return acc;
    }, [] as { name: string; value: number }[]);

    return grouped.sort((a, b) => b.value - a.value);
  };

  const barChartData = getBarChartData();
  const pieChartData = getPieChartData();

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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.dataKey === 'faturamento' && `Faturamento: R$ ${entry.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              {entry.dataKey === 'lucro' && `Lucro: R$ ${entry.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{payload[0].payload.name}</p>
          <p className="text-primary">
            Faturamento: R$ {payload[0].value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderPieLabel = (entry: any) => {
    const percent = ((entry.value / pieChartData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1);
    return `${percent}%`;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-card bg-primary/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary">Total de Lojas</p>
                <p className="text-2xl font-bold">{[...new Set(data.map(item => item.store))].length}</p>
              </div>
              <Activity className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-success/10 border-success/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-success">Total de Sessões</p>
                <p className="text-2xl font-bold">{[...new Set(data.map(item => item.session))].length}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-warning/10 border-warning/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-warning">Total de Produtos</p>
                <p className="text-2xl font-bold">{[...new Set(data.map(item => item.product_code))].filter(Boolean).length}</p>
              </div>
              <PieChartIcon className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart with Filters */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Análise Comparativa
              </CardTitle>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={barChartFilter} onValueChange={setBarChartFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="store">Loja</SelectItem>
                    <SelectItem value="session">Sessão</SelectItem>
                    <SelectItem value="group">Grupo</SelectItem>
                    <SelectItem value="subgroup">Subgrupo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="faturamento" fill="hsl(var(--primary))" name="Faturamento" />
                  <Bar dataKey="lucro" fill="hsl(var(--success))" name="Lucro" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart with Filters */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-primary" />
                Distribuição de Faturamento
              </CardTitle>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={pieChartFilter} onValueChange={setPieChartFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="store">Loja</SelectItem>
                    <SelectItem value="session">Sessão</SelectItem>
                    <SelectItem value="group">Grupo</SelectItem>
                    <SelectItem value="subgroup">Subgrupo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderPieLabel}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
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
      </div>

      {/* Traditional Analytics */}
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
    </div>
  );
};