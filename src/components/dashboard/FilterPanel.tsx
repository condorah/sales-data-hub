import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Filter, Search } from "lucide-react";
import type { DataRecord } from "@/pages/Dashboard";

interface FilterPanelProps {
  data: DataRecord[];
  filters: {
    month: string;
    session: string;
    group: string;
    subgroup: string;
    store: string;
    product: string;
  };
  onFilterChange: (key: string, value: string) => void;
}

export const FilterPanel = ({ data, filters, onFilterChange }: FilterPanelProps) => {
  const uniqueMonths = [...new Set(data.map(item => item.month))];
  const uniqueSessions = [...new Set(data.map(item => item.session))];
  const uniqueGroups = [...new Set(data.map(item => item.group))];
  const uniqueSubgroups = [...new Set(data.map(item => item.subgroup))];
  const uniqueStores = [...new Set(data.map(item => item.store))];

  return (
    <Card className="shadow-card bg-gradient-to-r from-primary/5 to-success/5 border-primary/20">
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          Filtros de Análise
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
          {/* Month Filter */}
          <div className="space-y-1 sm:space-y-2">
            <Label htmlFor="month-filter" className="text-xs sm:text-sm font-medium">Mês</Label>
            <Select value={filters.month || "todos"} onValueChange={(value) => onFilterChange("month", value)}>
              <SelectTrigger id="month-filter" className="h-8 sm:h-10 text-xs sm:text-sm">
                <SelectValue placeholder="Todos os meses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os meses</SelectItem>
                {uniqueMonths.map((month) => (
                  <SelectItem key={month} value={month}>{month}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Session Filter */}
          <div className="space-y-1 sm:space-y-2">
            <Label htmlFor="session-filter" className="text-xs sm:text-sm font-medium">Sessão</Label>
            <Select value={filters.session || "todos"} onValueChange={(value) => onFilterChange("session", value)}>
              <SelectTrigger id="session-filter" className="h-8 sm:h-10 text-xs sm:text-sm">
                <SelectValue placeholder="Todas as sessões" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas as sessões</SelectItem>
                {uniqueSessions.map((session) => (
                  <SelectItem key={session} value={session}>{session}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Group Filter */}
          <div className="space-y-1 sm:space-y-2">
            <Label htmlFor="group-filter" className="text-xs sm:text-sm font-medium">Grupo</Label>
            <Select value={filters.group || "todos"} onValueChange={(value) => onFilterChange("group", value)}>
              <SelectTrigger id="group-filter" className="h-8 sm:h-10 text-xs sm:text-sm">
                <SelectValue placeholder="Todos os grupos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os grupos</SelectItem>
                {uniqueGroups.map((group) => (
                  <SelectItem key={group} value={group}>{group}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subgroup Filter */}
          <div className="space-y-1 sm:space-y-2">
            <Label htmlFor="subgroup-filter" className="text-xs sm:text-sm font-medium">Subgrupo</Label>
            <Select value={filters.subgroup || "todos"} onValueChange={(value) => onFilterChange("subgroup", value)}>
              <SelectTrigger id="subgroup-filter" className="h-8 sm:h-10 text-xs sm:text-sm">
                <SelectValue placeholder="Todos os subgrupos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os subgrupos</SelectItem>
                {uniqueSubgroups.map((subgroup) => (
                  <SelectItem key={subgroup} value={subgroup}>{subgroup}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Store Filter */}
          <div className="space-y-1 sm:space-y-2">
            <Label htmlFor="store-filter" className="text-xs sm:text-sm font-medium">Loja</Label>
            <Select value={filters.store || "todos"} onValueChange={(value) => onFilterChange("store", value)}>
              <SelectTrigger id="store-filter" className="h-8 sm:h-10 text-xs sm:text-sm">
                <SelectValue placeholder="Todas as lojas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas as lojas</SelectItem>
                {uniqueStores.map((store) => (
                  <SelectItem key={store} value={store}>{store}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Product Search */}
          <div className="space-y-1 sm:space-y-2">
            <Label htmlFor="product-filter" className="text-xs sm:text-sm font-medium">Produto</Label>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              <Input
                id="product-filter"
                type="text"
                placeholder="Buscar produto..."
                value={filters.product}
                onChange={(e) => onFilterChange("product", e.target.value)}
                className="pl-7 sm:pl-10 h-8 sm:h-10 text-xs sm:text-sm"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};