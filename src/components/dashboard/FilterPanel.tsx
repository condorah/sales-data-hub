import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";
import type { DataRecord } from "@/pages/Dashboard";

interface FilterPanelProps {
  data: DataRecord[];
  filters: {
    month: string;
    session: string;
    group: string;
    subgroup: string;
    store: string;
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
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          Filtros
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Month Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Mês</label>
            <Select 
              value={filters.month || "todos"} 
              onValueChange={(value) => onFilterChange("month", value)}
            >
              <SelectTrigger>
                <SelectValue />
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
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Sessão</label>
            <Select 
              value={filters.session || "todos"} 
              onValueChange={(value) => onFilterChange("session", value)}
            >
              <SelectTrigger>
                <SelectValue />
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
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Grupo</label>
            <Select 
              value={filters.group || "todos"} 
              onValueChange={(value) => onFilterChange("group", value)}
            >
              <SelectTrigger>
                <SelectValue />
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
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Subgrupo</label>
            <Select 
              value={filters.subgroup || "todos"} 
              onValueChange={(value) => onFilterChange("subgroup", value)}
            >
              <SelectTrigger>
                <SelectValue />
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
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Loja</label>
            <Select 
              value={filters.store || "todos"} 
              onValueChange={(value) => onFilterChange("store", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas as lojas</SelectItem>
                {uniqueStores.map((store) => (
                  <SelectItem key={store} value={store}>{store}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};