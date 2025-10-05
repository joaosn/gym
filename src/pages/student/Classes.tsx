import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Calendar, 
  Clock, 
  Users,
  User,
  BookOpen,
  Filter,
  Star
} from 'lucide-react';

const StudentClasses = () => {
  // Mock data - would come from API
  const enrolledClasses = [
    {
      id: '1',
      name: 'Beach Tennis Iniciante',
      sport: 'Beach Tennis',
      level: 'iniciante',
      instructor: 'Prof. Carlos Silva',
      nextOccurrence: '2024-01-28T18:00:00Z',
      weeklySchedule: ['Segunda 18:00', 'Quarta 18:00'],
      enrolledStudents: 6,
      capacity: 8,
      status: 'enrolled'
    }
  ];

  const availableClasses = [
    {
      id: '2',
      name: 'FTV Avançado',
      sport: 'FTV',
      level: 'avancado',
      instructor: 'Prof. Ana Santos',
      duration: 90,
      capacity: 12,
      enrolledStudents: 10,
      price: 60.00,
      nextOccurrence: '2024-01-29T19:00:00Z',
      weeklySchedule: ['Terça 19:00', 'Quinta 19:00'],
      rating: 4.9,
      description: 'Aula de FTV para alunos avançados com foco em técnicas e táticas.'
    },
    {
      id: '3',
      name: 'Tênis Intermediário',
      sport: 'Tênis',
      level: 'intermediario',
      instructor: 'Prof. Maria Costa',
      duration: 75,
      capacity: 8,
      enrolledStudents: 5,
      price: 55.00,
      nextOccurrence: '2024-01-30T17:00:00Z',
      weeklySchedule: ['Terça 17:00', 'Quinta 17:00'],
      rating: 4.7,
      description: 'Aperfeiçoe sua técnica de tênis com exercícios específicos.'
    },
    {
      id: '4',
      name: 'Beach Tennis Kids',
      sport: 'Beach Tennis',
      level: 'kids',
      instructor: 'Prof. João Mendes',
      duration: 45,
      capacity: 6,
      enrolledStudents: 3,
      price: 35.00,
      nextOccurrence: '2024-01-31T16:00:00Z',
      weeklySchedule: ['Quarta 16:00', 'Sexta 16:00'],
      rating: 4.8,
      description: 'Aula especial para crianças aprenderem beach tennis de forma divertida.'
    },
    {
      id: '5',
      name: 'FTV Iniciante',
      sport: 'FTV',
      level: 'iniciante',
      instructor: 'Prof. Pedro Oliveira',
      duration: 60,
      capacity: 10,
      enrolledStudents: 8,
      price: 40.00,
      nextOccurrence: '2024-02-01T19:00:00Z',
      weeklySchedule: ['Segunda 19:00', 'Sexta 19:00'],
      rating: 4.5,
      description: 'Introdução ao FTV com foco nos fundamentos básicos.'
    }
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'kids': return 'border-purple-500 text-purple-500';
      case 'iniciante': return 'border-green-500 text-green-500';
      case 'intermediario': return 'border-yellow-500 text-yellow-500';
      case 'avancado': return 'border-red-500 text-red-500';
      default: return 'border-gray-500 text-gray-500';
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'kids': return 'Kids';
      case 'iniciante': return 'Iniciante';
      case 'intermediario': return 'Intermediário';
      case 'avancado': return 'Avançado';
      default: return level;
    }
  };

  return (
    <div className="min-h-screen bg-dashboard-bg text-dashboard-fg">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Aulas Esportivas</h1>
          <p className="text-white/80">Participe das aulas em grupo do FITWAY</p>
        </div>

        {/* My Classes Section */}
        {enrolledClasses.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Minhas Aulas</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {enrolledClasses.map((classItem) => (
                <Card key={classItem.id} className="bg-dashboard-card border-dashboard-border border-fitway-green/50">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-white text-lg">{classItem.name}</CardTitle>
                        <p className="text-white/60 mt-1">{classItem.sport}</p>
                      </div>
                      <Badge variant="outline" className="border-fitway-green text-fitway-green">
                        Inscrito
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-fitway-green" />
                        <span className="text-white">{classItem.instructor}</span>
                      </div>

                      <div>
                        <span className="text-white/70 text-sm block mb-1">Próxima aula:</span>
                        <div className="flex items-center gap-2">
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

                      <div>
                        <span className="text-white/70 text-sm block mb-1">Horários semanais:</span>
                        <div className="flex flex-wrap gap-1">
                          {classItem.weeklySchedule.map((schedule, index) => (
                            <Badge key={index} variant="outline" className="text-xs border-dashboard-border text-white">
                              {schedule}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Button variant="outline" className="w-full border-red-500 text-red-500 hover:bg-red-500/10">
                        Cancelar Inscrição
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-white/50" />
            <Input
              placeholder="Buscar aulas por esporte, nível ou instrutor..."
              className="pl-10 bg-dashboard-card border-dashboard-border text-white placeholder:text-white/50"
            />
          </div>
          <Button variant="outline" className="border-dashboard-border text-white hover:bg-dashboard-border">
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
        </div>

        {/* Available Classes */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Aulas Disponíveis</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {availableClasses.map((classItem) => (
              <Card key={classItem.id} className="bg-dashboard-card border-dashboard-border">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-white text-lg">{classItem.name}</CardTitle>
                      <p className="text-white/60 mt-1">{classItem.sport}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-xs ${getLevelColor(classItem.level)}`}>
                        {getLevelText(classItem.level)}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-white text-sm">{classItem.rating}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-white/80 text-sm">{classItem.description}</p>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-white/70">Instrutor:</span>
                        <div className="flex items-center gap-2 mt-1">
                          <User className="h-4 w-4 text-fitway-green" />
                          <span className="text-white">{classItem.instructor}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-white/70">Duração:</span>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-4 w-4 text-fitway-green" />
                          <span className="text-white">{classItem.duration} min</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white/70 text-sm">Vagas:</span>
                        <span className="text-white text-sm">{classItem.enrolledStudents}/{classItem.capacity}</span>
                      </div>
                      <div className="w-full bg-dashboard-bg rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            classItem.enrolledStudents === classItem.capacity ? 'bg-red-500' : 'bg-fitway-green'
                          }`}
                          style={{ width: `${(classItem.enrolledStudents / classItem.capacity) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <span className="text-white/70 text-sm block mb-1">Horários semanais:</span>
                      <div className="flex flex-wrap gap-1">
                        {classItem.weeklySchedule.map((schedule, index) => (
                          <Badge key={index} variant="outline" className="text-xs border-dashboard-border text-white">
                            {schedule}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-dashboard-border">
                      <div>
                        <span className="text-fitway-green font-bold text-lg">
                          R$ {classItem.price.toFixed(2)}
                        </span>
                        <span className="text-white/60 text-sm ml-1">/aula</span>
                      </div>
                      <Button 
                        className="bg-fitway-green hover:bg-fitway-green/90 text-white"
                        disabled={classItem.enrolledStudents === classItem.capacity}
                      >
                        {classItem.enrolledStudents === classItem.capacity ? 'Esgotado' : 'Inscrever-se'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {availableClasses.length === 0 && (
          <Card className="bg-dashboard-card border-dashboard-border">
            <CardContent className="text-center py-12">
              <BookOpen className="h-16 w-16 text-white/50 mx-auto mb-4" />
              <h3 className="text-white text-lg font-medium mb-2">Nenhuma aula disponível</h3>
              <p className="text-white/60">Novas aulas serão adicionadas em breve</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StudentClasses;