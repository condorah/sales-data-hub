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
import { TripleComparison } from "@/components/dashboard/TripleComparison";
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
  product_code?: string;
  product_description?: string;
  quantity_sold?: number;
  value_sold?: number;
  profit_value?: number;
  quantity_percentage?: number;
  value_percentage?: number;
  profit_percentage?: number;
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
    store: "",
    product: ""
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
    if (filters.product) {
      filtered = filtered.filter(item => 
        item.product_code?.toLowerCase().includes(filters.product.toLowerCase()) ||
        item.product_description?.toLowerCase().includes(filters.product.toLowerCase())
      );
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
      store: "",
      product: ""
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
    <div className="min-h-screen bg-background p-3 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
              <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <span className="hidden sm:inline">Dashboard de Análise de Vendas</span>
              <span className="sm:hidden">Dashboard</span>
            </h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              Monitore e analise suas vendas por sessão, grupo e período
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button 
              variant={showComparison ? "default" : "outline"} 
              onClick={() => setShowComparison(!showComparison)}
            >
              <GitCompare className="h-4 w-4 mr-2" />
              {showComparison ? "Ocultar Comparação" : "Comparação Tripla"}
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
          <TripleComparison 
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
                  {key === "product" ? `Produto: ${value}` : `${key}: ${value}`}
                </Badge>
              )
            )}
          </div>
        )}

        {/* Product Results Summary */}
        {filters.product && filteredData.length > 0 && (
          <Card className="shadow-card bg-success/10 border-success/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-success/20 rounded-lg">
                  <ShoppingBag className="h-5 w-5 text-success" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-success">Produtos Encontrados</h3>
                  <p className="text-sm text-muted-foreground">
                    {filteredData.length} produto{filteredData.length !== 1 ? 's' : ''} encontrado{filteredData.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {[...new Set(filteredData.map(item => ({ 
                  code: item.product_code, 
                  description: item.product_description 
                })).filter(p => p.code).map(p => JSON.stringify(p)))].slice(0, 5).map((productStr, index) => {
                  const product = JSON.parse(productStr);
                  return (
                    <div key={index} className="flex items-center gap-2 p-2 bg-background rounded-md border border-border/50">
                      <Badge variant="outline" className="text-xs">{product.code}</Badge>
                      <span className="text-sm font-medium truncate">{product.description}</span>
                    </div>
                  );
                })}
                {filteredData.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center">
                    ... e mais {filteredData.length - 5} produto{filteredData.length - 5 !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
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
                 <table className="w-full min-w-[800px]">
                   <thead>
                     <tr className="border-b border-border">
                       <th className="text-left py-3 px-2 sm:px-4 font-medium text-muted-foreground text-xs sm:text-sm">Mês</th>
                       <th className="text-left py-3 px-2 sm:px-4 font-medium text-muted-foreground text-xs sm:text-sm">Loja</th>
                       <th className="text-left py-3 px-2 sm:px-4 font-medium text-muted-foreground text-xs sm:text-sm">Produto</th>
                       <th className="text-left py-3 px-2 sm:px-4 font-medium text-muted-foreground text-xs sm:text-sm">Sessão</th>
                       <th className="text-center py-3 px-2 sm:px-4 font-medium text-muted-foreground text-xs sm:text-sm">Qtd</th>
                       <th className="text-right py-3 px-2 sm:px-4 font-medium text-muted-foreground text-xs sm:text-sm">Valor</th>
                       <th className="text-right py-3 px-2 sm:px-4 font-medium text-muted-foreground text-xs sm:text-sm">Lucro</th>
                       <th className="text-center py-3 px-2 sm:px-4 font-medium text-muted-foreground text-xs sm:text-sm">% Valor</th>
                       <th className="text-center py-3 px-2 sm:px-4 font-medium text-muted-foreground text-xs sm:text-sm">% Lucro</th>
                     </tr>
                   </thead>
                   <tbody>
                     {filteredData.slice(0, 10).map((item) => (
                       <tr key={item.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                         <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm">{item.month}</td>
                         <td className="py-3 px-2 sm:px-4">
                           <Badge variant="secondary" className="text-xs">{item.store}</Badge>
                         </td>
                         <td className="py-3 px-2 sm:px-4">
                           <div className="max-w-[150px] sm:max-w-xs">
                             <div className="font-medium text-xs sm:text-sm truncate">{item.product_code}</div>
                             <div className="text-xs text-muted-foreground truncate">{item.product_description}</div>
                           </div>
                         </td>
                         <td className="py-3 px-2 sm:px-4">
                           <Badge variant="outline" className="text-xs">{item.session}</Badge>
                         </td>
                         <td className="py-3 px-2 sm:px-4 text-center text-xs sm:text-sm">
                           {item.quantity_sold?.toLocaleString('pt-BR')}
                         </td>
                         <td className="py-3 px-2 sm:px-4 text-right font-semibold text-primary text-xs sm:text-sm">
                           R$ {item.value_sold?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                         </td>
                         <td className="py-3 px-2 sm:px-4 text-right font-semibold text-success text-xs sm:text-sm">
                           R$ {item.profit_value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                         </td>
                         <td className="py-3 px-2 sm:px-4 text-center text-xs sm:text-sm">
                           {item.value_percentage?.toFixed(1)}%
                         </td>
                         <td className="py-3 px-2 sm:px-4 text-center text-xs sm:text-sm">
                           {item.profit_percentage?.toFixed(1)}%
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