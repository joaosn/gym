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
  Users, 
  Calendar,
  DollarSign,
  Star
} from 'lucide-react';

const AdminPlans = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleDelete = async (planId: string, planName: string) => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: "Plano removido!",
        description: `${planName} foi removido com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao remover o plano.",
        variant: "destructive",
      });
    }
  };
  // Mock data - would come from API
  const plans = [
    {
      id: '1',
      name: 'Fit Basic',
      price: 89.90,
      subscribers: 45,
      status: 'active',
      benefits: ['2 reservas futuras', '1 aula/semana', 'Acesso às quadras'],
      futureBookingsLimit: 2,
      includedClasses: 4
    },
    {
      id: '2', 
      name: 'Fit Plus',
      price: 149.90,
      subscribers: 67,
      status: 'active',
      benefits: ['4 reservas futuras', '2 aulas/semana', 'Personal 1x/mês', 'Desconto equipamentos'],
      futureBookingsLimit: 4,
      includedClasses: 8
    },
    {
      id: '3',
      name: 'Fit Premium',
      price: 249.90,
      subscribers: 23,
      status: 'active', 
      benefits: ['Reservas ilimitadas', 'Aulas ilimitadas', 'Personal 2x/mês', 'Acesso VIP'],
      futureBookingsLimit: -1,
      includedClasses: -1
    },
    {
      id: '4',
      name: 'Fit Student',
      price: 59.90,
      subscribers: 12,
      status: 'inactive',
      benefits: ['1 reserva futura', '1 aula quinzenal', 'Desconto estudante'],
      futureBookingsLimit: 1,
      includedClasses: 2
    }
  ];

  const totalRevenue = plans
    .filter(plan => plan.status === 'active')
    .reduce((sum, plan) => sum + (plan.price * plan.subscribers), 0);

  return (
    <div className="min-h-screen bg-dashboard-bg text-dashboard-fg">
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Gestão de Planos</h1>
            <p className="text-white/80">Gerencie os planos de assinatura do FITWAY</p>
          </div>
          <Button className="bg-fitway-green hover:bg-fitway-green/90 text-white" onClick={() => navigate('/admin/planos/novo')}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Plano
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-dashboard-card border-dashboard-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-dashboard-fg">Total de Planos</CardTitle>
              <Star className="h-4 w-4 text-fitway-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{plans.length}</div>
              <p className="text-xs text-white/70">
                {plans.filter(p => p.status === 'active').length} ativos
              </p>
            </CardContent>
          </Card>

          <Card className="bg-dashboard-card border-dashboard-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-dashboard-fg">Assinantes</CardTitle>
              <Users className="h-4 w-4 text-fitway-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {plans.reduce((sum, plan) => sum + plan.subscribers, 0)}
              </div>
              <p className="text-xs text-white/70">total de assinantes</p>
            </CardContent>
          </Card>

          <Card className="bg-dashboard-card border-dashboard-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-dashboard-fg">Receita Mensal</CardTitle>
              <DollarSign className="h-4 w-4 text-fitway-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-white/70">receita recorrente</p>
            </CardContent>
          </Card>

          <Card className="bg-dashboard-card border-dashboard-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-dashboard-fg">Plano Popular</CardTitle>
              <Calendar className="h-4 w-4 text-fitway-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">Fit Plus</div>
              <p className="text-xs text-white/70">67 assinantes</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-white/50" />
            <Input
              placeholder="Buscar planos..."
              className="pl-10 bg-dashboard-card border-dashboard-border text-white placeholder:text-white/50"
            />
          </div>
        </div>

        {/* Plans List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <Card key={plan.id} className="bg-dashboard-card border-dashboard-border">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-white text-xl">{plan.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-2xl font-bold text-fitway-green">
                        R$ {plan.price.toFixed(2)}
                      </span>
                      <span className="text-white/60">/mês</span>
                      <Badge 
                        variant={plan.status === 'active' ? 'default' : 'secondary'}
                        className={plan.status === 'active' ? 'bg-fitway-green text-white' : ''}
                      >
                        {plan.status === 'active' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-dashboard-border text-white hover:bg-dashboard-border"
                      onClick={() => navigate(`/admin/planos/editar/${plan.id}`)}
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
                            Deseja realmente remover o plano <span className="font-semibold text-white">{plan.name}</span>? 
                            Esta ação não pode ser desfeita e afetará todos os assinantes.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-dashboard-border border-dashboard-border text-white hover:bg-dashboard-border/80">
                            Cancelar
                          </AlertDialogCancel>
                          <AlertDialogAction 
                            className="bg-red-500 hover:bg-red-600 text-white"
                            onClick={() => handleDelete(plan.id, plan.name)}
                          >
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Assinantes:</span>
                    <span className="text-white font-medium">{plan.subscribers}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Receita mensal:</span>
                    <span className="text-white font-medium">
                      R$ {(plan.price * plan.subscribers).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div>
                    <span className="text-white/70 text-sm block mb-2">Benefícios:</span>
                    <div className="flex flex-wrap gap-1">
                      {plan.benefits.map((benefit, index) => (
                        <Badge key={index} variant="outline" className="text-xs border-fitway-green/50 text-fitway-green">
                          {benefit}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-dashboard-border">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-white/70">Reservas futuras:</span>
                        <p className="text-white font-medium">
                          {plan.futureBookingsLimit === -1 ? 'Ilimitadas' : plan.futureBookingsLimit}
                        </p>
                      </div>
                      <div>
                        <span className="text-white/70">Aulas/mês:</span>
                        <p className="text-white font-medium">
                          {plan.includedClasses === -1 ? 'Ilimitadas' : plan.includedClasses}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPlans;