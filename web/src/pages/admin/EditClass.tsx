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

const EditClass = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();

  // Mock data
  const mockClasses = [
    {
      id: '1',
      name: 'Beach Tennis Iniciante',
      sport: 'beach-tennis',
      level: 'Iniciante',
      price: 80,
      instructor: 'João Silva',
      maxCapacity: 6,
      duration: 60,
      schedule: 'Terças e Quintas - 19:00',
      status: 'active',
      description: 'Aula para iniciantes no Beach Tennis'
    },
    {
      id: '2',
      name: 'FTV Avançado',
      sport: 'ftv',
      level: 'Avançado',  
      price: 100,
      instructor: 'Maria Santos',
      maxCapacity: 8,
      duration: 90,
      schedule: 'Segundas e Quartas - 20:00',
      status: 'active',
      description: 'Aula avançada de Futvôlei'
    }
  ];

  const [formData, setFormData] = useState({
    name: '',
    sport: '',
    level: '',
    price: 0,
    instructor: '',
    maxCapacity: 6,
    duration: 60,
    schedule: '',
    status: true,
    description: ''
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const classItem = mockClasses.find(c => c.id === id);
    if (classItem) {
      setFormData({
        name: classItem.name,
        sport: classItem.sport,
        level: classItem.level,
        price: classItem.price,
        instructor: classItem.instructor,
        maxCapacity: classItem.maxCapacity,
        duration: classItem.duration,
        schedule: classItem.schedule,
        status: classItem.status === 'active',
        description: classItem.description
      });
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Aula atualizada!",
        description: "As alterações foram salvas com sucesso.",
      });
      
      navigate('/admin/aulas');
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

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/admin/aulas')}
          className="text-white hover:bg-dashboard-border mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Aulas
        </Button>
        <h1 className="text-3xl font-bold text-white mb-2">Editar Aula</h1>
        <p className="text-white/80">Modificar informações da aula</p>
      </div>

      <Card className="bg-dashboard-card border-dashboard-border max-w-2xl">
        <CardHeader>
          <CardTitle className="text-white">Informações da Aula</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">Nome da Aula</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-dashboard-bg border-dashboard-border text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructor" className="text-white">Instrutor</Label>
                <Input
                  id="instructor"
                  value={formData.instructor}
                  onChange={(e) => setFormData(prev => ({ ...prev, instructor: e.target.value }))}
                  className="bg-dashboard-bg border-dashboard-border text-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label htmlFor="level" className="text-white">Nível</Label>
                <Select 
                  value={formData.level} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, level: value }))}
                >
                  <SelectTrigger className="bg-dashboard-bg border-dashboard-border text-white">
                    <SelectValue placeholder="Selecione o nível" />
                  </SelectTrigger>
                  <SelectContent className="bg-dashboard-card border-dashboard-border">
                    <SelectItem value="Iniciante" className="text-white">Iniciante</SelectItem>
                    <SelectItem value="Intermediário" className="text-white">Intermediário</SelectItem>
                    <SelectItem value="Avançado" className="text-white">Avançado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

              <div className="space-y-2">
                <Label htmlFor="maxCapacity" className="text-white">Capacidade Máxima</Label>
                <Input
                  id="maxCapacity"
                  type="number"
                  value={formData.maxCapacity}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxCapacity: parseInt(e.target.value) }))}
                  className="bg-dashboard-bg border-dashboard-border text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration" className="text-white">Duração (min)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  className="bg-dashboard-bg border-dashboard-border text-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="schedule" className="text-white">Horário</Label>
              <Input
                id="schedule"
                value={formData.schedule}
                onChange={(e) => setFormData(prev => ({ ...prev, schedule: e.target.value }))}
                className="bg-dashboard-bg border-dashboard-border text-white"
                placeholder="Ex: Terças e Quintas - 19:00"
                required
              />
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
              <Label htmlFor="status" className="text-white">Aula ativa</Label>
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
                onClick={() => navigate('/admin/aulas')}
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

export default EditClass;