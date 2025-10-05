import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  DollarSign, 
  Calendar, 
  AlertTriangle,
  TrendingUp,
  BookOpen,
  MapPin,
  CreditCard,
  Star,
  Activity
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  // Mock KPIs data
  const kpis = {
    activeSubscriptions: 127,
    overduePayments: 8,
    courtOccupancy: 78, // percentage
    monthlyRevenue: 45680,
    newMembersThisMonth: 23,
    totalBookingsToday: 15,
    classesWithAvailability: 12,
    trainerSessions: 34
  };

  const recentBookings = [
    {
      id: '1',
      court: 'Quadra Alecrim',
      client: 'João Silva',
      date: '2024-01-26',
      time: '19:00',
      status: 'confirmed',
      amount: 40
    },
    {
      id: '2',
      court: 'Quadra Cotafacil',
      client: 'Maria Santos',
      date: '2024-01-26',
      time: '20:00',
      status: 'pending',
      amount: 45
    },
    {
      id: '3',
      court: 'Quadra Castelini',
      client: 'Pedro Oliveira',
      date: '2024-01-26',
      time: '18:30',
      status: 'confirmed',
      amount: 40
    }
  ];

  const overduePayments = [
    {
      id: '1',
      client: 'Carlos Lima',
      type: 'Assinatura',
      amount: 129,
      daysOverdue: 5,
      plan: 'Fit Plus'
    },
    {
      id: '2',
      client: 'Ana Costa',
      type: 'Reserva',
      amount: 45,
      daysOverdue: 2,
      plan: null
    }
  ];

  const topClasses = [
    {
      name: 'Beach Tennis Avançado',
      enrolled: 6,
      capacity: 6,
      waitlist: 3
    },
    {
      name: 'FTV Iniciante',
      enrolled: 5,
      capacity: 6,
      waitlist: 0
    },
    {
      name: 'Beach Tennis Kids',
      enrolled: 4,
      capacity: 6,
      waitlist: 1
    }
  ];

  const topTrainers = [
    {
      name: 'João Silva',
      sessions: 12,
      rating: 4.9,
      revenue: 960
    },
    {
      name: 'Maria Santos',
      sessions: 8,
      rating: 4.8,
      revenue: 640
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard Administrativo</h1>
        <p className="text-white/80">Visão geral completa do sistema FITWAY</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-dashboard-card border-dashboard-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-dashboard-fg">Assinaturas Ativas</CardTitle>
            <Users className="h-4 w-4 text-fitway-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-fitway-green">{kpis.activeSubscriptions}</div>
            <p className="text-xs text-white/70">+{kpis.newMembersThisMonth} novos este mês</p>
          </CardContent>
        </Card>

        <Card className="bg-dashboard-card border-dashboard-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-dashboard-fg">Receita Mensal</CardTitle>
            <DollarSign className="h-4 w-4 text-fitway-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-fitway-green">
              R$ {kpis.monthlyRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-white/70">+12% vs mês anterior</p>
          </CardContent>
        </Card>

        <Card className="bg-dashboard-card border-dashboard-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-dashboard-fg">Ocupação Quadras</CardTitle>
            <Activity className="h-4 w-4 text-fitway-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{kpis.courtOccupancy}%</div>
            <p className="text-xs text-white/70">{kpis.totalBookingsToday} reservas hoje</p>
          </CardContent>
        </Card>

        <Card className="bg-dashboard-card border-dashboard-border border-orange-500/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-dashboard-fg">Pagamentos Atrasados</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{kpis.overduePayments}</div>
            <p className="text-xs text-white/70">requer atenção</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Bookings */}
        <Card className="lg:col-span-2 bg-dashboard-card border-dashboard-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Calendar className="h-5 w-5 text-fitway-green" />
              Reservas Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 bg-dashboard-bg/50 rounded-lg">
                  <div>
                    <p className="font-medium text-white">{booking.client}</p>
                    <p className="text-sm text-white/80">{booking.court}</p>
                    <p className="text-xs text-white/60">
                      {new Date(booking.date).toLocaleDateString('pt-BR')} às {booking.time}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-fitway-green">R$ {booking.amount}</p>
                    <Badge 
                      variant={booking.status === 'confirmed' ? 'default' : 'outline'}
                      className={booking.status === 'confirmed' ? 'bg-fitway-green text-fitway-dark' : 'border-orange-500 text-orange-500'}
                    >
                      {booking.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                    </Badge>
                  </div>
                </div>
              ))}
              <Button variant="sport" className="w-full" onClick={() => navigate('/admin/quadras')}>
                Ver Todas as Reservas
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Overdue Payments */}
        <Card className="bg-dashboard-card border-dashboard-border border-orange-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Pagamentos Atrasados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {overduePayments.map((payment) => (
                <div key={payment.id} className="p-3 bg-dashboard-bg/50 rounded-lg border border-orange-500/20">
                  <p className="font-medium text-white">{payment.client}</p>
                  <p className="text-sm text-white/80">{payment.type} {payment.plan && `- ${payment.plan}`}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-orange-500 font-bold">R$ {payment.amount}</span>
                    <Badge variant="outline" className="border-orange-500 text-orange-500">
                      {payment.daysOverdue} dias
                    </Badge>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white" onClick={() => navigate('/admin/pagamentos')}>
                Gerenciar Cobranças
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Classes */}
        <Card className="bg-dashboard-card border-dashboard-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <BookOpen className="h-5 w-5 text-fitway-green" />
              Aulas Populares
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topClasses.map((classItem, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-dashboard-bg/50 rounded-lg">
                  <div>
                    <p className="font-medium text-white">{classItem.name}</p>
                    <p className="text-sm text-white/80">
                      {classItem.enrolled}/{classItem.capacity} alunos
                    </p>
                  </div>
                  <div className="text-right">
                    {classItem.waitlist > 0 && (
                      <Badge className="bg-fitway-green text-fitway-dark mb-1">
                        +{classItem.waitlist} fila
                      </Badge>
                    )}
                    <div className="text-xs text-white/60">
                      {Math.round((classItem.enrolled / classItem.capacity) * 100)}% ocupação
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="sport" className="w-full" onClick={() => navigate('/admin/aulas')}>
                Gerenciar Aulas
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Top Trainers */}
        <Card className="bg-dashboard-card border-dashboard-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Star className="h-5 w-5 text-fitway-green" />
              Top Personal Trainers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topTrainers.map((trainer, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-dashboard-bg/50 rounded-lg">
                  <div>
                    <p className="font-medium text-white">{trainer.name}</p>
                    <div className="flex items-center gap-2 text-sm text-white/80">
                      <span>{trainer.sessions} sessões</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-fitway-green text-fitway-green" />
                        <span>{trainer.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-fitway-green">R$ {trainer.revenue}</p>
                    <p className="text-xs text-white/60">este mês</p>
                  </div>
                </div>
              ))}
              <Button variant="sport" className="w-full" onClick={() => navigate('/admin/personais')}>
                Gerenciar Personal Trainers
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-6 bg-dashboard-card border-dashboard-border">
        <CardHeader>
          <CardTitle className="text-white">Ações Administrativas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="sport" className="h-20 flex-col" onClick={() => navigate('/admin/planos')}>
              <Users className="h-6 w-6 mb-2" />
              Gerenciar Planos
            </Button>
            <Button variant="outline" className="h-20 flex-col border-fitway-green text-fitway-green hover:bg-fitway-green hover:text-fitway-dark" onClick={() => navigate('/admin/quadras')}>
              <MapPin className="h-6 w-6 mb-2" />
              Configurar Quadras
            </Button>
            <Button variant="outline" className="h-20 flex-col border-fitway-green text-fitway-green hover:bg-fitway-green hover:text-fitway-dark" onClick={() => navigate('/admin/pagamentos')}>
              <CreditCard className="h-6 w-6 mb-2" />
              Relatório Financeiro
            </Button>
            <Button variant="outline" className="h-20 flex-col border-fitway-green text-fitway-green hover:bg-fitway-green hover:text-fitway-dark" onClick={() => navigate('/admin/aulas')}>
              <BookOpen className="h-6 w-6 mb-2" />
              Gerenciar Aulas
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;