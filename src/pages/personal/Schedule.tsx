import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  User,
  BookOpen,
  Plus,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const PersonalSchedule = () => {
  // Mock data - would come from API
  const currentWeek = {
    start: '2024-01-28',
    end: '2024-02-03'
  };

  const weekDays = [
    'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'
  ];

  const schedule = {
    '2024-01-28': [ // Segunda
      {
        id: '1',
        type: 'personal',
        time: '08:00-09:00',
        title: 'Personal Training',
        client: 'João Silva',
        status: 'confirmed'
      },
      {
        id: '2',
        type: 'class',
        time: '18:00-19:00',
        title: 'Beach Tennis Iniciante',
        students: 6,
        status: 'confirmed'
      }
    ],
    '2024-01-29': [ // Terça
      {
        id: '3',
        type: 'class',
        time: '16:00-16:45',
        title: 'Tênis Kids',
        students: 4,
        status: 'confirmed'
      },
      {
        id: '4',
        type: 'class',
        time: '19:00-20:30',
        title: 'FTV Avançado',
        students: 10,
        status: 'confirmed'
      }
    ],
    '2024-01-30': [ // Quarta
      {
        id: '5',
        type: 'personal',
        time: '10:00-11:00',
        title: 'Personal Training',
        client: 'Maria Santos',
        status: 'confirmed'
      },
      {
        id: '6',
        type: 'class',
        time: '18:00-19:00',
        title: 'Beach Tennis Iniciante',
        students: 6,
        status: 'confirmed'
      }
    ],
    '2024-01-31': [ // Quinta
      {
        id: '7',
        type: 'personal',
        time: '16:00-17:00',
        title: 'Personal Training',
        client: 'Pedro Costa',
        status: 'pending'
      },
      {
        id: '8',
        type: 'class',
        time: '19:00-20:30',
        title: 'FTV Avançado',
        students: 10,
        status: 'confirmed'
      }
    ],
    '2024-02-01': [ // Sexta
      {
        id: '9',
        type: 'class',
        time: '16:00-16:45',
        title: 'Tênis Kids',
        students: 4,
        status: 'confirmed'
      }
    ],
    '2024-02-02': [], // Sábado
    '2024-02-03': []  // Domingo
  };

  const getItemColor = (type: string, status: string) => {
    if (status === 'pending') return 'border-yellow-500 bg-yellow-500/10';
    if (type === 'personal') return 'border-fitway-green bg-fitway-green/10';
    return 'border-blue-500 bg-blue-500/10';
  };

  const getItemIcon = (type: string) => {
    return type === 'personal' ? User : BookOpen;
  };

  const getDayEvents = (date: string) => {
    return schedule[date] || [];
  };

  const generateWeekDates = (startDate: string) => {
    const dates = [];
    const start = new Date(startDate);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  };

  const weekDates = generateWeekDates(currentWeek.start);

  return (
    <div className="min-h-screen bg-dashboard-bg text-dashboard-fg">
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Minha Agenda</h1>
            <p className="text-white/80">Visualize sua programação semanal</p>
          </div>
          <Button className="bg-fitway-green hover:bg-fitway-green/90 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Novo Agendamento
          </Button>
        </div>

        {/* Week Navigator */}
        <Card className="bg-dashboard-card border-dashboard-border mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <Button variant="outline" size="sm" className="border-dashboard-border text-white hover:bg-dashboard-border">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-center">
                <CardTitle className="text-white">
                  {new Date(currentWeek.start).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </CardTitle>
                <p className="text-white/60 text-sm">
                  {new Date(currentWeek.start).toLocaleDateString('pt-BR')} - {new Date(currentWeek.end).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <Button variant="outline" size="sm" className="border-dashboard-border text-white hover:bg-dashboard-border">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Weekly Schedule Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
          {weekDays.map((day, index) => {
            const date = weekDates[index];
            const dayEvents = getDayEvents(date);
            const isToday = date === new Date().toISOString().split('T')[0];
            
            return (
              <Card key={day} className={`bg-dashboard-card border-dashboard-border ${isToday ? 'ring-2 ring-fitway-green' : ''}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-sm font-medium">
                    {day}
                    {isToday && <Badge variant="outline" className="ml-2 text-xs border-fitway-green text-fitway-green">Hoje</Badge>}
                  </CardTitle>
                  <p className="text-white/60 text-xs">
                    {new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                  </p>
                </CardHeader>
                <CardContent className="space-y-2">
                  {dayEvents.length > 0 ? (
                    dayEvents.map((event) => {
                      const Icon = getItemIcon(event.type);
                      return (
                        <div 
                          key={event.id}
                          className={`p-3 rounded-lg border ${getItemColor(event.type, event.status)}`}
                        >
                          <div className="flex items-start gap-2">
                            <Icon className="h-4 w-4 mt-0.5 text-fitway-green" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1 mb-1">
                                <Clock className="h-3 w-3 text-white/60" />
                                <span className="text-white/80 text-xs font-medium">
                                  {event.time}
                                </span>
                              </div>
                              <h4 className="text-white text-sm font-medium truncate">
                                {event.title}
                              </h4>
                              {event.client && (
                                <p className="text-white/60 text-xs">{event.client}</p>
                              )}
                              {event.students && (
                                <p className="text-white/60 text-xs">{event.students} alunos</p>
                              )}
                              {event.status === 'pending' && (
                                <Badge variant="outline" className="mt-1 text-xs border-yellow-500 text-yellow-500">
                                  Pendente
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-6">
                      <Calendar className="h-8 w-8 text-white/30 mx-auto mb-2" />
                      <p className="text-white/50 text-xs">Sem agendamentos</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="bg-dashboard-card border-dashboard-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-dashboard-fg">Esta Semana</CardTitle>
              <Calendar className="h-4 w-4 text-fitway-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {Object.values(schedule).flat().length}
              </div>
              <p className="text-xs text-white/70">agendamentos totais</p>
            </CardContent>
          </Card>

          <Card className="bg-dashboard-card border-dashboard-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-dashboard-fg">Personal Training</CardTitle>
              <User className="h-4 w-4 text-fitway-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {Object.values(schedule).flat().filter(e => e.type === 'personal').length}
              </div>
              <p className="text-xs text-white/70">sessões individuais</p>
            </CardContent>
          </Card>

          <Card className="bg-dashboard-card border-dashboard-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-dashboard-fg">Aulas em Grupo</CardTitle>
              <BookOpen className="h-4 w-4 text-fitway-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {Object.values(schedule).flat().filter(e => e.type === 'class').length}
              </div>
              <p className="text-xs text-white/70">aulas coletivas</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PersonalSchedule;