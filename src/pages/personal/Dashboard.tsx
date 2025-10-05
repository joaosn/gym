import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  Users, 
  Trophy, 
  Star,
  DollarSign,
  TrendingUp,
  User,
  BookOpen
} from 'lucide-react';

const PersonalDashboard = () => {
  // Mock data - would come from API
  const personalStats = {
    totalClients: 15,
    activeSlots: 8,
    monthlyRevenue: 2400,
    averageRating: 4.8,
    sessionsThisWeek: 12
  };

  const todaySchedule = [
    {
      id: '1',
      client: 'João Silva',
      time: '08:00',
      duration: '60min',
      type: 'Personal Training',
      status: 'confirmed'
    },
    {
      id: '2',
      client: 'Maria Santos',
      time: '09:30',
      duration: '60min',
      type: 'Beach Tennis',
      status: 'confirmed'
    },
    {
      id: '3',
      client: 'Carlos Oliveira',
      time: '16:00',
      duration: '60min',
      type: 'Personal Training',
      status: 'pending'
    }
  ];

  const upcomingClasses = [
    {
      id: '1',
      name: 'Beach Tennis Avançado',
      date: '2024-01-29',
      time: '18:00',
      enrolled: 4,
      capacity: 6
    },
    {
      id: '2',
      name: 'FTV Iniciante',
      date: '2024-01-30',
      time: '19:00',
      enrolled: 6,
      capacity: 6
    }
  ];

  const recentRatings = [
    {
      id: '1',
      client: 'Ana Costa',
      rating: 5,
      comment: 'Excelente personal! Muito dedicado e profissional.',
      date: '2024-01-25'
    },
    {
      id: '2',
      client: 'Pedro Lima',
      rating: 5,
      comment: 'Ótima metodologia, resultados visíveis.',
      date: '2024-01-24'
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard Personal</h1>
          <p className="text-white/80">Gerencie seus treinos, aulas e clientes.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="bg-dashboard-card border-dashboard-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-dashboard-fg">Clientes Ativos</CardTitle>
              <User className="h-4 w-4 text-fitway-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{personalStats.totalClients}</div>
              <p className="text-xs text-white/70">+2 este mês</p>
            </CardContent>
          </Card>

          <Card className="bg-dashboard-card border-dashboard-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-dashboard-fg">Slots Ativos</CardTitle>
              <Calendar className="h-4 w-4 text-fitway-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{personalStats.activeSlots}</div>
              <p className="text-xs text-white/70">esta semana</p>
            </CardContent>
          </Card>

          <Card className="bg-dashboard-card border-dashboard-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-dashboard-fg">Receita Mensal</CardTitle>
              <DollarSign className="h-4 w-4 text-fitway-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-fitway-green">R$ {personalStats.monthlyRevenue}</div>
              <p className="text-xs text-white/70">+15% vs mês anterior</p>
            </CardContent>
          </Card>

          <Card className="bg-dashboard-card border-dashboard-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-dashboard-fg">Avaliação</CardTitle>
              <Star className="h-4 w-4 text-fitway-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{personalStats.averageRating}</div>
              <p className="text-xs text-white/70">média geral</p>
            </CardContent>
          </Card>

          <Card className="bg-dashboard-card border-dashboard-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-dashboard-fg">Sessões</CardTitle>
              <TrendingUp className="h-4 w-4 text-fitway-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{personalStats.sessionsThisWeek}</div>
              <p className="text-xs text-white/70">esta semana</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Today's Schedule */}
          <Card className="lg:col-span-2 bg-dashboard-card border-dashboard-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Clock className="h-5 w-5 text-fitway-green" />
                Agenda de Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todaySchedule.length > 0 ? (
                <div className="space-y-4">
                  {todaySchedule.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 bg-dashboard-bg/50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-lg font-bold text-fitway-green">{session.time}</p>
                          <p className="text-xs text-white/60">{session.duration}</p>
                        </div>
                        <div>
                          <p className="font-medium text-white">{session.client}</p>
                          <p className="text-sm text-white/80">{session.type}</p>
                        </div>
                      </div>
                      <Badge 
                        variant={session.status === 'confirmed' ? 'default' : 'outline'}
                        className={session.status === 'confirmed' ? 'bg-fitway-green text-fitway-dark' : 'border-fitway-green text-fitway-green'}
                      >
                        {session.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                      </Badge>
                    </div>
                  ))}
                  <Button variant="sport" className="w-full">
                    Ver Agenda Completa
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-white/50 mx-auto mb-4" />
                  <p className="text-white/70">Nenhuma sessão agendada para hoje</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Classes */}
          <Card className="bg-dashboard-card border-dashboard-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <BookOpen className="h-5 w-5 text-fitway-green" />
                Próximas Aulas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingClasses.length > 0 ? (
                <div className="space-y-4">
                  {upcomingClasses.map((classItem) => (
                    <div key={classItem.id} className="p-3 bg-dashboard-bg/50 rounded-lg">
                      <p className="font-medium text-white">{classItem.name}</p>
                      <p className="text-sm text-white/80 mb-2">
                        {new Date(classItem.date).toLocaleDateString('pt-BR')} às {classItem.time}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-fitway-green" />
                          <span className="text-sm text-white/80">
                            {classItem.enrolled}/{classItem.capacity}
                          </span>
                        </div>
                        <Badge 
                          variant={classItem.enrolled === classItem.capacity ? 'default' : 'outline'}
                          className={classItem.enrolled === classItem.capacity ? 'bg-fitway-green text-fitway-dark' : 'border-fitway-green text-fitway-green'}
                        >
                          {classItem.enrolled === classItem.capacity ? 'Lotada' : 'Vagas'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  <Button variant="sport" className="w-full" size="sm">
                    Gerenciar Aulas
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-white/50 mx-auto mb-4" />
                  <p className="text-white/70">Nenhuma aula agendada</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Ratings */}
          <Card className="lg:col-span-2 bg-dashboard-card border-dashboard-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Star className="h-5 w-5 text-fitway-green" />
                Avaliações Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentRatings.length > 0 ? (
                <div className="space-y-4">
                  {recentRatings.map((rating) => (
                    <div key={rating.id} className="p-4 bg-dashboard-bg/50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium text-white">{rating.client}</p>
                        <div className="flex items-center gap-1">
                          {[...Array(rating.rating)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-fitway-green text-fitway-green" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-white/80 mb-2">"{rating.comment}"</p>
                      <p className="text-xs text-white/60">
                        {new Date(rating.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full border-fitway-green text-fitway-green hover:bg-fitway-green hover:text-fitway-dark">
                    Ver Todas as Avaliações
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Star className="h-12 w-12 text-white/50 mx-auto mb-4" />
                  <p className="text-white/70">Nenhuma avaliação ainda</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-dashboard-card border-dashboard-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Trophy className="h-5 w-5 text-fitway-green" />
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="sport" className="w-full justify-start">
                  <Calendar className="mr-2 h-4 w-4" />
                  Criar Novo Slot
                </Button>
                <Button variant="outline" className="w-full justify-start border-fitway-green text-fitway-green hover:bg-fitway-green hover:text-fitway-dark">
                  <Users className="mr-2 h-4 w-4" />
                  Ver Meus Clientes
                </Button>
                <Button variant="outline" className="w-full justify-start border-fitway-green text-fitway-green hover:bg-fitway-green hover:text-fitway-dark">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Minhas Turmas
                </Button>
                <Button variant="outline" className="w-full justify-start border-fitway-green text-fitway-green hover:bg-fitway-green hover:text-fitway-dark">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Relatório Financeiro
                </Button>
              </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PersonalDashboard;