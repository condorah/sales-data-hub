import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GitCompare, X } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import type { DataRecord } from "@/pages/Dashboard";

interface TripleComparisonProps {
  data: DataRecord[];
  onClose: () => void;
}

export const TripleComparison = ({ data, onClose }: TripleComparisonProps) => {
  const [comparisonType, setComparisonType] = useState("month");
  const [period1, setPeriod1] = useState("");
  const [period2, setPeriod2] = useState("");
  const [period3, setPeriod3] = useState("");

  // Get unique values based on comparison type
  const getUniqueValues = () => {
    switch (comparisonType) {
      case "month": return [...new Set(data.map(item => item.month))];
      case "session": return [...new Set(data.map(item => item.session))];
      case "group": return [...new Set(data.map(item => item.group))];
      case "subgroup": return [...new Set(data.map(item => item.subgroup))];
      case "store": return [...new Set(data.map(item => item.store))];
      case "product": return [...new Set(data.map(item => item.product_code).filter(Boolean))];
      default: return [];
    }
  };

  // Filter data based on comparison type and value
  const filterData = (value: string) => {
    return data.filter(item => {
      switch (comparisonType) {
        case "month": return item.month === value;
        case "session": return item.session === value;
        case "group": return item.group === value;
        case "subgroup": return item.subgroup === value;
        case "store": return item.store === value;
        case "product": return item.product_code === value;
        default: return false;
      }
    });
  };

  const uniqueValues = getUniqueValues();
  const period1Data = filterData(period1);
  const period2Data = filterData(period2);
  const period3Data = filterData(period3);

  const canCompare = period1 && period2 && period3 && 
    new Set([period1, period2, period3]).size === 3;

  // Prepare chart data
  const prepareChartData = () => {
    if (!canCompare) return [];

    const sessions = [...new Set([
      ...period1Data.map(item => item.session),
      ...period2Data.map(item => item.session),
      ...period3Data.map(item => item.session)
    ])];

    return sessions.map(session => {
      const p1Total = period1Data
        .filter(item => item.session === session)
        .reduce((sum, item) => sum + (item.value_sold || 0), 0);
      
      const p2Total = period2Data
        .filter(item => item.session === session)
        .reduce((sum, item) => sum + (item.value_sold || 0), 0);

      const p3Total = period3Data
        .filter(item => item.session === session)
        .reduce((sum, item) => sum + (item.value_sold || 0), 0);

      return {
        session,
        [period1]: p1Total,
        [period2]: p2Total,
        [period3]: p3Total
      };
    });
  };

  const chartData = prepareChartData();

  // Calculate totals for metrics
  const calculateMetrics = (data: DataRecord[]) => ({
    totalValue: data.reduce((sum, item) => sum + (item.value_sold || 0), 0),
    totalQuantity: data.reduce((sum, item) => sum + (item.quantity_sold || 0), 0),
    totalProfit: data.reduce((sum, item) => sum + (item.profit_value || 0), 0),
    recordCount: data.length
  });

  const metrics1 = calculateMetrics(period1Data);
  const metrics2 = calculateMetrics(period2Data);
  const metrics3 = calculateMetrics(period3Data);

  return (
    <div className="space-y-6">
      {/* Comparison Header */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <GitCompare className="h-5 w-5 text-primary" />
              Comparação Tripla
            </CardTitle>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Tipo de Comparação</label>
              <Select value={comparisonType} onValueChange={setComparisonType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Por Mês</SelectItem>
                  <SelectItem value="session">Por Sessão</SelectItem>
                  <SelectItem value="group">Por Grupo</SelectItem>
                  <SelectItem value="subgroup">Por Subgrupo</SelectItem>
                  <SelectItem value="store">Por Loja</SelectItem>
                  <SelectItem value="product">Por Produto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">1º {comparisonType === 'month' ? 'Período' : comparisonType === 'product' ? 'Produto' : 'Item'}</label>
              <Select value={period1} onValueChange={setPeriod1}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {uniqueValues.map((value) => (
                    <SelectItem key={value} value={value}>{value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">2º {comparisonType === 'month' ? 'Período' : comparisonType === 'product' ? 'Produto' : 'Item'}</label>
              <Select value={period2} onValueChange={setPeriod2}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {uniqueValues.map((value) => (
                    <SelectItem key={value} value={value}>{value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">3º {comparisonType === 'month' ? 'Período' : comparisonType === 'product' ? 'Produto' : 'Item'}</label>
              <Select value={period3} onValueChange={setPeriod3}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {uniqueValues.map((value) => (
                    <SelectItem key={value} value={value}>{value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {canCompare && (
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-primary/10">
                {period1}: {period1Data.length} registros
              </Badge>
              <Badge variant="outline" className="bg-accent/10">
                {period2}: {period2Data.length} registros
              </Badge>
              <Badge variant="outline" className="bg-success/10">
                {period3}: {period3Data.length} registros
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comparison Metrics */}
      {canCompare && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">{period1}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold text-primary">
                  R$ {metrics1.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Quantidade Total</p>
                <p className="text-xl font-semibold">
                  {metrics1.totalQuantity.toLocaleString('pt-BR')} un.
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Lucro Total</p>
                <p className="text-xl font-semibold text-success">
                  R$ {metrics1.totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">{period2}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold text-primary">
                  R$ {metrics2.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Quantidade Total</p>
                <p className="text-xl font-semibold">
                  {metrics2.totalQuantity.toLocaleString('pt-BR')} un.
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Lucro Total</p>
                <p className="text-xl font-semibold text-success">
                  R$ {metrics2.totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">{period3}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold text-primary">
                  R$ {metrics3.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Quantidade Total</p>
                <p className="text-xl font-semibold">
                  {metrics3.totalQuantity.toLocaleString('pt-BR')} un.
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Lucro Total</p>
                <p className="text-xl font-semibold text-success">
                  R$ {metrics3.totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Comparison Chart */}
      {canCompare && chartData.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Comparação por Sessão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="session" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [
                      `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                      'Valor'
                    ]}
                  />
                  <Legend />
                  <Bar dataKey={period1} fill="hsl(var(--primary))" name={period1} />
                  <Bar dataKey={period2} fill="hsl(var(--accent))" name={period2} />
                  <Bar dataKey={period3} fill="hsl(var(--success))" name={period3} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {!canCompare && period1 && period2 && period3 && (
        <Card className="shadow-card">
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              Por favor, selecione três valores diferentes para comparar.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};