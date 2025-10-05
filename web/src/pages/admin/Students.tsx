import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Users,
  User,
  Calendar,
  Activity,
  Clock,
  Star,
  DollarSign
} from 'lucide-react';

const AdminStudents = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleDelete = async (studentId: string, studentName: string) => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: "Aluno removido!",
        description: `${studentName} foi removido com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao remover o aluno.",
        variant: "destructive",
      });
    }
  };

  // Mock data - would come from API
  const students = [
    {
      id: '1',
      name: 'João Silva',
      email: 'joao.silva@email.com',
      phone: '(44) 99999-1111',
      plan: 'Fit Plus',
      planPrice: 129.90,
      registrationDate: '2024-01-15',
      lastAccess: '2024-01-25',
      totalBookings: 15,
      status: 'active',
      avatar: null
    },
    {
      id: '2',
      name: 'Maria Santos',
      email: 'maria.santos@email.com',
      phone: '(44) 99999-2222',
      plan: 'Fit Basic',
      planPrice: 89.90,
      registrationDate: '2024-01-10',
      lastAccess: '2024-01-26',
      totalBookings: 8,
      status: 'active',
      avatar: null
    },
    {
      id: '3',
      name: 'Pedro Oliveira',
      email: 'pedro.oliveira@email.com',
      phone: '(44) 99999-3333',
      plan: 'Fit Premium',
      planPrice: 199.90,
      registrationDate: '2024-01-20',
      lastAccess: '2024-01-26',
      totalBookings: 25,
      status: 'active',
      avatar: null
    },
    {
      id: '4',
      name: 'Ana Costa',
      email: 'ana.costa@email.com',
      phone: '(44) 99999-4444',
      plan: 'Fit Basic',
      planPrice: 89.90,
      registrationDate: '2023-12-05',
      lastAccess: '2024-01-20',
      totalBookings: 45,
      status: 'inactive',
      avatar: null
    },
    {
      id: '5',
      name: 'Carlos Lima',
      email: 'carlos.lima@email.com',
      phone: '(44) 99999-5555',
      plan: 'Fit Student',
      planPrice: 69.90,
      registrationDate: '2024-01-25',
      lastAccess: '2024-01-26',
      totalBookings: 3,
      status: 'active',
      avatar: null
    }
  ];

  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.status === 'active').length;
  const totalRevenue = students.reduce((sum, s) => sum + s.planPrice, 0);
  const avgBookings = students.reduce((sum, s) => sum + s.totalBookings, 0) / students.length;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Gestão de Alunos</h1>
          <p className="text-white/80">Gerencie os alunos matriculados no FITWAY</p>
        </div>
        <Button className="bg-fitway-green hover:bg-fitway-green/90 text-white" onClick={() => navigate('/admin/alunos/novo')}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Aluno
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <Card className="bg-dashboard-card border-dashboard-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-dashboard-fg">Total de Alunos</CardTitle>
            <Users className="h-4 w-4 text-fitway-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalStudents}</div>
            <p className="text-xs text-white/70">{activeStudents} ativos</p>
          </CardContent>
        </Card>

        <Card className="bg-dashboard-card border-dashboard-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-dashboard-fg">Receita Mensal</CardTitle>
            <DollarSign className="h-4 w-4 text-fitway-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-white/70">mensalidades</p>
          </CardContent>
        </Card>

        <Card className="bg-dashboard-card border-dashboard-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-dashboard-fg">Média de Reservas</CardTitle>
            <Activity className="h-4 w-4 text-fitway-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{Math.round(avgBookings)}</div>
            <p className="text-xs text-white/70">por aluno</p>
          </CardContent>
        </Card>

        <Card className="bg-dashboard-card border-dashboard-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-dashboard-fg">Novos Este Mês</CardTitle>
            <Star className="h-4 w-4 text-fitway-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">3</div>
            <p className="text-xs text-white/70">novos alunos</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-white/50" />
          <Input
            placeholder="Buscar alunos..."
            className="pl-10 bg-dashboard-card border-dashboard-border text-white placeholder:text-white/50"
          />
        </div>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
        {students.map((student) => (
          <Card key={student.id} className="bg-dashboard-card border-dashboard-border">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-fitway-green/20 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-fitway-green" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-lg">{student.name}</CardTitle>
                    <p className="text-white/60 text-sm">{student.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={student.status === 'active' ? 'default' : 'secondary'}
                    className={student.status === 'active' ? 'bg-fitway-green text-white' : ''}
                  >
                    {student.status === 'active' ? 'Ativo' : 'Inativo'}
                  </Badge>
                  <div className="flex gap-1">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-dashboard-border text-white hover:bg-dashboard-border h-8 w-8 p-0"
                      onClick={() => navigate(`/admin/alunos/editar/${student.id}`)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline" className="border-red-500 text-red-500 hover:bg-red-500/10 h-8 w-8 p-0">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-dashboard-card border-dashboard-border">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-white">Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription className="text-white/70">
                            Deseja realmente remover o aluno <span className="font-semibold text-white">{student.name}</span>? 
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-dashboard-border border-dashboard-border text-white hover:bg-dashboard-border/80">
                            Cancelar
                          </AlertDialogCancel>
                          <AlertDialogAction 
                            className="bg-red-500 hover:bg-red-600 text-white"
                            onClick={() => handleDelete(student.id, student.name)}
                          >
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-fitway-green/50 text-fitway-green">
                    {student.plan}
                  </Badge>
                  <span className="text-white font-bold">R$ {student.planPrice.toFixed(2)}/mês</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-white/70">Telefone:</span>
                    <p className="text-white font-medium">{student.phone}</p>
                  </div>
                  <div>
                    <span className="text-white/70">Reservas:</span>
                    <p className="text-white font-medium">{student.totalBookings}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-white/70">Cadastro:</span>
                    <p className="text-white font-medium">
                      {new Date(student.registrationDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <span className="text-white/70">Último acesso:</span>
                    <p className="text-white font-medium">
                      {new Date(student.lastAccess).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1 border-fitway-green text-fitway-green hover:bg-fitway-green/10">
                    <Calendar className="mr-2 h-4 w-4" />
                    Reservas
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 border-dashboard-border text-white hover:bg-dashboard-border">
                    <Activity className="mr-2 h-4 w-4" />
                    Histórico
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminStudents;