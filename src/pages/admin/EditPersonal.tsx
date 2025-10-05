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

const EditPersonal = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();

  // Mock data
  const mockPersonals = [
    {
      id: '1',
      name: 'João Silva',
      email: 'joao@fitway.com',
      phone: '(44) 99999-0001',
      specialties: ['Beach Tennis', 'FTV'],
      experience: '5 anos',
      hourlyRate: 80,
      status: 'active',
      bio: 'Personal especializado em Beach Tennis com certificação internacional'
    },
    {
      id: '2',
      name: 'Maria Santos',
      email: 'maria@fitway.com',
      phone: '(44) 99999-0002',
      specialties: ['Beach Tennis', 'Condicionamento Físico'],
      experience: '3 anos',
      hourlyRate: 70,
      status: 'active',
      bio: 'Focada em condicionamento físico e iniciação no Beach Tennis'
    }
  ];

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialties: [''],
    experience: '',
    hourlyRate: 0,
    status: true,
    bio: ''
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const personal = mockPersonals.find(p => p.id === id);
    if (personal) {
      setFormData({
        name: personal.name,
        email: personal.email,
        phone: personal.phone,
        specialties: personal.specialties,
        experience: personal.experience,
        hourlyRate: personal.hourlyRate,
        status: personal.status === 'active',
        bio: personal.bio
      });
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Personal atualizado!",
        description: "As alterações foram salvas com sucesso.",
      });
      
      navigate('/admin/personais');
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

  const addSpecialty = () => {
    setFormData(prev => ({
      ...prev,
      specialties: [...prev.specialties, '']
    }));
  };

  const removeSpecialty = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter((_, i) => i !== index)
    }));
  };

  const updateSpecialty = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.map((specialty, i) => i === index ? value : specialty)
    }));
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/admin/personais')}
          className="text-white hover:bg-dashboard-border mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Personal Trainers
        </Button>
        <h1 className="text-3xl font-bold text-white mb-2">Editar Personal Trainer</h1>
        <p className="text-white/80">Modificar informações do personal trainer</p>
      </div>

      <Card className="bg-dashboard-card border-dashboard-border max-w-2xl">
        <CardHeader>
          <CardTitle className="text-white">Informações do Personal</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">Nome Completo</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-dashboard-bg border-dashboard-border text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="bg-dashboard-bg border-dashboard-border text-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="bg-dashboard-bg border-dashboard-border text-white"
                  placeholder="(44) 99999-0000"
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
              <Label htmlFor="experience" className="text-white">Experiência</Label>
              <Input
                id="experience"
                value={formData.experience}
                onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                className="bg-dashboard-bg border-dashboard-border text-white"
                placeholder="Ex: 5 anos"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-white">Biografia</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                className="bg-dashboard-bg border-dashboard-border text-white"
                rows={3}
                placeholder="Descrição profissional, especialidades, certificações..."
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="status"
                checked={formData.status}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, status: checked }))}
              />
              <Label htmlFor="status" className="text-white">Personal ativo</Label>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-white">Especialidades</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSpecialty}
                  className="border-fitway-green text-fitway-green hover:bg-fitway-green hover:text-fitway-dark"
                >
                  Adicionar Especialidade
                </Button>
              </div>
              
              <div className="space-y-3">
                {formData.specialties.map((specialty, index) => (
                  <div key={index} className="flex gap-2">
                    <Select 
                      value={specialty} 
                      onValueChange={(value) => updateSpecialty(index, value)}
                    >
                      <SelectTrigger className="bg-dashboard-bg border-dashboard-border text-white">
                        <SelectValue placeholder="Selecione uma especialidade" />
                      </SelectTrigger>
                      <SelectContent className="bg-dashboard-card border-dashboard-border">
                        <SelectItem value="Beach Tennis" className="text-white">Beach Tennis</SelectItem>
                        <SelectItem value="FTV" className="text-white">FTV (Futvôlei)</SelectItem>
                        <SelectItem value="Condicionamento Físico" className="text-white">Condicionamento Físico</SelectItem>
                        <SelectItem value="Personal Training" className="text-white">Personal Training</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeSpecialty(index)}
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
                onClick={() => navigate('/admin/personais')}
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

export default EditPersonal;