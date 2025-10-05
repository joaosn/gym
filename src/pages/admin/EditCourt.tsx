import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const EditCourt = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();

  // Mock data
  const mockCourts = [
    {
      id: '1',
      name: 'Quadra Alecrim',
      location: 'Setor Alecrim - Quadra de Areia',
      hourlyRate: 40,
      sport: 'beach-tennis',
      status: 'active',
      features: ['Iluminação LED', 'Rede profissional', 'Areia premium'],
      description: 'Quadra principal com excelente iluminação'
    },
    {
      id: '2',
      name: 'Quadra Cotafacil',
      location: 'Setor Cotafacil - Quadra de Areia', 
      hourlyRate: 45,
      sport: 'ftv',
      status: 'active',
      features: ['Som ambiente', 'Vestiário próximo', 'Areia premium'],
      description: 'Quadra moderna com ótima localização'
    }
  ];

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    hourlyRate: 0,
    sport: '',
    status: true,
    features: [''],
    description: ''
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const court = mockCourts.find(c => c.id === id);
    if (court) {
      setFormData({
        name: court.name,
        location: court.location,
        hourlyRate: court.hourlyRate,
        sport: court.sport,
        status: court.status === 'active',
        features: court.features,
        description: court.description
      });
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Quadra atualizada!",
        description: "As alterações foram salvas com sucesso.",
      });
      
      navigate('/admin/quadras');
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

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => i === index ? value : feature)
    }));
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/admin/quadras')}
          className="text-white hover:bg-dashboard-border mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Quadras
        </Button>
        <h1 className="text-3xl font-bold text-white mb-2">Editar Quadra</h1>
        <p className="text-white/80">Modificar informações da quadra</p>
      </div>

      <Card className="bg-dashboard-card border-dashboard-border max-w-2xl">
        <CardHeader>
          <CardTitle className="text-white">Informações da Quadra</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">Nome da Quadra</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-dashboard-bg border-dashboard-border text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hourlyRate" className="text-white">Valor por Hora (R$)</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  step="0.01"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: parseFloat(e.target.value) }))}
                  className="bg-dashboard-bg border-dashboard-border text-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-white">Localização</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="bg-dashboard-bg border-dashboard-border text-white"
                placeholder="Ex: Setor Centro - Quadra de Areia"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sport" className="text-white">Modalidade</Label>
              <Select 
                value={formData.sport} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, sport: value }))}
              >
                <SelectTrigger className="bg-dashboard-bg border-dashboard-border text-white">
                  <SelectValue placeholder="Selecione a modalidade" />
                </SelectTrigger>
                <SelectContent className="bg-dashboard-card border-dashboard-border">
                  <SelectItem value="beach-tennis" className="text-white">Beach Tennis</SelectItem>
                  <SelectItem value="ftv" className="text-white">FTV (Futvôlei)</SelectItem>
                </SelectContent>
              </Select>
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
              <Label htmlFor="status" className="text-white">Quadra ativa</Label>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-white">Características</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addFeature}
                  className="border-fitway-green text-fitway-green hover:bg-fitway-green hover:text-fitway-dark"
                >
                  Adicionar Característica
                </Button>
              </div>
              
              <div className="space-y-3">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      className="bg-dashboard-bg border-dashboard-border text-white"
                      placeholder="Digite a característica"
                    />
                    <Button
                      type="button"
                      variant="outline"  
                      size="sm"
                      onClick={() => removeFeature(index)}
                      className="border-red-500 text-red-500 hover:bg-red-500/10"
                    >
                      Remover
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
                onClick={() => navigate('/admin/quadras')}
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

export default EditCourt;