import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, X } from 'lucide-react';

const AddClass = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    sport: '',
    level: '',
    duration: '',
    maxCapacity: '',
    description: '',
    requirements: '',
    instructorId: '',
    courtId: '',
    dayOfWeek: '',
    startTime: '',
    price: '',
    status: true
  });

  const sportOptions = [
    'Tênis',
    'Padel',
    'Beach Tennis',
    'Futsal',
    'Vôlei',
    'Basquete',
    'Squash',
    'Musculação',
    'Pilates',
    'Yoga'
  ];

  const levelOptions = [
    'Iniciante',
    'Intermediário',
    'Avançado',
    'Todos os níveis'
  ];

  const dayOptions = [
    { value: 'monday', label: 'Segunda-feira' },
    { value: 'tuesday', label: 'Terça-feira' },
    { value: 'wednesday', label: 'Quarta-feira' },
    { value: 'thursday', label: 'Quinta-feira' },
    { value: 'friday', label: 'Sexta-feira' },
    { value: 'saturday', label: 'Sábado' },
    { value: 'sunday', label: 'Domingo' }
  ];

  const mockInstructors = [
    { id: '1', name: 'Carlos Silva - Tênis' },
    { id: '2', name: 'Maria Santos - Pilates' },
    { id: '3', name: 'João Oliveira - Futsal' }
  ];

  const mockCourts = [
    { id: '1', name: 'Quadra Central 1' },
    { id: '2', name: 'Quadra Central 2' },
    { id: '3', name: 'Sala de Pilates' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Aula criada!",
        description: "A aula foi criada com sucesso.",
      });
      
      navigate('/admin/aulas');
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao criar a aula.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/admin/aulas')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Aulas
        </Button>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Nova Aula</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Aula *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Tênis para Iniciantes"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sport">Modalidade *</Label>
                  <Select value={formData.sport} onValueChange={(value) => setFormData(prev => ({ ...prev, sport: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a modalidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {sportOptions.map((sport) => (
                        <SelectItem key={sport} value={sport}>
                          {sport}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">Nível *</Label>
                  <Select value={formData.level} onValueChange={(value) => setFormData(prev => ({ ...prev, level: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o nível" />
                    </SelectTrigger>
                    <SelectContent>
                      {levelOptions.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duração (minutos) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="60"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxCapacity">Capacidade Máxima *</Label>
                  <Input
                    id="maxCapacity"
                    type="number"
                    value={formData.maxCapacity}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxCapacity: e.target.value }))}
                    placeholder="10"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Preço (R$)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="30.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructorId">Instrutor *</Label>
                  <Select value={formData.instructorId} onValueChange={(value) => setFormData(prev => ({ ...prev, instructorId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o instrutor" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockInstructors.map((instructor) => (
                        <SelectItem key={instructor.id} value={instructor.id}>
                          {instructor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="courtId">Local *</Label>
                  <Select value={formData.courtId} onValueChange={(value) => setFormData(prev => ({ ...prev, courtId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o local" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockCourts.map((court) => (
                        <SelectItem key={court.id} value={court.id}>
                          {court.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dayOfWeek">Dia da Semana *</Label>
                  <Select value={formData.dayOfWeek} onValueChange={(value) => setFormData(prev => ({ ...prev, dayOfWeek: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o dia" />
                    </SelectTrigger>
                    <SelectContent>
                      {dayOptions.map((day) => (
                        <SelectItem key={day.value} value={day.value}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startTime">Horário de Início *</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva o conteúdo e objetivos da aula"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">Requisitos</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                  placeholder="Equipamentos necessários, experiência prévia, etc."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="status"
                  checked={formData.status}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, status: checked }))}
                />
                <Label htmlFor="status">Aula ativa</Label>
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin/aulas')}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Criando...' : 'Criar Aula'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddClass;