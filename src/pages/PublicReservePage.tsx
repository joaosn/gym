import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Zap, Clock, MapPin, Users } from 'lucide-react';
import { courtsService } from '@/services/courts.service';
import { Court, CourtAvailability } from '@/types';
import { useToast } from '@/hooks/use-toast';

const PublicReservePage = () => {
  const [courts, setCourts] = useState<Court[]>([]);
  const [selectedCourt, setSelectedCourt] = useState<string>('');
  const [availability, setAvailability] = useState<CourtAvailability | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState('1');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const [guestData, setGuestData] = useState({
    name: '',
    email: '',
    phone: '',
    sport: ''
  });

  const sports = ['Beach Tennis', 'FTV'];

  useEffect(() => {
    loadCourts();
  }, []);

  useEffect(() => {
    if (selectedCourt && selectedDate) {
      loadAvailability();
    }
  }, [selectedCourt, selectedDate]);

  const loadCourts = async () => {
    try {
      const courtsData = await courtsService.getPublicCourts();
      setCourts(courtsData);
    } catch (error) {
      console.error('Error loading courts:', error);
      // Mock data for demonstration
      setCourts([
        { id: '1', name: 'Quadra Alecrim', location: 'Setor Alecrim', isActive: true },
        { id: '2', name: 'Quadra Cotafacil', location: 'Próx. Cotafacil', isActive: true },
        { id: '3', name: 'Quadra Castelini', location: 'Bairro Castelini', isActive: true }
      ]);
    }
  };

  const loadAvailability = async () => {
    try {
      const availabilityData = await courtsService.getPublicCourtAvailability(selectedCourt, selectedDate);
      setAvailability(availabilityData);
    } catch (error) {
      console.error('Error loading availability:', error);
      // Mock availability
      const times = [];
      for (let hour = 6; hour <= 23; hour++) {
        times.push(`${hour.toString().padStart(2, '0')}:00`);
      }
      setAvailability({
        date: selectedDate,
        availableSlots: times
      });
    }
  };

  const calculatePrice = () => {
    const hours = parseInt(duration);
    const pricePerHour = 45; // Non-member price
    return hours * pricePerHour;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!selectedTime || !guestData.name || !guestData.email || !guestData.sport) {
      setError('Por favor, preencha todos os campos obrigatórios');
      setIsLoading(false);
      return;
    }

    try {
      const startHour = parseInt(selectedTime.split(':')[0]);
      const endHour = startHour + parseInt(duration);
      
      const booking = await courtsService.createPublicBooking({
        courtId: selectedCourt,
        date: selectedDate,
        startTime: selectedTime,
        endTime: `${endHour.toString().padStart(2, '0')}:00`,
        sport: guestData.sport,
        guestName: guestData.name,
        guestEmail: guestData.email,
        guestPhone: guestData.phone
      });

      toast({
        title: 'Reserva criada com sucesso!',
        description: 'Você receberá as informações de pagamento por email.',
      });

      // Reset form
      setGuestData({ name: '', email: '', phone: '', sport: '' });
      setSelectedTime('');
      
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Erro ao criar reserva. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-fitway-dark/95 backdrop-blur-sm border-b border-fitway-green/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Zap className="h-8 w-8 text-fitway-green" />
            <span className="text-2xl font-bold text-white">FITWAY</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" className="border-fitway-green text-fitway-green hover:bg-fitway-green hover:text-fitway-dark" onClick={() => window.location.href = '/login'}>
              Já sou aluno
            </Button>
            <Button variant="sport" size="sm" onClick={() => window.location.href = '/register'}>
              Cadastrar-se
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Reserve uma Quadra</h1>
            <p className="text-xl text-white/80">
              Faça sua reserva avulsa e venha jogar na FITWAY
            </p>
            <div className="mt-4 p-4 bg-fitway-green/10 rounded-lg border border-fitway-green/30">
              <p className="text-white font-semibold">
                Preço para não-alunos: <span className="text-2xl text-fitway-green">R$ 45/hora</span>
              </p>
              <p className="text-sm text-white/70 mt-1">
                Alunos pagam apenas R$ 40/hora. <Link to="/login" className="text-fitway-green underline">Faça login</Link> ou <Link to="/register" className="text-fitway-green underline">cadastre-se</Link>
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Reservation Form */}
            <Card className="sport-card bg-card/90 backdrop-blur-sm border-fitway-green/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Clock className="h-5 w-5 text-fitway-green" />
                  Dados da Reserva
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">Quadra</Label>
                      <Select value={selectedCourt} onValueChange={setSelectedCourt}>
                        <SelectTrigger className="bg-fitway-light border-fitway-green/30 text-white">
                          <SelectValue placeholder="Escolha uma quadra" />
                        </SelectTrigger>
                        <SelectContent>
                          {courts.map((court) => (
                            <SelectItem key={court.id} value={court.id}>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                {court.name} - {court.location}
                              </div>
                            </SelectItem>
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
                  </div>

                  {availability && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white">Horário</Label>
                        <Select value={selectedTime} onValueChange={setSelectedTime}>
                          <SelectTrigger className="bg-fitway-light border-fitway-green/30 text-white">
                            <SelectValue placeholder="Escolha o horário" />
                          </SelectTrigger>
                          <SelectContent>
                            {availability.availableSlots.map((slot) => (
                              <SelectItem key={slot} value={slot}>
                                {slot}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white">Duração</Label>
                        <Select value={duration} onValueChange={setDuration}>
                          <SelectTrigger className="bg-fitway-light border-fitway-green/30 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 hora</SelectItem>
                            <SelectItem value="2">2 horas</SelectItem>
                            <SelectItem value="3">3 horas</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-white">Esporte</Label>
                    <Select value={guestData.sport} onValueChange={(value) => setGuestData(prev => ({ ...prev, sport: value }))}>
                      <SelectTrigger className="bg-fitway-light border-fitway-green/30 text-white">
                        <SelectValue placeholder="Escolha o esporte" />
                      </SelectTrigger>
                      <SelectContent>
                        {sports.map((sport) => (
                          <SelectItem key={sport} value={sport}>
                            {sport}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Seus dados
                    </h3>
                    
                    <div className="space-y-2">
                      <Label className="text-white">Nome completo *</Label>
                      <Input
                        value={guestData.name}
                        onChange={(e) => setGuestData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Seu nome completo"
                        required
                        className="bg-fitway-light border-fitway-green/30 text-white placeholder:text-white/50"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white">Email *</Label>
                        <Input
                          type="email"
                          value={guestData.email}
                          onChange={(e) => setGuestData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="seu@email.com"
                          required
                          className="bg-fitway-light border-fitway-green/30 text-white placeholder:text-white/50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white">Telefone</Label>
                        <Input
                          type="tel"
                          value={guestData.phone}
                          onChange={(e) => setGuestData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="(44) 99999-9999"
                          className="bg-fitway-light border-fitway-green/30 text-white placeholder:text-white/50"
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="sport"
                    size="lg"
                    className="w-full"
                    disabled={isLoading || !selectedCourt || !selectedTime}
                  >
                    {isLoading ? 'Criando reserva...' : `Reservar - R$ ${calculatePrice()}`}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Summary */}
            <div className="space-y-6">
              <Card className="sport-card bg-card/90 backdrop-blur-sm border-fitway-green/30">
                <CardHeader>
                  <CardTitle className="text-white">Resumo da Reserva</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedCourt && selectedDate && selectedTime ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-white/70">Quadra:</span>
                        <span className="font-medium text-white">
                          {courts.find(c => c.id === selectedCourt)?.name}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-white/70">Data:</span>
                        <span className="font-medium text-white">
                          {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-white/70">Horário:</span>
                        <span className="font-medium text-white">
                          {selectedTime} - {selectedTime && `${parseInt(selectedTime.split(':')[0]) + parseInt(duration)}:00`}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-white/70">Duração:</span>
                        <span className="font-medium text-white">{duration}h</span>
                      </div>
                      
                      <div className="border-t border-fitway-green/30 pt-4">
                        <div className="flex justify-between items-center text-lg font-bold">
                          <span className="text-white">Total:</span>
                          <span className="text-fitway-green">R$ {calculatePrice()}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-white/70 text-center">
                      Preencha os dados para ver o resumo
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="sport-card bg-fitway-green/10 border-fitway-green/40 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-fitway-green">Vantagens de ser aluno</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-fitway-green" />
                      <span className="text-white/90">Preço especial: R$ 40/hora</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-fitway-green" />
                      <span className="text-white/90">Reservas antecipadas</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-fitway-green" />
                      <span className="text-white/90">Aulas incluídas no plano</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-fitway-green" />
                      <span className="text-white/90">Desconto em personais</span>
                    </li>
                  </ul>
                  
                  <div className="mt-4 space-y-2">
                    <Button variant="sport" size="sm" className="w-full" onClick={() => window.location.href = '/register'}>
                      Cadastrar-se
                    </Button>
                    <Button variant="outline" size="sm" className="w-full border-fitway-green text-fitway-green hover:bg-fitway-green hover:text-fitway-dark" onClick={() => window.location.href = '/login'}>
                      Já sou aluno
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicReservePage;