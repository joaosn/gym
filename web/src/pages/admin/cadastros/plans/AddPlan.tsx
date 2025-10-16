import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, X, Plus, Trash2 } from 'lucide-react';

const AddPlan = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    benefits: [''],
    futureBookingsLimit: '',
    includedClasses: '',
    validityDays: '',
    status: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Plano criado!",
        description: "O plano foi criado com sucesso.",
      });
      
      navigate('/admin/planos');
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao criar o plano.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addBenefit = () => {
    setFormData(prev => ({
      ...prev,
      benefits: [...prev.benefits, '']
    }));
  };

  const removeBenefit = (index: number) => {
    if (formData.benefits.length > 1) {
      setFormData(prev => ({
        ...prev,
        benefits: prev.benefits.filter((_, i) => i !== index)
      }));
    }
  };

  const updateBenefit = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.map((benefit, i) => i === index ? value : benefit)
    }));
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/admin/planos')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Planos
        </Button>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Novo Plano</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Plano *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Fit Premium"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Preço Mensal (R$) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="149.90"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="futureBookingsLimit">Limite de Reservas Futuras</Label>
                  <Input
                    id="futureBookingsLimit"
                    type="number"
                    value={formData.futureBookingsLimit}
                    onChange={(e) => setFormData(prev => ({ ...prev, futureBookingsLimit: e.target.value }))}
                    placeholder="4 (use -1 para ilimitado)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="includedClasses">Aulas Incluídas por Mês</Label>
                  <Input
                    id="includedClasses"
                    type="number"
                    value={formData.includedClasses}
                    onChange={(e) => setFormData(prev => ({ ...prev, includedClasses: e.target.value }))}
                    placeholder="8 (use -1 para ilimitado)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="validityDays">Validade (dias)</Label>
                  <Input
                    id="validityDays"
                    type="number"
                    value={formData.validityDays}
                    onChange={(e) => setFormData(prev => ({ ...prev, validityDays: e.target.value }))}
                    placeholder="30"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva os principais benefícios e características do plano"
                  rows={4}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Benefícios do Plano *</Label>
                  <Button type="button" size="sm" onClick={addBenefit}>
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.benefits.map((benefit, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={benefit}
                        onChange={(e) => updateBenefit(index, e.target.value)}
                        placeholder="Ex: Reservas ilimitadas, Acesso prioritário, Desconto em personal"
                        required
                      />
                      {formData.benefits.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeBenefit(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="status"
                  checked={formData.status}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, status: checked }))}
                />
                <Label htmlFor="status">Plano ativo</Label>
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin/planos')}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Criando...' : 'Criar Plano'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddPlan;