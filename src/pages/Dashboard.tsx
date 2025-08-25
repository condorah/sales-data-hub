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
import { CustomPieChart } from "@/components/dashboard/PieChart";
import { ABCAnalysis } from "@/components/dashboard/ABCAnalysis";
import { TopPerformers } from "@/components/dashboard/TopPerformers";
import { BarChart3, TrendingUp, Users, ShoppingBag, Plus, GitCompare } from "lucide-react";
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
          .select('*');

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
          console.log('Total dados carregados:', salesData.length);
          console.log('Lojas encontradas:', [...new Set(salesData.map(d => d.store))].sort());
          console.log('Dados por loja:', 
            [...new Set(salesData.map(d => d.store))].sort().map(store => 
              `${store}: ${salesData.filter(d => d.store === store).length} registros`
            )
          );
          console.log('Meses encontrados:', [...new Set(salesData.map(d => d.month))].sort());
          console.log('Anos encontrados:', [...new Set(salesData.map(d => d.year))].sort());
          setData(salesData);
          setFilteredData(salesData);
        }
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: "Erro ao carregar dados",
          description: "Erro interno do aplicativo",
          variant: "destructive"
        });
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
    <div className="min-h-screen bg-background">
      <div className="max-w-[2000px] mx-auto p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 lg:space-y-8 animate-fade-in">
        {/* Header */}
        <div className="bg-card border border-border rounded-lg p-4 sm:p-6 shadow-card animate-scale-in">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-foreground flex items-center gap-2 sm:gap-3">
                <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-primary flex-shrink-0" />
                <span className="truncate">Análise de curva ABC - Nilo Atacadista</span>
              </h1>
              <p className="text-muted-foreground mt-2 text-xs sm:text-sm lg:text-base">
                Monitore e analise suas vendas por sessão, grupo e período com dados em tempo real
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              <Button 
                variant={showComparison ? "default" : "outline"} 
                onClick={() => setShowComparison(!showComparison)}
                className="w-full sm:w-auto text-xs sm:text-sm"
                size="sm"
              >
                <GitCompare className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                {showComparison ? "Ocultar Comparação" : "Comparação Tripla"}
              </Button>
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="w-full sm:w-auto text-xs sm:text-sm"
                size="sm"
              >
                Limpar Filtros
              </Button>
              <Link to="/upload" className="w-full sm:w-auto">
                <Button className="w-full bg-gradient-primary hover:opacity-90 transition-all duration-300 text-xs sm:text-sm" size="sm">
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Adicionar Dados
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Filter Panel - Only show if not in comparison mode */}
        {!showComparison && (
          <div className="animate-slide-up">
            <FilterPanel 
              data={data}
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </div>
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
                    Buscando por: "{filters.product}" - {filteredData.length} produto{filteredData.length !== 1 ? 's' : ''} encontrado{filteredData.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                {[...new Set(filteredData.map(item => ({ 
                  code: item.product_code, 
                  description: item.product_description,
                  value: item.value_sold || 0,
                  quantity: item.quantity_sold || 0
                })).filter(p => p.code).map(p => JSON.stringify(p)))].slice(0, 10).map((productStr, index) => {
                  const product = JSON.parse(productStr);
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Badge variant="outline" className="text-xs shrink-0">{product.code}</Badge>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{product.description}</p>
                          <p className="text-xs text-muted-foreground">
                            Qtd: {product.quantity.toLocaleString('pt-BR')} | Valor: R$ {product.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {filteredData.length > 10 && (
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    ... e mais {filteredData.length - 10} produto{filteredData.length - 10 !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Metrics */}
        <div className="animate-slide-up">
          <DashboardMetrics data={filteredData} />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 animate-scale-in">
          <SalesChart data={filteredData} />
          <SessionsChart data={filteredData} />
        </div>

        {/* Pie Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 animate-fade-in">
          <CustomPieChart 
            data={filteredData} 
            title="Faturamento por Loja"
            dataKey="store"
            valueKey="value_sold"
            valueLabel="Faturamento"
          />
          <CustomPieChart 
            data={filteredData} 
            title="Lucro por Sessão"
            dataKey="session"
            valueKey="profit_value"
            valueLabel="Lucro"
          />
        </div>

        {/* Top Performers */}
        <div className="animate-slide-up">
          <TopPerformers data={filteredData} />
        </div>

        {/* ABC Analysis */}
        <div className="animate-fade-in">
          <ABCAnalysis data={filteredData} />
        </div>

        {/* Advanced Analytics */}
        <div className="animate-scale-in">
          <AdvancedAnalytics data={filteredData} />
        </div>

        {/* Recent Data Table */}
        <div className="animate-slide-up">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                Dados Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredData.length > 0 ? (
                <div className="overflow-x-auto">
                   <table className="w-full min-w-[900px]">
                     <thead>
                       <tr className="border-b border-border">
                         <th className="text-left py-2 sm:py-3 px-1 sm:px-2 lg:px-4 font-medium text-muted-foreground text-xs">Mês</th>
                         <th className="text-left py-2 sm:py-3 px-1 sm:px-2 lg:px-4 font-medium text-muted-foreground text-xs">Loja</th>
                         <th className="text-left py-2 sm:py-3 px-1 sm:px-2 lg:px-4 font-medium text-muted-foreground text-xs">Produto</th>
                         <th className="text-left py-2 sm:py-3 px-1 sm:px-2 lg:px-4 font-medium text-muted-foreground text-xs">Sessão</th>
                         <th className="text-center py-2 sm:py-3 px-1 sm:px-2 lg:px-4 font-medium text-muted-foreground text-xs">Qtd</th>
                         <th className="text-right py-2 sm:py-3 px-1 sm:px-2 lg:px-4 font-medium text-muted-foreground text-xs">Valor</th>
                         <th className="text-right py-2 sm:py-3 px-1 sm:px-2 lg:px-4 font-medium text-muted-foreground text-xs">Lucro</th>
                         <th className="text-center py-2 sm:py-3 px-1 sm:px-2 lg:px-4 font-medium text-muted-foreground text-xs">% Valor</th>
                         <th className="text-center py-2 sm:py-3 px-1 sm:px-2 lg:px-4 font-medium text-muted-foreground text-xs">% Lucro</th>
                       </tr>
                     </thead>
                     <tbody>
                       {filteredData.slice(0, 10).map((item) => (
                         <tr key={item.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                           <td className="py-2 sm:py-3 px-1 sm:px-2 lg:px-4 text-xs">{item.month}</td>
                           <td className="py-2 sm:py-3 px-1 sm:px-2 lg:px-4">
                             <Badge variant="secondary" className="text-xs">{item.store}</Badge>
                           </td>
                           <td className="py-2 sm:py-3 px-1 sm:px-2 lg:px-4">
                             <div className="max-w-[120px] sm:max-w-[200px] lg:max-w-xs">
                               <div className="font-medium text-xs truncate">{item.product_code}</div>
                               <div className="text-xs text-muted-foreground truncate">{item.product_description}</div>
                             </div>
                           </td>
                           <td className="py-2 sm:py-3 px-1 sm:px-2 lg:px-4">
                             <Badge variant="outline" className="text-xs">{item.session}</Badge>
                           </td>
                           <td className="py-2 sm:py-3 px-1 sm:px-2 lg:px-4 text-center text-xs">
                             {item.quantity_sold?.toLocaleString('pt-BR')}
                           </td>
                           <td className="py-2 sm:py-3 px-1 sm:px-2 lg:px-4 text-right font-semibold text-primary text-xs">
                             R$ {item.value_sold?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                           </td>
                           <td className="py-2 sm:py-3 px-1 sm:px-2 lg:px-4 text-right font-semibold text-success text-xs">
                             R$ {item.profit_value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                           </td>
                           <td className="py-2 sm:py-3 px-1 sm:px-2 lg:px-4 text-center text-xs">
                             {item.value_percentage?.toFixed(1)}%
                           </td>
                           <td className="py-2 sm:py-3 px-1 sm:px-2 lg:px-4 text-center text-xs">
                             {item.profit_percentage?.toFixed(1)}%
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <TrendingUp className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-muted-foreground mb-2">
                    Nenhum dado encontrado
                  </h3>
                  <p className="text-muted-foreground mb-4 text-sm">
                    Adicione alguns dados para visualizar suas análises aqui.
                  </p>
                  <Link to="/upload">
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Dados
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;