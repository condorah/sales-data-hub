import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ComparisonMetrics } from "./ComparisonMetrics";
import { ComparisonChart } from "./ComparisonChart";
import { GitCompare, X } from "lucide-react";
import type { DataRecord } from "@/pages/Dashboard";

interface PeriodComparisonProps {
  data: DataRecord[];
  onClose: () => void;
}

export const PeriodComparison = ({ data, onClose }: PeriodComparisonProps) => {
  const [period1, setPeriod1] = useState("");
  const [period2, setPeriod2] = useState("");

  const uniqueMonths = [...new Set(data.map(item => item.month).filter(Boolean))];
  
  const period1Data = data.filter(item => item.month === period1);
  const period2Data = data.filter(item => item.month === period2);

  const canCompare = period1 && period2 && period1 !== period2;

  return (
    <div className="space-y-6">
      {/* Comparison Header */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <GitCompare className="h-5 w-5 text-primary" />
              Comparação de Períodos
            </CardTitle>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Período 1</label>
              <Select value={period1} onValueChange={setPeriod1}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o primeiro período" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueMonths.map((month) => (
                    <SelectItem key={month} value={month}>{month}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Período 2</label>
              <Select value={period2} onValueChange={setPeriod2}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o segundo período" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueMonths.map((month) => (
                    <SelectItem key={month} value={month}>{month}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {period1 && period2 && (
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-primary/10">
                {period1}: {period1Data.length} registros
              </Badge>
              <Badge variant="outline" className="bg-accent/10">
                {period2}: {period2Data.length} registros
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comparison Results */}
      {canCompare && (
        <>
          <ComparisonMetrics 
            period1Data={period1Data}
            period2Data={period2Data}
            period1Name={period1}
            period2Name={period2}
          />
          
          <ComparisonChart 
            period1Data={period1Data}
            period2Data={period2Data}
            period1Name={period1}
            period2Name={period2}
          />
        </>
      )}

      {!canCompare && period1 && period2 && period1 === period2 && (
        <Card className="shadow-card">
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              Por favor, selecione dois períodos diferentes para comparar.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};