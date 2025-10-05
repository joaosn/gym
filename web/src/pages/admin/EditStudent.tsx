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

const EditStudent = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();

  // Mock data
  const mockStudents = [
    {
      id: '1',
      name: 'João Silva',
      email: 'joao.silva@email.com',
      phone: '(44) 99999-1111',
      cpf: '123.456.789-00',
      birthDate: '1990-05-15',
      address: 'Rua das Flores, 123, Centro',
      plan: 'fit-plus',
      emergencyContact: 'Maria Silva - (44) 99999-0000',
      status: 'active',
      notes: 'Aluno dedicado, frequenta regularmente as aulas de Beach Tennis.'
    },
    {
      id: '2',
      name: 'Maria Santos',
      email: 'maria.santos@email.com',
      phone: '(44) 99999-2222',
      cpf: '987.654.321-00',
      birthDate: '1985-08-22',
      address: 'Av. Principal, 456, Jardim Alvorada',
      plan: 'fit-basic',
      emergencyContact: 'Pedro Santos - (44) 99999-1111',
      status: 'active',
      notes: 'Iniciante no FTV, muito empolgada com as aulas.'
    }
  ];

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    birthDate: '',
    address: '',
    plan: '',
    emergencyContact: '',
    status: true,
    notes: ''
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const student = mockStudents.find(s => s.id === id);
    if (student) {
      setFormData({
        name: student.name,
        email: student.email,
        phone: student.phone,
        cpf: student.cpf,
        birthDate: student.birthDate,
        address: student.address,
        plan: student.plan,
        emergencyContact: student.emergencyContact,
        status: student.status === 'active',
        notes: student.notes
      });
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Aluno atualizado!",
        description: "As alterações foram salvas com sucesso.",
      });
      
      navigate('/admin/alunos');
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
          onClick={() => navigate('/admin/alunos')}
          className="text-white hover:bg-dashboard-border mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Alunos
        </Button>
        <h1 className="text-3xl font-bold text-white mb-2">Editar Aluno</h1>
        <p className="text-white/80">Modificar informações do aluno</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card className="bg-dashboard-card border-dashboard-border">
            <CardHeader>
              <CardTitle className="text-white">Informações Pessoais</CardTitle>
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
                    <Label htmlFor="cpf" className="text-white">CPF</Label>
                    <Input
                      id="cpf"
                      value={formData.cpf}
                      onChange={(e) => setFormData(prev => ({ ...prev, cpf: e.target.value }))}
                      className="bg-dashboard-bg border-dashboard-border text-white"
                      placeholder="000.000.000-00"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthDate" className="text-white">Data de Nascimento</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                    className="bg-dashboard-bg border-dashboard-border text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-white">Endereço</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="bg-dashboard-bg border-dashboard-border text-white"
                    placeholder="Rua, número, bairro"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plan" className="text-white">Plano</Label>
                  <Select 
                    value={formData.plan} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, plan: value }))}
                  >
                    <SelectTrigger className="bg-dashboard-bg border-dashboard-border text-white">
                      <SelectValue placeholder="Selecione o plano" />
                    </SelectTrigger>
                    <SelectContent className="bg-dashboard-card border-dashboard-border">
                      <SelectItem value="fit-basic" className="text-white">Fit Basic - R$ 89,90</SelectItem>
                      <SelectItem value="fit-plus" className="text-white">Fit Plus - R$ 129,90</SelectItem>
                      <SelectItem value="fit-premium" className="text-white">Fit Premium - R$ 199,90</SelectItem>
                      <SelectItem value="fit-student" className="text-white">Fit Student - R$ 69,90</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContact" className="text-white">Contato de Emergência</Label>
                  <Input
                    id="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                    className="bg-dashboard-bg border-dashboard-border text-white"
                    placeholder="Nome - Telefone"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-white">Observações</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="bg-dashboard-bg border-dashboard-border text-white"
                    rows={3}
                    placeholder="Observações sobre o aluno..."
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="status"
                    checked={formData.status}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, status: checked }))}
                  />
                  <Label htmlFor="status" className="text-white">Aluno ativo</Label>
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
                    onClick={() => navigate('/admin/alunos')}
                    className="border-dashboard-border text-white hover:bg-dashboard-border"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="bg-dashboard-card border-dashboard-border">
            <CardHeader>
              <CardTitle className="text-white">Estatísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-sm">Total de reservas:</span>
                <span className="text-white font-medium">15</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-sm">Última reserva:</span>
                <span className="text-white font-medium">25/01/2024</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-sm">Frequência:</span>
                <span className="text-fitway-green font-medium">Alta</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dashboard-card border-dashboard-border">
            <CardHeader>
              <CardTitle className="text-white">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full border-fitway-green text-fitway-green hover:bg-fitway-green/10">
                Ver Reservas
              </Button>
              <Button variant="outline" className="w-full border-dashboard-border text-white hover:bg-dashboard-border">
                Histórico de Pagamentos
              </Button>
              <Button variant="outline" className="w-full border-dashboard-border text-white hover:bg-dashboard-border">
                Enviar Mensagem
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EditStudent;