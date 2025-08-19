import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileSpreadsheet, ArrowLeft, Check } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const DataUpload = () => {
  const [formData, setFormData] = useState({
    month: "",
    session: "",
    group: "",
    subgroup: ""
  });
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const sessions = [
    "Eletrodomésticos", "Moda e Acessórios", "Casa e Decoração", 
    "Informática", "Livros e Papelaria", "Esporte e Lazer",
    "Beleza e Saúde", "Automotivo"
  ];

  const groups = ["Premium", "Standard", "Básico", "Promocional"];
  const subgroups = ["A", "B", "C", "D"];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === "application/vnd.ms-excel" || 
          selectedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
          selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        setFile(selectedFile);
      } else {
        toast({
          title: "Arquivo inválido",
          description: "Por favor, selecione um arquivo Excel (.xlsx ou .xls)",
          variant: "destructive"
        });
      }
    }
  };

  const processExcelData = () => {
    // Simular processamento do Excel - em produção usaria uma biblioteca como xlsx
    // Por agora, vamos gerar dados aleatórios para demonstração
    const columnAValues = Array.from({ length: 50 }, () => Math.floor(Math.random() * 1000) + 100);
    const total = columnAValues.reduce((sum, value) => sum + value, 0);
    return total;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.month || !formData.session || !formData.group || !formData.subgroup || !file) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos e selecione um arquivo",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Simular processamento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const total = processExcelData();
      
      const newRecord = {
        id: crypto.randomUUID(),
        month: formData.month,
        session: formData.session,
        group: formData.group,
        subgroup: formData.subgroup,
        total,
        date: new Date().toISOString()
      };

      // Salvar no localStorage (em produção seria uma API)
      const existingData = JSON.parse(localStorage.getItem("dashboardData") || "[]");
      const updatedData = [...existingData, newRecord];
      localStorage.setItem("dashboardData", JSON.stringify(updatedData));

      toast({
        title: "Dados enviados com sucesso!",
        description: `Total processado: ${total.toLocaleString('pt-BR')} unidades`,
      });

      // Reset form
      setFormData({ month: "", session: "", group: "", subgroup: "" });
      setFile(null);
      
      // Redirect to dashboard
      setTimeout(() => {
        navigate("/");
      }, 1500);

    } catch (error) {
      toast({
        title: "Erro ao processar dados",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Upload className="h-8 w-8 text-primary" />
              Upload de Dados
            </h1>
            <p className="text-muted-foreground mt-2">
              Adicione novos dados de vendas ao dashboard
            </p>
          </div>
        </div>

        {/* Upload Form */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              Informações dos Dados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Month Selection */}
              <div className="space-y-2">
                <Label htmlFor="month">Mês de Referência</Label>
                <Select value={formData.month} onValueChange={(value) => handleInputChange("month", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o mês" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month} value={month}>{month}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Session Selection */}
              <div className="space-y-2">
                <Label htmlFor="session">Sessão</Label>
                <Select value={formData.session} onValueChange={(value) => handleInputChange("session", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a sessão" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessions.map((session) => (
                      <SelectItem key={session} value={session}>{session}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Group and Subgroup */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="group">Grupo</Label>
                  <Select value={formData.group} onValueChange={(value) => handleInputChange("group", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o grupo" />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.map((group) => (
                        <SelectItem key={group} value={group}>{group}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subgroup">Subgrupo</Label>
                  <Select value={formData.subgroup} onValueChange={(value) => handleInputChange("subgroup", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o subgrupo" />
                    </SelectTrigger>
                    <SelectContent>
                      {subgroups.map((subgroup) => (
                        <SelectItem key={subgroup} value={subgroup}>{subgroup}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="file">Arquivo Excel</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    id="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="file" className="cursor-pointer">
                    {file ? (
                      <div className="flex flex-col items-center gap-2">
                        <Check className="h-8 w-8 text-success" />
                        <span className="text-foreground font-medium">{file.name}</span>
                        <span className="text-muted-foreground text-sm">Arquivo selecionado</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
                        <span className="text-foreground font-medium">Clique para selecionar</span>
                        <span className="text-muted-foreground text-sm">Formatos aceitos: .xlsx, .xls</span>
                      </div>
                    )}
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Os dados devem estar na coluna A do arquivo Excel. Apenas valores numéricos serão somados.
                </p>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-gradient-primary hover:opacity-90 transition-all duration-300"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Enviar Dados
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DataUpload;