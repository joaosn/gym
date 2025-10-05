import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  CreditCard, 
  Trophy, 
  User,
  MapPin,
  BookOpen,
  Zap
} from 'lucide-react';

const StudentDashboard = () => {
  // Mock data - would come from API
  const subscription = {
    plan: 'Fit Plus',
    status: 'active',
    nextPayment: '2024-02-15',
    daysLeft: 12
  };

  const nextBookings = [
    {
      id: '1',
      court: 'Quadra Alecrim',
      date: '2024-01-28',
      time: '19:00',
      sport: 'Beach Tennis'
    },
    {
      id: '2', 
      court: 'Quadra Cotafacil',
      date: '2024-01-30',
      time: '20:00',
      sport: 'FTV'
    }
  ];

  const nextClasses = [
    {
      id: '1',
      name: 'Beach Tennis Avançado',
      date: '2024-01-29',
      time: '18:00',
      instructor: 'Prof. Carlos'
    }
  ];

  const nextSessions = [
    {
      id: '1',
      trainer: 'João Silva',
      date: '2024-01-31',
      time: '16:00'
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard do Aluno</h1>
          <p className="text-white/80">Bem-vindo de volta! Aqui está seu resumo esportivo.</p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-dashboard-card border-dashboard-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-dashboard-fg">Plano Atual</CardTitle>
              <CreditCard className="h-4 w-4 text-fitway-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-fitway-green">{subscription.plan}</div>
              <Badge variant={subscription.status === 'active' ? 'default' : 'destructive'} className="mt-1">
                {subscription.status === 'active' ? 'Ativo' : 'Inativo'}
              </Badge>
            </CardContent>
          </Card>

          <Card className="bg-dashboard-card border-dashboard-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-dashboard-fg">Próximo Vencimento</CardTitle>
              <Clock className="h-4 w-4 text-fitway-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{subscription.daysLeft}</div>
              <p className="text-xs text-white/70">dias restantes</p>
            </CardContent>
          </Card>

          <Card className="bg-dashboard-card border-dashboard-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-dashboard-fg">Reservas</CardTitle>
              <Calendar className="h-4 w-4 text-fitway-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{nextBookings.length}</div>
              <p className="text-xs text-white/70">próximas reservas</p>
            </CardContent>
          </Card>

          <Card className="bg-dashboard-card border-dashboard-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-dashboard-fg">Aulas</CardTitle>
              <BookOpen className="h-4 w-4 text-fitway-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{nextClasses.length}</div>
              <p className="text-xs text-white/70">aulas agendadas</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Próximas Reservas */}
          <Card className="bg-dashboard-card border-dashboard-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Calendar className="h-5 w-5 text-fitway-green" />
                Próximas Reservas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {nextBookings.length > 0 ? (
                <div className="space-y-4">
                  {nextBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-3 bg-dashboard-bg/50 rounded-lg">
                      <div>
                        <p className="font-medium text-white">{booking.court}</p>
                        <p className="text-sm text-white/80">{booking.sport}</p>
                        <p className="text-xs text-white/60">
                          {new Date(booking.date).toLocaleDateString('pt-BR')} às {booking.time}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-fitway-green border-fitway-green">
                        Confirmada
                      </Badge>
                    </div>
                  ))}
                  <Button variant="sport" className="w-full">
                    Ver Todas as Reservas
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 text-white/50 mx-auto mb-4" />
                  <p className="text-white/70">Nenhuma reserva agendada</p>
                  <Button variant="sport" size="sm" className="mt-4">
                    Reservar Quadra
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Próximas Aulas */}
          <Card className="bg-dashboard-card border-dashboard-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <BookOpen className="h-5 w-5 text-fitway-green" />
                Próximas Aulas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {nextClasses.length > 0 ? (
                <div className="space-y-4">
                  {nextClasses.map((classItem) => (
                    <div key={classItem.id} className="flex items-center justify-between p-3 bg-dashboard-bg/50 rounded-lg">
                      <div>
                        <p className="font-medium text-white">{classItem.name}</p>
                        <p className="text-sm text-white/80">{classItem.instructor}</p>
                        <p className="text-xs text-white/60">
                          {new Date(classItem.date).toLocaleDateString('pt-BR')} às {classItem.time}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-fitway-green border-fitway-green">
                        Inscrito
                      </Badge>
                    </div>
                  ))}
                  <Button variant="sport" className="w-full">
                    Ver Todas as Aulas
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-white/50 mx-auto mb-4" />
                  <p className="text-white/70">Nenhuma aula agendada</p>
                  <Button variant="sport" size="sm" className="mt-4">
                    Ver Aulas Disponíveis
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Personal Training */}
          <Card className="bg-dashboard-card border-dashboard-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <User className="h-5 w-5 text-fitway-green" />
                Personal Training
              </CardTitle>
            </CardHeader>
            <CardContent>
              {nextSessions.length > 0 ? (
                <div className="space-y-4">
                  {nextSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 bg-dashboard-bg/50 rounded-lg">
                      <div>
                        <p className="font-medium text-white">{session.trainer}</p>
                        <p className="text-xs text-white/60">
                          {new Date(session.date).toLocaleDateString('pt-BR')} às {session.time}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-fitway-green border-fitway-green">
                        Agendado
                      </Badge>
                    </div>
                  ))}
                  <Button variant="sport" className="w-full">
                    Ver Personal Trainers
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-white/50 mx-auto mb-4" />
                  <p className="text-white/70">Nenhuma sessão agendada</p>
                  <Button variant="sport" size="sm" className="mt-4">
                    Agendar Personal
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status do Plano */}
          <Card className="bg-dashboard-card border-dashboard-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Trophy className="h-5 w-5 text-fitway-green" />
                Status do Plano
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Plano atual:</span>
                  <span className="font-bold text-fitway-green">{subscription.plan}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Próximo vencimento:</span>
                  <span className="text-white">
                    {new Date(subscription.nextPayment).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Reservas futuras:</span>
                  <span className="text-white">2 disponíveis</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Aulas incluídas:</span>
                  <span className="text-white">1/semana</span>
                </div>

                <Button variant="neon" className="w-full mt-4">
                  <Zap className="mr-2 h-4 w-4" />
                  Upgrade do Plano
                </Button>
              </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;