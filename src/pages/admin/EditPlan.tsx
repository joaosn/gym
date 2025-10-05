import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const EditPlan = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();

  // Mock data - in real app this would come from API
  const mockPlans = [
    {
      id: '1',
      name: 'Fit Basic',
      price: 89.90,
      subscribers: 45,
      status: 'active',
      benefits: ['Acesso à quadra', 'Vestiário', 'Suporte básico'],
      description: 'Plano básico para iniciantes'
    },
    {
      id: '2', 
      name: 'Fit Plus',
      price: 129.90,
      subscribers: 62,
      status: 'active',
      benefits: ['Acesso às quadras', 'Vestiário', 'Personal trainer 2x/mês', 'Suporte prioritário'],
      description: 'Plano intermediário com personal trainer'
    },
    {
      id: '3',
      name: 'Fit Premium',
      price: 199.90,
      subscribers: 28,
      status: 'active',
      benefits: ['Acesso total', 'Vestiário premium', 'Personal trainer ilimitado', 'Suporte 24/7', 'Aulas exclusivas'],
      description: 'Plano premium com todos os benefícios'
    }
  ];

  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    status: true,
    benefits: [''],
    description: ''
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load plan data
    const plan = mockPlans.find(p => p.id === id);
    if (plan) {
      setFormData({
        name: plan.name,
        price: plan.price,
        status: plan.status === 'active',
        benefits: plan.benefits,
        description: plan.description
      });
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Plano atualizado!",
        description: "As alterações foram salvas com sucesso.",
      });
      
      navigate('/admin/planos');
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar as alterações.",
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
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }));
  };

  const updateBenefit = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.map((benefit, i) => i === index ? value : benefit)
    }));
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/admin/planos')}
          className="text-white hover:bg-dashboard-border mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Planos
        </Button>
        <h1 className="text-3xl font-bold text-white mb-2">Editar Plano</h1>
        <p className="text-white/80">Modificar informações do plano de assinatura</p>
      </div>

      <Card className="bg-dashboard-card border-dashboard-border max-w-2xl">
        <CardHeader>
          <CardTitle className="text-white">Informações do Plano</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">Nome do Plano</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-dashboard-bg border-dashboard-border text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price" className="text-white">Preço (R$)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                  className="bg-dashboard-bg border-dashboard-border text-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="bg-dashboard-bg border-dashboard-border text-white"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="status"
                checked={formData.status}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, status: checked }))}
              />
              <Label htmlFor="status" className="text-white">Plano ativo</Label>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-white">Benefícios</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addBenefit}
                  className="border-fitway-green text-fitway-green hover:bg-fitway-green hover:text-fitway-dark"
                >
                  Adicionar Benefício
                </Button>
              </div>
              
              <div className="space-y-3">
                {formData.benefits.map((benefit, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={benefit}
                      onChange={(e) => updateBenefit(index, e.target.value)}
                      className="bg-dashboard-bg border-dashboard-border text-white"
                      placeholder="Digite o benefício"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeBenefit(index)}
                      className="border-red-500 text-red-500 hover:bg-red-500/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <Button
                type="submit"
                variant="sport"
                disabled={loading}
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/planos')}
                className="border-dashboard-border text-white hover:bg-dashboard-border"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditPlan;