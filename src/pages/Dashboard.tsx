import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { SessionsChart } from "@/components/dashboard/SessionsChart";
import { FilterPanel } from "@/components/dashboard/FilterPanel";
import { BarChart3, TrendingUp, Users, ShoppingBag, Plus } from "lucide-react";
import { Link } from "react-router-dom";

export interface DataRecord {
  id: string;
  month: string;
  session: string;
  group: string;
  subgroup: string;
  total: number;
  date: string;
}

const Dashboard = () => {
  const [data, setData] = useState<DataRecord[]>([]);
  const [filteredData, setFilteredData] = useState<DataRecord[]>([]);
  const [filters, setFilters] = useState({
    month: "",
    session: "",
    group: "",
    subgroup: ""
  });

  useEffect(() => {
    const storedData = localStorage.getItem("dashboardData");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setData(parsedData);
      setFilteredData(parsedData);
    }
  }, []);

  useEffect(() => {
    let filtered = [...data];
    
    if (filters.month) {
      filtered = filtered.filter(item => item.month === filters.month);
    }
    if (filters.session) {
      filtered = filtered.filter(item => item.session === filters.session);
    }
    if (filters.group) {
      filtered = filtered.filter(item => item.group === filters.group);
    }
    if (filters.subgroup) {
      filtered = filtered.filter(item => item.subgroup === filters.subgroup);
    }

    setFilteredData(filtered);
  }, [filters, data]);

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === "todos" ? "" : value
    }));
  };

  const clearFilters = () => {
    setFilters({
      month: "",
      session: "",
      group: "",
      subgroup: ""
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-primary" />
              Dashboard de Análise de Vendas
            </h1>
            <p className="text-muted-foreground mt-2">
              Monitore e analise suas vendas por sessão, grupo e período
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={clearFilters}>
              Limpar Filtros
            </Button>
            <Link to="/upload">
              <Button className="bg-gradient-primary hover:opacity-90 transition-all duration-300">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Dados
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter Panel */}
        <FilterPanel 
          data={data}
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        {/* Active Filters */}
        {Object.entries(filters).some(([_, value]) => value !== "") && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">Filtros ativos:</span>
            {Object.entries(filters).map(([key, value]) => 
              value && (
                <Badge key={key} variant="secondary" className="px-3 py-1">
                  {key}: {value}
                </Badge>
              )
            )}
          </div>
        )}

        {/* Metrics */}
        <DashboardMetrics data={filteredData} />

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SalesChart data={filteredData} />
          <SessionsChart data={filteredData} />
        </div>

        {/* Recent Data Table */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              Dados Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Mês</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Sessão</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Grupo</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Subgrupo</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.slice(0, 10).map((item) => (
                      <tr key={item.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4">{item.month}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{item.session}</Badge>
                        </td>
                        <td className="py-3 px-4">{item.group}</td>
                        <td className="py-3 px-4">{item.subgroup}</td>
                        <td className="py-3 px-4 text-right font-semibold text-primary">
                          {item.total.toLocaleString('pt-BR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  Nenhum dado encontrado
                </h3>
                <p className="text-muted-foreground mb-4">
                  Adicione alguns dados para visualizar suas análises aqui.
                </p>
                <Link to="/upload">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Dados
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;