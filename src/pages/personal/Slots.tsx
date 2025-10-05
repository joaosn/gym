import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Calendar, 
  Clock, 
  User,
  Edit,
  Trash2,
  CheckCircle
} from 'lucide-react';

const PersonalSlots = () => {
  // Mock data - would come from API
  const slots = [
    {
      id: '1',
      date: '2024-01-28',
      startTime: '08:00',
      endTime: '09:00',
      isAvailable: false,
      clientName: 'João Silva',
      clientEmail: 'joao@email.com',
      status: 'confirmed'
    },
    {
      id: '2',
      date: '2024-01-28',
      startTime: '09:00',
      endTime: '10:00',
      isAvailable: true,
      clientName: null,
      clientEmail: null,
      status: 'available'
    },
    {
      id: '3',
      date: '2024-01-28',
      startTime: '10:00',
      endTime: '11:00',
      isAvailable: false,
      clientName: 'Maria Santos',
      clientEmail: 'maria@email.com',
      status: 'confirmed'
    },
    {
      id: '4',
      date: '2024-01-28',
      startTime: '16:00',
      endTime: '17:00',
      isAvailable: false,
      clientName: 'Pedro Costa',
      clientEmail: 'pedro@email.com',
      status: 'pending'
    },
    {
      id: '5',
      date: '2024-01-29',
      startTime: '08:00',
      endTime: '09:00',
      isAvailable: true,
      clientName: null,
      clientEmail: null,
      status: 'available'
    },
    {
      id: '6',
      date: '2024-01-29',
      startTime: '18:00',
      endTime: '19:00',
      isAvailable: false,
      clientName: 'Ana Oliveira',
      clientEmail: 'ana@email.com',
      status: 'confirmed'
    }
  ];

  const today = new Date().toISOString().split('T')[0];
  const todaySlots = slots.filter(slot => slot.date === today);
  const confirmedSessions = slots.filter(slot => slot.status === 'confirmed').length;
  const availableSlots = slots.filter(slot => slot.isAvailable).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'available': return 'bg-fitway-green';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'pending': return 'Pendente';
      case 'available': return 'Disponível';
      default: return status;
    }
  };

  const groupSlotsByDate = (slotsArray: any[]) => {
    return slotsArray.reduce((groups: any, slot: any) => {
      const date = slot.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(slot);
      return groups;
    }, {} as Record<string, any[]>);
  };

  const groupedSlots = groupSlotsByDate(slots);

  return (
    <div className="min-h-screen bg-dashboard-bg text-dashboard-fg">
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Meus Horários</h1>
            <p className="text-white/80">Gerencie sua agenda de personal training</p>
          </div>
          <Button className="bg-fitway-green hover:bg-fitway-green/90 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Novo Horário
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-dashboard-card border-dashboard-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-dashboard-fg">Sessões Confirmadas</CardTitle>
              <CheckCircle className="h-4 w-4 text-fitway-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{confirmedSessions}</div>
              <p className="text-xs text-white/70">esta semana</p>
            </CardContent>
          </Card>

          <Card className="bg-dashboard-card border-dashboard-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-dashboard-fg">Horários Disponíveis</CardTitle>
              <Clock className="h-4 w-4 text-fitway-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{availableSlots}</div>
              <p className="text-xs text-white/70">para agendamento</p>
            </CardContent>
          </Card>

          <Card className="bg-dashboard-card border-dashboard-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-dashboard-fg">Hoje</CardTitle>
              <Calendar className="h-4 w-4 text-fitway-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{todaySlots.length}</div>
              <p className="text-xs text-white/70">horários programados</p>
            </CardContent>
          </Card>
        </div>

        {/* Schedule by Date */}
        <div className="space-y-6">
          {Object.entries(groupedSlots).map(([date, dateSlots]) => (
            <Card key={date} className="bg-dashboard-card border-dashboard-border">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-fitway-green" />
                  {new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(dateSlots as any[]).map((slot: any) => (
                    <div 
                      key={slot.id} 
                      className="p-4 bg-dashboard-bg/50 rounded-lg border border-dashboard-border/50"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-fitway-green" />
                          <span className="text-white font-medium">
                            {slot.startTime} - {slot.endTime}
                          </span>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getStatusColor(slot.status).replace('bg-', 'border-').replace('bg-', 'text-')}`}
                        >
                          {getStatusText(slot.status)}
                        </Badge>
                      </div>

                      {slot.clientName ? (
                        <div className="mb-3">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="h-4 w-4 text-fitway-green" />
                            <span className="text-white font-medium">{slot.clientName}</span>
                          </div>
                          <p className="text-white/60 text-sm ml-6">{slot.clientEmail}</p>
                        </div>
                      ) : (
                        <div className="mb-3">
                          <p className="text-white/60 text-sm">Horário disponível para agendamento</p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1 border-dashboard-border text-white hover:bg-dashboard-border">
                          <Edit className="mr-1 h-3 w-3" />
                          Editar
                        </Button>
                        <Button size="sm" variant="outline" className="border-red-500 text-red-500 hover:bg-red-500/10">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {Object.keys(groupedSlots).length === 0 && (
          <Card className="bg-dashboard-card border-dashboard-border">
            <CardContent className="text-center py-12">
              <Clock className="h-16 w-16 text-white/50 mx-auto mb-4" />
              <h3 className="text-white text-lg font-medium mb-2">Nenhum horário cadastrado</h3>
              <p className="text-white/60 mb-6">Comece criando seus horários disponíveis para agendamento</p>
              <Button className="bg-fitway-green hover:bg-fitway-green/90 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeiro Horário
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PersonalSlots;