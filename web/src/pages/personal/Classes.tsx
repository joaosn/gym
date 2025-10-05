import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Calendar, 
  Clock, 
  Users,
  Edit,
  BookOpen,
  Target,
  TrendingUp
} from 'lucide-react';

const PersonalClasses = () => {
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
      nextOccurrence: '2024-01-28T18:00:00Z',
      weeklySchedule: ['Segunda 18:00', 'Quarta 18:00'],
      status: 'active'
    },
    {
      id: '2',
      name: 'FTV Avançado',
      sport: 'FTV',
      level: 'avancado',
      duration: 90,
      capacity: 12,
      enrolled: 10,
      nextOccurrence: '2024-01-29T19:00:00Z',
      weeklySchedule: ['Terça 19:00', 'Quinta 19:00'],
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
      nextOccurrence: '2024-01-30T16:00:00Z',
      weeklySchedule: ['Terça 16:00', 'Sexta 16:00'],
      status: 'active'
    }
  ];

  const totalClasses = classes.length;
  const totalStudents = classes.reduce((sum, c) => sum + c.enrolled, 0);
  const avgOccupancy = classes.reduce((sum, c) => sum + (c.enrolled / c.capacity * 100), 0) / classes.length;

  return (
    <div className="min-h-screen bg-dashboard-bg text-dashboard-fg">
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Minhas Aulas</h1>
            <p className="text-white/80">Gerencie suas aulas e turmas</p>
          </div>
          <Button className="bg-fitway-green hover:bg-fitway-green/90 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Nova Aula
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-dashboard-card border-dashboard-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-dashboard-fg">Aulas Ativas</CardTitle>
              <BookOpen className="h-4 w-4 text-fitway-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalClasses}</div>
              <p className="text-xs text-white/70">turmas regulares</p>
            </CardContent>
          </Card>

          <Card className="bg-dashboard-card border-dashboard-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-dashboard-fg">Total Alunos</CardTitle>
              <Users className="h-4 w-4 text-fitway-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalStudents}</div>
              <p className="text-xs text-white/70">alunos inscritos</p>
            </CardContent>
          </Card>

          <Card className="bg-dashboard-card border-dashboard-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-dashboard-fg">Taxa Ocupação</CardTitle>
              <Target className="h-4 w-4 text-fitway-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{Math.round(avgOccupancy)}%</div>
              <p className="text-xs text-white/70">média das turmas</p>
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

        {/* Classes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {classes.map((classItem) => (
            <Card key={classItem.id} className="bg-dashboard-card border-dashboard-border">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-white text-xl">{classItem.name}</CardTitle>
                    <p className="text-white/60 mt-1">{classItem.sport}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline"
                      className="border-fitway-green/50 text-fitway-green capitalize"
                    >
                      {classItem.level}
                    </Badge>
                    <Button size="sm" variant="outline" className="border-dashboard-border text-white hover:bg-dashboard-border">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-white/70 text-sm">Duração:</span>
                      <p className="text-white font-medium">{classItem.duration} min</p>
                    </div>
                    <div>
                      <span className="text-white/70 text-sm">Capacidade:</span>
                      <p className="text-white font-medium">{classItem.capacity} alunos</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white/70 text-sm">Alunos inscritos:</span>
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
                    <span className="text-white/70 text-sm block mb-2">Horários semanais:</span>
                    <div className="flex flex-wrap gap-1">
                      {classItem.weeklySchedule.map((schedule, index) => (
                        <Badge key={index} variant="outline" className="text-xs border-dashboard-border text-white">
                          {schedule}
                        </Badge>
                      ))}
                    </div>
                  </div>

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

                  <div className="flex gap-2 pt-4 border-t border-dashboard-border">
                    <Button variant="outline" size="sm" className="flex-1 border-fitway-green text-fitway-green hover:bg-fitway-green/10">
                      <Users className="mr-2 h-4 w-4" />
                      Ver Alunos
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 border-dashboard-border text-white hover:bg-dashboard-border">
                      <Calendar className="mr-2 h-4 w-4" />
                      Agenda
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {classes.length === 0 && (
          <Card className="bg-dashboard-card border-dashboard-border">
            <CardContent className="text-center py-12">
              <BookOpen className="h-16 w-16 text-white/50 mx-auto mb-4" />
              <h3 className="text-white text-lg font-medium mb-2">Nenhuma aula cadastrada</h3>
              <p className="text-white/60 mb-6">Comece criando sua primeira aula ou turma</p>
              <Button className="bg-fitway-green hover:bg-fitway-green/90 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeira Aula
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PersonalClasses;