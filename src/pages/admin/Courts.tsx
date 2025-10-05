import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Calendar,
  MapPin,
  Activity,
  Clock
} from 'lucide-react';

const AdminCourts = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleDelete = async (courtId: string, courtName: string) => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: "Quadra removida!",
        description: `${courtName} foi removida com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao remover a quadra.",
        variant: "destructive",
      });
    }
  };
  // Mock data - would come from API
  const courts = [
    {
      id: '1',
      name: 'Quadra Alecrim',
      location: 'Setor Principal',
      isActive: true,
      todayBookings: 8,
      occupancyRate: 75,
      sports: ['Beach Tennis', 'FTV'],
      nextBooking: '14:00 - Beach Tennis'
    },
    {
      id: '2',
      name: 'Quadra Cotafacil', 
      location: 'Setor Norte',
      isActive: true,
      todayBookings: 6,
      occupancyRate: 60,
      sports: ['Beach Tennis', 'FTV'],
      nextBooking: '15:30 - FTV'
    },
    {
      id: '3',
      name: 'Quadra Central',
      location: 'Setor Principal',
      isActive: true,
      todayBookings: 10,
      occupancyRate: 90,
      sports: ['Beach Tennis', 'FTV'],
      nextBooking: '13:00 - Beach Tennis'
    },
    {
      id: '4',
      name: 'Quadra Sul',
      location: 'Setor Sul',
      isActive: false,
      todayBookings: 0,
      occupancyRate: 0,
      sports: ['FTV'],
      nextBooking: null
    }
  ];

  const totalBookingsToday = courts.reduce((sum, court) => sum + court.todayBookings, 0);
  const avgOccupancy = courts.filter(c => c.isActive).reduce((sum, court) => sum + court.occupancyRate, 0) / courts.filter(c => c.isActive).length;

  return (
    <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Gestão de Quadras</h1>
            <p className="text-white/80">Gerencie as quadras esportivas do FITWAY</p>
          </div>
          <Button className="bg-fitway-green hover:bg-fitway-green/90 text-white" onClick={() => navigate('/admin/quadras/novo')}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Quadra
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-dashboard-card border-dashboard-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-dashboard-fg">Total de Quadras</CardTitle>
              <MapPin className="h-4 w-4 text-fitway-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{courts.length}</div>
              <p className="text-xs text-white/70">
                {courts.filter(c => c.isActive).length} ativas
              </p>
            </CardContent>
          </Card>

          <Card className="bg-dashboard-card border-dashboard-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-dashboard-fg">Reservas Hoje</CardTitle>
              <Calendar className="h-4 w-4 text-fitway-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalBookingsToday}</div>
              <p className="text-xs text-white/70">reservas confirmadas</p>
            </CardContent>
          </Card>

          <Card className="bg-dashboard-card border-dashboard-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-dashboard-fg">Ocupação Média</CardTitle>
              <Activity className="h-4 w-4 text-fitway-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{Math.round(avgOccupancy)}%</div>
              <p className="text-xs text-white/70">taxa de ocupação</p>
            </CardContent>
          </Card>

          <Card className="bg-dashboard-card border-dashboard-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-dashboard-fg">Próximo Horário</CardTitle>
              <Clock className="h-4 w-4 text-fitway-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">13:00</div>
              <p className="text-xs text-white/70">Quadra Central</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-white/50" />
            <Input
              placeholder="Buscar quadras..."
              className="pl-10 bg-dashboard-card border-dashboard-border text-white placeholder:text-white/50"
            />
          </div>
        </div>

        {/* Courts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {courts.map((court) => (
            <Card key={court.id} className="bg-dashboard-card border-dashboard-border">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-white text-xl">{court.name}</CardTitle>
                    <p className="text-white/60 mt-1">{court.location}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={court.isActive ? 'default' : 'secondary'}
                      className={court.isActive ? 'bg-fitway-green text-white' : ''}
                    >
                      {court.isActive ? 'Ativa' : 'Inativa'}
                    </Badge>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-dashboard-border text-white hover:bg-dashboard-border"
                        onClick={() => navigate(`/admin/quadras/editar/${court.id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline" className="border-red-500 text-red-500 hover:bg-red-500/10">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-dashboard-card border-dashboard-border">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription className="text-white/70">
                              Deseja realmente remover a quadra <span className="font-semibold text-white">{court.name}</span>? 
                              Esta ação não pode ser desfeita e afetará todas as reservas.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-dashboard-border border-dashboard-border text-white hover:bg-dashboard-border/80">
                              Cancelar
                            </AlertDialogCancel>
                            <AlertDialogAction 
                              className="bg-red-500 hover:bg-red-600 text-white"
                              onClick={() => handleDelete(court.id, court.name)}
                            >
                              Remover
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-white/70 text-sm">Reservas hoje:</span>
                      <p className="text-white font-medium text-lg">{court.todayBookings}</p>
                    </div>
                    <div>
                      <span className="text-white/70 text-sm">Taxa ocupação:</span>
                      <p className="text-white font-medium text-lg">{court.occupancyRate}%</p>
                    </div>
                  </div>

                  <div className="w-full bg-dashboard-bg rounded-full h-2">
                    <div 
                      className="bg-fitway-green h-2 rounded-full transition-all duration-300"
                      style={{ width: `${court.occupancyRate}%` }}
                    />
                  </div>

                  <div>
                    <span className="text-white/70 text-sm block mb-2">Esportes disponíveis:</span>
                    <div className="flex flex-wrap gap-1">
                      {court.sports.map((sport, index) => (
                        <Badge key={index} variant="outline" className="text-xs border-fitway-green/50 text-fitway-green">
                          {sport}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {court.nextBooking && (
                    <div className="pt-4 border-t border-dashboard-border">
                      <span className="text-white/70 text-sm">Próxima reserva:</span>
                      <p className="text-white font-medium">{court.nextBooking}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1 border-fitway-green text-fitway-green hover:bg-fitway-green/10">
                      <Calendar className="mr-2 h-4 w-4" />
                      Ver Agenda
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 border-dashboard-border text-white hover:bg-dashboard-border">
                      <Activity className="mr-2 h-4 w-4" />
                      Relatório
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

export default AdminCourts;