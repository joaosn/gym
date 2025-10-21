import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  User,
  MapPin,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { personalSessionsService } from '@/services/personal-sessions.service';
import type { PersonalSession } from '@/types';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';

const PersonalSchedule = () => {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<PersonalSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeekStart, setCurrentWeekStart] = useState(getMonday(new Date()));

  const weekDays = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

  // Calcular início da semana (segunda-feira)
  function getMonday(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  // Gerar datas da semana
  function generateWeekDates(startDate: Date): string[] {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  }

  const weekDates = generateWeekDates(currentWeekStart);

  // Navegar semanas
  const goToPreviousWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() - 7);
    setCurrentWeekStart(newStart);
  };

  const goToNextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + 7);
    setCurrentWeekStart(newStart);
  };

  const goToToday = () => {
    setCurrentWeekStart(getMonday(new Date()));
  };

  // Carregar sessões
  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const response = await personalSessionsService.getMyInstructorSessions({
        per_page: 100,
        periodo: 'futuras',
      });
      setSessions(response.data || []);
    } catch (error: any) {
      console.error('Erro ao carregar sessões:', error);
      toast({
        title: 'Erro ao carregar agenda',
        description: error.message,
        variant: 'destructive',
      });
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar sessões por data
  const getSessionsByDate = (date: string): PersonalSession[] => {
    return sessions.filter((session) => {
      const sessionDate = new Date(session.inicio).toISOString().split('T')[0];
      return sessionDate === date;
    });
  };

  // Cores de status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmada':
        return 'bg-green-500/10 text-green-400 border-green-500';
      case 'pendente':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500';
      case 'cancelada':
        return 'bg-red-500/10 text-red-400 border-red-500';
      default:
        return 'bg-white/10 text-white/60 border-white/20';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmada':
        return 'Confirmada';
      case 'pendente':
        return 'Pendente';
      case 'cancelada':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const weekStart = weekDates[0];
  const weekEnd = weekDates[6];

  return (
    <div className="min-h-screen bg-dashboard-bg text-dashboard-fg">
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Minha Agenda</h1>
            <p className="text-white/80">Visualize sua programação semanal</p>
          </div>
        </div>

        {/* Week Navigator */}
        <Card className="bg-dashboard-card border-dashboard-border mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousWeek}
                className="border-dashboard-border text-white hover:bg-dashboard-border"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-4">
                <div className="text-center">
                  <CardTitle className="text-white">
                    {new Date(weekStart).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                  </CardTitle>
                  <p className="text-white/60 text-sm">
                    {new Date(weekStart).toLocaleDateString('pt-BR')} - {new Date(weekEnd).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToToday}
                  className="border-dashboard-border text-white hover:bg-dashboard-border"
                >
                  Hoje
                </Button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={goToNextWeek}
                className="border-dashboard-border text-white hover:bg-dashboard-border"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-fitway-green" />
          </div>
        )}

        {/* Weekly Schedule Grid */}
        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
            {weekDays.map((dayName, index) => {
              const date = weekDates[index];
              const daySessions = getSessionsByDate(date);
              const isToday = date === new Date().toISOString().split('T')[0];

              return (
                <Card
                  key={date}
                  className={`bg-dashboard-card border-dashboard-border ${
                    isToday ? 'ring-2 ring-fitway-green' : ''
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-white">{dayName}</h3>
                        <p className="text-sm text-white/60">
                          {new Date(date).getDate()}/{new Date(date).getMonth() + 1}
                        </p>
                      </div>
                      {isToday && (
                        <Badge className="bg-fitway-green text-white border-none">
                          Hoje
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-2">
                    {daySessions.length === 0 && (
                      <p className="text-white/40 text-sm text-center py-4">
                        Nenhuma sessão
                      </p>
                    )}

                    {daySessions.map((session) => (
                      <div
                        key={session.id_sessao_personal}
                        className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-fitway-green/50 transition-all cursor-pointer"
                      >
                        {/* Horário */}
                        <div className="flex items-center text-xs text-white/80 mb-2">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTime(session.inicio)} - {formatTime(session.fim)}
                        </div>

                        {/* Aluno */}
                        <div className="flex items-center text-sm font-medium text-white mb-2">
                          <User className="h-4 w-4 mr-2 text-fitway-green" />
                          <span className="truncate">{session.usuario?.nome || 'Aluno não identificado'}</span>
                        </div>

                        {/* Quadra (se houver) */}
                        {session.quadra && (
                          <div className="flex items-center text-xs text-white/70 mb-2">
                            <MapPin className="h-3 w-3 mr-1" />
                            {session.quadra.nome}
                          </div>
                        )}

                        {/* Preço */}
                        <div className="flex items-center text-xs text-white/70 mb-2">
                          <DollarSign className="h-3 w-3 mr-1" />
                          {formatCurrency(session.preco_total)}
                        </div>

                        {/* Status */}
                        <Badge className={`text-xs ${getStatusColor(session.status)}`}>
                          {getStatusLabel(session.status)}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && sessions.length === 0 && (
          <Card className="bg-dashboard-card border-dashboard-border">
            <CardContent className="py-12 text-center">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-white/20" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Nenhuma sessão agendada
              </h3>
              <p className="text-white/60 mb-6">
                Você não possui sessões personal agendadas no momento.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PersonalSchedule;
