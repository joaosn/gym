import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Calendar, 
  Clock, 
  User,
  Star,
  DollarSign,
  Filter,
  MessageCircle
} from 'lucide-react';

const StudentPersonal = () => {
  // Mock data - would come from API
  const myTrainingSessions = [
    {
      id: '1',
      trainer: {
        name: 'Carlos Silva',
        rating: 4.8,
        specialties: ['Beach Tennis', 'FTV']
      },
      date: '2024-01-31T16:00:00Z',
      status: 'scheduled',
      price: 120.00
    }
  ];

  const availableTrainers = [
    {
      id: '1',
      name: 'Carlos Silva',
      specialties: ['Beach Tennis', 'FTV', 'Condicionamento Físico'],
      pricePerSession: 120.00,
      rating: 4.8,
      experience: '8 anos',
      bio: 'Personal trainer especializado em esportes de raquete. Formado em Educação Física com especialização em alto rendimento.',
      availableSlots: 12,
      image: null
    },
    {
      id: '2',
      name: 'Ana Santos',
      specialties: ['FTV', 'Futsal', 'Preparação Física'],
      pricePerSession: 100.00,
      rating: 4.9,
      experience: '6 anos',
      bio: 'Especialista em FTV e preparação física. Atua com atletas de diversos níveis, do iniciante ao avançado.',
      availableSlots: 8,
      image: null
    },
    {
      id: '3',
      name: 'João Mendes',
      specialties: ['Beach Tennis', 'FTV', 'Aulas Kids'],
      pricePerSession: 80.00,
      rating: 4.7,
      experience: '5 anos',
      bio: 'Personal com grande experiência em ensino para crianças e adultos. Metodologia didática e divertida.',
      availableSlots: 15,
      image: null
    },
    {
      id: '4',
      name: 'Maria Costa',
      specialties: ['Beach Tennis', 'FTV'],
      pricePerSession: 140.00,
      rating: 4.6,
      experience: '10 anos',
      bio: 'Ex-atleta profissional de beach tennis. Especializada em técnica avançada e preparação para competições.',
      availableSlots: 6,
      image: null
    }
  ];

  return (
    <div className="min-h-screen bg-dashboard-bg text-dashboard-fg">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Personal Training</h1>
          <p className="text-white/80">Treine com os melhores personal trainers do FITWAY</p>
        </div>

        {/* My Training Sessions */}
        {myTrainingSessions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Minhas Sessões</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {myTrainingSessions.map((session) => (
                <Card key={session.id} className="bg-dashboard-card border-dashboard-border border-fitway-green/50">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-white text-lg">{session.trainer.name}</CardTitle>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-white text-sm">{session.trainer.rating}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-fitway-green text-fitway-green">
                        Agendado
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <span className="text-white/70 text-sm block mb-1">Data e horário:</span>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-fitway-green" />
                          <span className="text-white">
                            {new Date(session.date).toLocaleDateString('pt-BR')} às{' '}
                            {new Date(session.date).toLocaleTimeString('pt-BR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-white/70 text-sm block mb-1">Especialidades:</span>
                        <div className="flex flex-wrap gap-1">
                          {session.trainer.specialties.map((specialty, index) => (
                            <Badge key={index} variant="outline" className="text-xs border-fitway-green/50 text-fitway-green">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-dashboard-border">
                        <span className="text-fitway-green font-bold">
                          R$ {session.price.toFixed(2)}
                        </span>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="border-dashboard-border text-white hover:bg-dashboard-border">
                            <MessageCircle className="mr-1 h-3 w-3" />
                            Chat
                          </Button>
                          <Button variant="outline" size="sm" className="border-red-500 text-red-500 hover:bg-red-500/10">
                            Cancelar
                          </Button>
                        </div>
                      </div>
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
              placeholder="Buscar personal trainers por especialidade..."
              className="pl-10 bg-dashboard-card border-dashboard-border text-white placeholder:text-white/50"
            />
          </div>
          <Button variant="outline" className="border-dashboard-border text-white hover:bg-dashboard-border">
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
        </div>

        {/* Available Trainers */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Personal Trainers Disponíveis</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {availableTrainers.map((trainer) => (
              <Card key={trainer.id} className="bg-dashboard-card border-dashboard-border">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-fitway-green/20 rounded-full flex items-center justify-center">
                      <User className="h-8 w-8 text-fitway-green" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-white text-lg">{trainer.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-white text-sm">{trainer.rating}</span>
                        </div>
                        <span className="text-white/60 text-sm">• {trainer.experience}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-fitway-green font-bold text-lg">
                        R$ {trainer.pricePerSession.toFixed(2)}
                      </div>
                      <span className="text-white/60 text-sm">/sessão</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-white/80 text-sm">{trainer.bio}</p>

                    <div>
                      <span className="text-white/70 text-sm block mb-2">Especialidades:</span>
                      <div className="flex flex-wrap gap-1">
                        {trainer.specialties.map((specialty, index) => (
                          <Badge key={index} variant="outline" className="text-xs border-fitway-green/50 text-fitway-green">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-fitway-green" />
                        <span className="text-white">{trainer.availableSlots} horários disponíveis</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-dashboard-border">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 border-dashboard-border text-white hover:bg-dashboard-border"
                      >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Conversar
                      </Button>
                      <Button 
                        className="flex-1 bg-fitway-green hover:bg-fitway-green/90 text-white"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        Agendar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="bg-dashboard-card border-dashboard-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-dashboard-fg">Sessões Este Mês</CardTitle>
              <Calendar className="h-4 w-4 text-fitway-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {myTrainingSessions.length}
              </div>
              <p className="text-xs text-white/70">sessões agendadas</p>
            </CardContent>
          </Card>

          <Card className="bg-dashboard-card border-dashboard-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-dashboard-fg">Personal Trainers</CardTitle>
              <User className="h-4 w-4 text-fitway-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{availableTrainers.length}</div>
              <p className="text-xs text-white/70">profissionais disponíveis</p>
            </CardContent>
          </Card>

          <Card className="bg-dashboard-card border-dashboard-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-dashboard-fg">Preço Médio</CardTitle>
              <DollarSign className="h-4 w-4 text-fitway-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                R$ {(availableTrainers.reduce((sum, t) => sum + t.pricePerSession, 0) / availableTrainers.length).toFixed(0)}
              </div>
              <p className="text-xs text-white/70">por sessão</p>
            </CardContent>
          </Card>
        </div>

        {availableTrainers.length === 0 && (
          <Card className="bg-dashboard-card border-dashboard-border">
            <CardContent className="text-center py-12">
              <User className="h-16 w-16 text-white/50 mx-auto mb-4" />
              <h3 className="text-white text-lg font-medium mb-2">Nenhum personal trainer disponível</h3>
              <p className="text-white/60">Novos profissionais serão adicionados em breve</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StudentPersonal;