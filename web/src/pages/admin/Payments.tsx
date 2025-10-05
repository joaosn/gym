import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter,
  Download,
  DollarSign,
  CreditCard,
  AlertCircle,
  TrendingUp,
  Calendar
} from 'lucide-react';

const AdminPayments = () => {
  // Mock data - would come from API
  const payments = [
    {
      id: '1',
      type: 'subscription',
      referenceId: 'SUB-001',
      customerName: 'João Silva',
      customerEmail: 'joao@email.com',
      description: 'Plano Fit Plus - Janeiro 2024',
      amount: 149.90,
      status: 'paid',
      method: 'pix',
      createdAt: '2024-01-15T10:30:00Z',
      paidAt: '2024-01-15T10:32:00Z'
    },
    {
      id: '2',
      type: 'court_booking',
      referenceId: 'COURT-002',
      customerName: 'Maria Santos',
      customerEmail: 'maria@email.com',
      description: 'Reserva Quadra Alecrim - Beach Tennis',
      amount: 80.00,
      status: 'pending',
      method: 'card',
      createdAt: '2024-01-20T14:15:00Z',
      paidAt: null
    },
    {
      id: '3',
      type: 'trainer_session',
      referenceId: 'TRAINER-003',
      customerName: 'Pedro Costa',
      customerEmail: 'pedro@email.com',
      description: 'Personal Training - Prof. Carlos',
      amount: 120.00,
      status: 'paid',
      method: 'card',
      createdAt: '2024-01-18T09:00:00Z',
      paidAt: '2024-01-18T09:01:00Z'
    },
    {
      id: '4',
      type: 'subscription',
      referenceId: 'SUB-004',
      customerName: 'Ana Oliveira',
      customerEmail: 'ana@email.com',
      description: 'Plano Fit Basic - Janeiro 2024',
      amount: 89.90,
      status: 'failed',
      method: 'card',
      createdAt: '2024-01-10T16:45:00Z',
      paidAt: null
    },
    {
      id: '5',
      type: 'court_booking',
      referenceId: 'COURT-005',
      customerName: 'Carlos Mendes',
      customerEmail: 'carlos@email.com',
      description: 'Reserva Quadra Central - FTV',
      amount: 60.00,
      status: 'refunded',
      method: 'pix',
      createdAt: '2024-01-12T11:20:00Z',
      paidAt: '2024-01-12T11:22:00Z'
    }
  ];

  const totalRevenue = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
  const failedCount = payments.filter(p => p.status === 'failed').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      case 'refunded': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Pago';
      case 'pending': return 'Pendente';
      case 'failed': return 'Falhou';
      case 'refunded': return 'Reembolsado';
      default: return status;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'subscription': return 'Assinatura';
      case 'court_booking': return 'Reserva de Quadra';
      case 'trainer_session': return 'Personal Training';
      default: return type;
    }
  };

  const getMethodText = (method: string) => {
    switch (method) {
      case 'pix': return 'PIX';
      case 'card': return 'Cartão';
      case 'cash': return 'Dinheiro';
      default: return method;
    }
  };

  return (
    <div className="min-h-screen bg-dashboard-bg text-dashboard-fg">
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Gestão de Pagamentos</h1>
            <p className="text-white/80">Monitore todos os pagamentos do FITWAY</p>
          </div>
          <Button className="bg-fitway-green hover:bg-fitway-green/90 text-white">
            <Download className="mr-2 h-4 w-4" />
            Exportar Relatório
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-dashboard-card border-dashboard-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-dashboard-fg">Receita Total</CardTitle>
              <DollarSign className="h-4 w-4 text-fitway-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-white/70">pagamentos confirmados</p>
            </CardContent>
          </Card>

          <Card className="bg-dashboard-card border-dashboard-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-dashboard-fg">Pendentes</CardTitle>
              <Calendar className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                R$ {pendingAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-white/70">aguardando pagamento</p>
            </CardContent>
          </Card>

          <Card className="bg-dashboard-card border-dashboard-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-dashboard-fg">Transações</CardTitle>
              <CreditCard className="h-4 w-4 text-fitway-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{payments.length}</div>
              <p className="text-xs text-white/70">este mês</p>
            </CardContent>
          </Card>

          <Card className="bg-dashboard-card border-dashboard-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-dashboard-fg">Falharam</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{failedCount}</div>
              <p className="text-xs text-white/70">pagamentos falharam</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-white/50" />
            <Input
              placeholder="Buscar por cliente, ID ou descrição..."
              className="pl-10 bg-dashboard-card border-dashboard-border text-white placeholder:text-white/50"
            />
          </div>
          <Button variant="outline" className="border-dashboard-border text-white hover:bg-dashboard-border">
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
        </div>

        {/* Payments Table */}
        <Card className="bg-dashboard-card border-dashboard-border">
          <CardHeader>
            <CardTitle className="text-white">Histórico de Pagamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 bg-dashboard-bg/50 rounded-lg border border-dashboard-border/50">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(payment.status)}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-white font-medium">{payment.customerName}</h4>
                        <Badge variant="outline" className="text-xs border-fitway-green/50 text-fitway-green">
                          {getTypeText(payment.type)}
                        </Badge>
                      </div>
                      <p className="text-white/70 text-sm">{payment.description}</p>
                      <p className="text-white/50 text-xs">{payment.customerEmail}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-bold">
                        R$ {payment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getStatusColor(payment.status).replace('bg-', 'border-').replace('bg-', 'text-')}`}
                      >
                        {getStatusText(payment.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/60">
                      <span>{getMethodText(payment.method)}</span>
                      <span>•</span>
                      <span>{new Date(payment.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                    {payment.paidAt && (
                      <p className="text-xs text-fitway-green">
                        Pago em {new Date(payment.paidAt).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPayments;