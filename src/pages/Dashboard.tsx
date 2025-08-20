import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { SessionsChart } from "@/components/dashboard/SessionsChart";
import { FilterPanel } from "@/components/dashboard/FilterPanel";
import { PeriodComparison } from "@/components/dashboard/PeriodComparison";
import { AdvancedAnalytics } from "@/components/dashboard/AdvancedAnalytics";
import { BarChart3, TrendingUp, Users, ShoppingBag, Plus, Trash2, GitCompare } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export interface DataRecord {
  id: string;
  month: string;
  year: string;
  session: string;
  group: string;
  subgroup: string;
  store: string;
  total: number;
  date: string;
}

const Dashboard = () => {
  const [data, setData] = useState<DataRecord[]>([]);
  const [filteredData, setFilteredData] = useState<DataRecord[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [filters, setFilters] = useState({
    month: "",
    session: "",
    group: "",
    subgroup: "",
    store: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: salesData, error } = await supabase
          .from('sales_data')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching data:', error);
          toast({
            title: "Erro ao carregar dados",
            description: "Não foi possível carregar os dados do servidor",
            variant: "destructive"
          });
          return;
        }

        if (salesData) {
          setData(salesData);
          setFilteredData(salesData);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchData();
  }, [toast]);

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
    if (filters.store) {
      filtered = filtered.filter(item => item.store === filters.store);
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
      subgroup: "",
      store: ""
    });
  };

  const clearAllData = async () => {
    try {
      const { error } = await supabase
        .from('sales_data')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

      if (error) {
        throw error;
      }

      setData([]);
      setFilteredData([]);
      toast({
        title: "Dados removidos",
        description: "Todos os dados foram removidos com sucesso",
      });
    } catch (error) {
      console.error('Error clearing data:', error);
      toast({
        title: "Erro ao remover dados",
        description: "Não foi possível remover os dados do servidor",
        variant: "destructive"
      });
    }
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
            <Button 
              variant={showComparison ? "default" : "outline"} 
              onClick={() => setShowComparison(!showComparison)}
            >
              <GitCompare className="h-4 w-4 mr-2" />
              {showComparison ? "Ocultar Comparação" : "Comparar Períodos"}
            </Button>
            <Button variant="outline" onClick={clearFilters}>
              Limpar Filtros
            </Button>
            <Button variant="destructive" onClick={clearAllData}>
              <Trash2 className="h-4 w-4 mr-2" />
              Zerar Dados
            </Button>
            <Link to="/upload">
              <Button className="bg-gradient-primary hover:opacity-90 transition-all duration-300">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Dados
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter Panel - Only show if not in comparison mode */}
        {!showComparison && (
          <FilterPanel 
            data={data}
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        )}

        {/* Period Comparison */}
        {showComparison && (
          <PeriodComparison 
            data={data}
            onClose={() => setShowComparison(false)}
          />
        )}

        {/* Regular Dashboard Content - Only show if not in comparison mode */}
        {!showComparison && (
          <>
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

        {/* Advanced Analytics */}
        <AdvancedAnalytics data={filteredData} />

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
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Loja</th>
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
                          <Badge variant="secondary">{item.store}</Badge>
                        </td>
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
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;