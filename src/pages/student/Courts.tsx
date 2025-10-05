import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Users,
  Zap,
  Filter,
  Search
} from 'lucide-react';

const StudentCourts = () => {
  const [selectedCourt, setSelectedCourt] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSport, setSelectedSport] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const courts = [
    {
      id: '1',
      name: 'Quadra Alecrim',
      location: 'Setor Alecrim - Quadra de Areia',
      sports: ['Beach Tennis', 'FTV'],
      features: ['Iluminação LED', 'Areia Premium', 'Vestiário'],
      rating: 4.8,
      image: '/api/placeholder/400/200'
    },
    {
      id: '2',
      name: 'Quadra Cotafacil',
      location: 'Próximo ao Cotafacil - Quadra de Areia',
      sports: ['Beach Tennis', 'FTV'],
      features: ['Cobertura', 'Areia Premium', 'Som Ambiente', 'Estacionamento'],
      rating: 4.6,
      image: '/api/placeholder/400/200'
    },
    {
      id: '3',
      name: 'Quadra Castelini',
      location: 'Bairro Castelini - Quadra de Areia',
      sports: ['Beach Tennis', 'FTV'],
      features: ['Vista Panorâmica', 'Areia Premium', 'Área de Descanso', 'Lanchonete'],
      rating: 4.9,
      image: '/api/placeholder/400/200'
    }
  ];

  const sports = ['Beach Tennis', 'FTV'];

  // Mock availability data
  const getAvailabilityForCourt = (courtId: string, date: string) => {
    const baseSlots = [];
    for (let hour = 6; hour <= 23; hour++) {
      const time = `${hour.toString().padStart(2, '0')}:00`;
      const isAvailable = Math.random() > 0.3; // 70% chance of being available
      const price = 40; // Student price
      
      baseSlots.push({
        time,
        available: isAvailable,
        price,
        bookedBy: isAvailable ? null : 'Outro usuário'
      });
    }
    return baseSlots;
  };

  const [availability, setAvailability] = useState<any>({});

  useEffect(() => {
    if (selectedCourt && selectedDate) {
      const slots = getAvailabilityForCourt(selectedCourt, selectedDate);
      setAvailability({ [selectedCourt]: slots });
    }
  }, [selectedCourt, selectedDate]);

  const handleBooking = (courtId: string, time: string) => {
    console.log('Booking court:', courtId, 'at', time);
    // Here would be the actual booking logic
  };

  const filteredCourts = courts.filter(court => {
    const matchesSearch = court.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         court.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSport = !selectedSport || court.sports.includes(selectedSport);
    return matchesSearch && matchesSport;
  });

  return (
    <div className="min-h-screen bg-dashboard-bg text-dashboard-fg">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Reservar Quadras</h1>
          <p className="text-white/80">Escolha uma quadra e horário para sua próxima partida</p>
        </div>

        {/* Filters */}
        <Card className="mb-6 bg-dashboard-card border-dashboard-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Filter className="h-5 w-5 text-fitway-green" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Buscar Quadra</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                  <Input
                    placeholder="Nome ou localização..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-fitway-light border-fitway-green/30 text-white placeholder:text-white/50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-white">Esporte</Label>
                <Select value={selectedSport} onValueChange={setSelectedSport}>
                  <SelectTrigger className="bg-fitway-light border-fitway-green/30 text-white">
                    <SelectValue placeholder="Todos os esportes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os esportes</SelectItem>
                    {sports.map(sport => (
                      <SelectItem key={sport} value={sport}>{sport}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-white">Data</Label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="bg-fitway-light border-fitway-green/30 text-white"
                />
              </div>
              <div className="flex items-end">
                <Button 
                  variant="sport" 
                  className="w-full"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedSport('');
                    setSelectedDate(new Date().toISOString().split('T')[0]);
                  }}
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Courts Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Courts List */}
          <div className="lg:col-span-2 space-y-6">
            {filteredCourts.map((court) => (
              <Card key={court.id} className="bg-dashboard-card border-dashboard-border">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <MapPin className="h-5 w-5 text-fitway-green" />
                        {court.name}
                      </CardTitle>
                      <p className="text-white/70">{court.location}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-fitway-green">★</span>
                        <span className="text-white">{court.rating}</span>
                      </div>
                      <div className="text-2xl font-bold text-fitway-green">R$ 40/h</div>
                      <div className="text-xs text-white/70">preço de aluno</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Court Image Placeholder */}
                  <div className="w-full h-32 bg-fitway-light/20 rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-white/50">Foto da Quadra</span>
                  </div>

                  {/* Sports */}
                  <div className="mb-4">
                    <h4 className="text-white font-medium mb-2">Esportes:</h4>
                    <div className="flex gap-2 flex-wrap">
                      {court.sports.map(sport => (
                        <Badge key={sport} variant="outline" className="border-fitway-green text-fitway-green">
                          {sport}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mb-4">
                    <h4 className="text-white font-medium mb-2">Características:</h4>
                    <div className="flex gap-2 flex-wrap">
                      {court.features.map(feature => (
                        <span key={feature} className="text-xs bg-fitway-light/20 px-2 py-1 rounded text-white/80">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Button 
                    variant="sport" 
                    className="w-full"
                    onClick={() => setSelectedCourt(court.id)}
                  >
                    {selectedCourt === court.id ? 'Selecionada' : 'Selecionar Quadra'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Booking Panel */}
          <div className="space-y-6">
            <Card className="bg-dashboard-card border-dashboard-border sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Calendar className="h-5 w-5 text-fitway-green" />
                  Horários Disponíveis
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedCourt && selectedDate ? (
                  <div>
                    <div className="mb-4 p-3 bg-fitway-green/10 rounded-lg border border-fitway-green/30">
                      <p className="text-white font-medium">
                        {courts.find(c => c.id === selectedCourt)?.name}
                      </p>
                      <p className="text-white/70 text-sm">
                        {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </p>
                    </div>

                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {availability[selectedCourt]?.map((slot: any) => (
                        <div 
                          key={slot.time}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            slot.available 
                              ? 'bg-dashboard-bg/50 border-fitway-green/30 hover:border-fitway-green/60 cursor-pointer' 
                              : 'bg-red-500/10 border-red-500/30 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Clock className="h-4 w-4 text-fitway-green" />
                            <span className="text-white font-medium">{slot.time}</span>
                          </div>
                          <div className="text-right">
                            {slot.available ? (
                              <Button
                                size="sm"
                                variant="sport"
                                onClick={() => handleBooking(selectedCourt, slot.time)}
                              >
                                R$ {slot.price}
                              </Button>
                            ) : (
                              <span className="text-red-400 text-sm">Ocupado</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-white/50 mx-auto mb-4" />
                    <p className="text-white/70">Selecione uma quadra para ver os horários</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card className="bg-dashboard-card border-dashboard-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Zap className="h-5 w-5 text-fitway-green" />
                  Benefícios do Aluno
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-fitway-green rounded-full"></span>
                    <span className="text-white/80">Preço especial: R$ 40/hora</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-fitway-green rounded-full"></span>
                    <span className="text-white/80">Cancelamento sem multa</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-fitway-green rounded-full"></span>
                    <span className="text-white/80">Reservas antecipadas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-fitway-green rounded-full"></span>
                    <span className="text-white/80">Suporte prioritário</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentCourts;