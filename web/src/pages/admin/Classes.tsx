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
  Calendar,
  Clock,
  BookOpen,
  User,
  Target
} from 'lucide-react';

const AdminClasses = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleDelete = async (classId: string, className: string) => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: "Aula removida!",
        description: `${className} foi removida com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao remover a aula.",
        variant: "destructive",
      });
    }
  };
  // Mock data - would come from API
  const classes = [
    {
      id: '1',
      name: 'Beach Tennis Iniciante',
      sport: 'Beach Tennis',
      level: 'iniciante',
      duration: 60,
      capacity: 8,
      enrolled: 6,
      price: 45.00,
      instructor: 'Prof. Carlos Silva',
      nextOccurrence: '2024-01-28 18:00',
      status: 'active'
    },
    {
      id: '2',
      name: 'FTV Avançado',
      sport: 'FTV',
      level: 'avancado',
      duration: 90,
      capacity: 12,
      enrolled: 12,
      price: 60.00,
      instructor: 'Prof. Ana Santos',
      nextOccurrence: '2024-01-29 19:00',
      status: 'active'
    },
    {
      id: '3',
      name: 'Tênis Kids',
      sport: 'Tênis',
      level: 'kids',
      duration: 45,
      capacity: 6,
      enrolled: 4,
      price: 35.00,
      instructor: 'Prof. João Mendes',
      nextOccurrence: '2024-01-30 16:00',
      status: 'active'
    },
    {
      id: '4',
      name: 'Beach Tennis Avançado',
      sport: 'Beach Tennis',
      level: 'avancado',
      duration: 75,
      capacity: 10,
      enrolled: 8,
      price: 55.00,
      instructor: 'Prof. Maria Costa',
      nextOccurrence: '2024-01-31 20:00',
      status: 'active'
    },
    {
      id: '5',
      name: 'FTV Iniciante',
      sport: 'FTV',
      level: 'iniciante',
      duration: 60,
      capacity: 10,
      enrolled: 0,
      price: 40.00,
      instructor: 'Prof. Pedro Oliveira',
      nextOccurrence: null,
      status: 'inactive'
    }
  ];

  const totalClasses = classes.length;
  const activeClasses = classes.filter(c => c.status === 'active').length;
  const totalEnrolled = classes.reduce((sum, c) => sum + c.enrolled, 0);
  const avgOccupancy = classes.filter(c => c.status === 'active').reduce((sum, c) => sum + (c.enrolled / c.capacity * 100), 0) / activeClasses;

  return (
    <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Gestão de Aulas</h1>
            <p className="text-white/80">Gerencie as aulas esportivas do FITWAY</p>
          </div>
          <Button className="bg-fitway-green hover:bg-fitway-green/90 text-white" onClick={() => navigate('/admin/aulas/novo')}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Aula
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-dashboard-card border-dashboard-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-dashboard-fg">Total de Aulas</CardTitle>
              <BookOpen className="h-4 w-4 text-fitway-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalClasses}</div>
              <p className="text-xs text-white/70">{activeClasses} ativas</p>
            </CardContent>
          </Card>

          <Card className="bg-dashboard-card border-dashboard-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-dashboard-fg">Alunos Inscritos</CardTitle>
              <Users className="h-4 w-4 text-fitway-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalEnrolled}</div>
              <p className="text-xs text-white/70">total de inscrições</p>
            </CardContent>
          </Card>

          <Card className="bg-dashboard-card border-dashboard-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-dashboard-fg">Taxa de Ocupação</CardTitle>
              <Target className="h-4 w-4 text-fitway-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{Math.round(avgOccupancy)}%</div>
              <p className="text-xs text-white/70">média das aulas</p>
            </CardContent>
          </Card>

          <Card className="bg-dashboard-card border-dashboard-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-dashboard-fg">Próxima Aula</CardTitle>
              <Clock className="h-4 w-4 text-fitway-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">18:00</div>
              <p className="text-xs text-white/70">Beach Tennis</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-white/50" />
            <Input
              placeholder="Buscar aulas..."
              className="pl-10 bg-dashboard-card border-dashboard-border text-white placeholder:text-white/50"
            />
          </div>
          <Button variant="outline" className="border-dashboard-border text-white hover:bg-dashboard-border">
            Filtros
          </Button>
        </div>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {classes.map((classItem) => (
            <Card key={classItem.id} className="bg-dashboard-card border-dashboard-border">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-white text-lg">{classItem.name}</CardTitle>
                    <p className="text-white/60 mt-1 text-sm">{classItem.sport}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={classItem.status === 'active' ? 'default' : 'secondary'}
                      className={classItem.status === 'active' ? 'bg-fitway-green text-white' : ''}
                    >
                      {classItem.status === 'active' ? 'Ativa' : 'Inativa'}
                    </Badge>
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-dashboard-border text-white hover:bg-dashboard-border h-8 w-8 p-0"
                        onClick={() => navigate(`/admin/aulas/editar/${classItem.id}`)}
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
                              Deseja realmente remover a aula <span className="font-semibold text-white">{classItem.name}</span>? 
                              Esta ação não pode ser desfeita e afetará todos os alunos inscritos.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-dashboard-border border-dashboard-border text-white hover:bg-dashboard-border/80">
                              Cancelar
                            </AlertDialogCancel>
                            <AlertDialogAction 
                              className="bg-red-500 hover:bg-red-600 text-white"
                              onClick={() => handleDelete(classItem.id, classItem.name)}
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
                    <Badge variant="outline" className="border-fitway-green/50 text-fitway-green capitalize">
                      {classItem.level}
                    </Badge>
                    <span className="text-white font-bold">R$ {classItem.price.toFixed(2)}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-white/70">Duração:</span>
                      <p className="text-white font-medium">{classItem.duration}min</p>
                    </div>
                    <div>
                      <span className="text-white/70">Capacidade:</span>
                      <p className="text-white font-medium">{classItem.capacity} alunos</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white/70 text-sm">Inscritos:</span>
                      <span className="text-white text-sm">{classItem.enrolled}/{classItem.capacity}</span>
                    </div>
                    <div className="w-full bg-dashboard-bg rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          classItem.enrolled === classItem.capacity ? 'bg-red-500' : 'bg-fitway-green'
                        }`}
                        style={{ width: `${(classItem.enrolled / classItem.capacity) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <span className="text-white/70 text-sm">Instrutor:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <User className="h-4 w-4 text-fitway-green" />
                      <span className="text-white">{classItem.instructor}</span>
                    </div>
                  </div>

                  {classItem.nextOccurrence && (
                    <div>
                      <span className="text-white/70 text-sm">Próxima aula:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4 text-fitway-green" />
                        <span className="text-white">
                          {new Date(classItem.nextOccurrence).toLocaleDateString('pt-BR')} às{' '}
                          {new Date(classItem.nextOccurrence).toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1 border-fitway-green text-fitway-green hover:bg-fitway-green/10">
                      <Users className="mr-1 h-3 w-3" />
                      Alunos
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 border-dashboard-border text-white hover:bg-dashboard-border">
                      <Calendar className="mr-1 h-3 w-3" />
                      Horários
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

export default AdminClasses;