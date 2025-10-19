import { useState, useEffect } from 'react';
import { subscriptionsService } from '@/services/subscriptions.service';
import { plansService } from '@/services/plans.service';
import { usersService } from '@/services/users.service';
import type { Assinatura, Plan, AdminUser } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Search, User, CreditCard, Calendar, Plus } from 'lucide-react';

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState<Assinatura[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [students, setStudents] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    id_plano: 'all',
    search: '',
  });
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newSubscription, setNewSubscription] = useState({
    id_usuario: '',
    id_plano: '',
  });
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPlans();
    loadStudents();
    loadSubscriptions();
  }, []);

  const loadPlans = async () => {
    try {
      const response = await plansService.listPlans();
      setPlans(response.data.filter((p: Plan) => p.status === 'ativo'));
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar planos',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const loadStudents = async () => {
    try {
      const response = await usersService.listUsers({ papel: 'aluno', status: 'ativo' });
      setStudents(response.data);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar alunos',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const loadSubscriptions = async () => {
    setLoading(true);
    try {
      const filtersToSend: any = {};
      
      if (filters.status !== 'all') filtersToSend.status = filters.status;
      if (filters.id_plano !== 'all') filtersToSend.id_plano = filters.id_plano;
      if (filters.search) filtersToSend.search = filters.search;

      const response = await subscriptionsService.list(filtersToSend);
      setSubscriptions(response.data);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar assinaturas',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadSubscriptions();
    }, 500);
    return () => clearTimeout(timer);
  }, [filters]);

  const handleOpenCreateDialog = () => {
    setNewSubscription({ id_usuario: '', id_plano: '' });
    setShowCreateDialog(true);
  };

  const handleOpenCancelDialog = (id: string) => {
    setCancelingId(id);
    setShowCancelDialog(true);
  };

  const handleCancelSubscription = async () => {
    if (!cancelingId) return;

    try {
      // Aqui vamos usar o endpoint de cancelamento do admin
      // Por enquanto vamos usar o update para mudar o status
      await subscriptionsService.update(cancelingId, {
        status: 'cancelada',
        data_fim: new Date().toISOString().split('T')[0],
        renova_automatico: false,
      });

      toast({
        title: 'Assinatura cancelada!',
        description: 'A assinatura foi cancelada com sucesso',
      });

      setShowCancelDialog(false);
      setCancelingId(null);
      loadSubscriptions();
    } catch (error: any) {
      toast({
        title: 'Erro ao cancelar assinatura',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleCreateSubscription = async () => {
    if (!newSubscription.id_usuario || !newSubscription.id_plano) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Selecione o aluno e o plano',
        variant: 'destructive',
      });
      return;
    }

    setCreating(true);
    try {
      await subscriptionsService.adminCreate({
        id_usuario: newSubscription.id_usuario,
        id_plano: newSubscription.id_plano,
        renova_automatico: true,
      });

      toast({
        title: 'Assinatura criada com sucesso!',
        description: 'Aluno vinculado ao plano',
      });

      setShowCreateDialog(false);
      loadSubscriptions();
    } catch (error: any) {
      toast({
        title: 'Erro ao criar assinatura',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      ativa: <Badge className="bg-green-500">Ativa</Badge>,
      pendente: <Badge className="bg-yellow-500">Pendente</Badge>,
      cancelada: <Badge className="bg-red-500">Cancelada</Badge>,
      expirada: <Badge className="bg-gray-500">Expirada</Badge>,
    };
    return badges[status as keyof typeof badges] || <Badge>{status}</Badge>;
  };

  const getDaysUntilExpiry = (proximo_vencimento?: string): number | null => {
    if (!proximo_vencimento) return null;
    const today = new Date();
    const expiry = new Date(proximo_vencimento);
    const diff = expiry.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Assinaturas</h1>
        <p className="text-muted-foreground">
          Gerencie todas as assinaturas de alunos
        </p>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="pl-10"
              />
            </div>

            {/* Status */}
            <Select
              value={filters.status}
              onValueChange={(value) =>
                setFilters({ ...filters, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="ativa">Ativa</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
                <SelectItem value="expirada">Expirada</SelectItem>
              </SelectContent>
            </Select>

            {/* Plano */}
            <Select
              value={filters.id_plano}
              onValueChange={(value) =>
                setFilters({ ...filters, id_plano: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Plano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os planos</SelectItem>
                {plans.map((plan) => (
                  <SelectItem key={plan.id_plano} value={plan.id_plano}>
                    {plan.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Assinaturas */}
      {loading ? (
        <div className="text-center py-12">Carregando...</div>
      ) : subscriptions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Nenhuma assinatura encontrada com os filtros selecionados
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {subscriptions.map((subscription) => {
            const daysUntilExpiry = getDaysUntilExpiry(
              subscription.proximo_vencimento
            );

            return (
              <Card key={subscription.id_assinatura}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    {/* Informações do Usuário */}
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <span className="font-semibold">
                          {subscription.usuario?.nome || 'N/A'}
                        </span>
                        {getStatusBadge(subscription.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {subscription.usuario?.email || 'N/A'}
                      </p>
                    </div>

                    {/* Informações do Plano */}
                    <div className="space-y-2 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {subscription.plano?.nome || 'N/A'}
                        </span>
                      </div>
                      <p className="text-lg font-bold text-fitway-green">
                        {formatCurrency(subscription.plano?.preco || 0)}
                        <span className="text-sm text-muted-foreground ml-1">
                          /{subscription.plano?.ciclo_cobranca || 'mês'}
                        </span>
                      </p>
                    </div>

                    {/* Botão Cancelar (apenas para assinaturas ativas) */}
                    {subscription.status === 'ativa' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleOpenCancelDialog(subscription.id_assinatura)}
                      >
                        Cancelar
                      </Button>
                    )}
                  </div>

                  {/* Datas */}
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Data de início
                      </p>
                      <p className="font-medium">
                        {formatDate(subscription.data_inicio)}
                      </p>
                    </div>

                    {subscription.status === 'ativa' &&
                      subscription.proximo_vencimento && (
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Próximo vencimento
                          </p>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <p className="font-medium">
                              {formatDate(subscription.proximo_vencimento)}
                            </p>
                          </div>
                          {daysUntilExpiry !== null && (
                            <p
                              className={`text-xs ${
                                daysUntilExpiry < 7
                                  ? 'text-red-500'
                                  : 'text-muted-foreground'
                              }`}
                            >
                              {daysUntilExpiry > 0
                                ? `${daysUntilExpiry} dias`
                                : 'Vencido!'}
                            </p>
                          )}
                        </div>
                      )}

                    {subscription.data_fim && (
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Data de término
                        </p>
                        <p className="font-medium">
                          {formatDate(subscription.data_fim)}
                        </p>
                      </div>
                    )}

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Renova automaticamente
                      </p>
                      <p className="font-medium">
                        {subscription.renova_automatico ? 'Sim' : 'Não'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Total */}
      {!loading && subscriptions.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Total: {subscriptions.length} assinatura(s)
        </div>
      )}

      {/* Botão Flutuante - Nova Assinatura */}
      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
        size="icon"
        onClick={handleOpenCreateDialog}
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Dialog: Criar Assinatura */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vincular Aluno ao Plano</DialogTitle>
            <DialogDescription>
              Crie uma nova assinatura para um aluno
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Select Aluno */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Aluno</label>
              <Select
                value={newSubscription.id_usuario}
                onValueChange={(value) =>
                  setNewSubscription({ ...newSubscription, id_usuario: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o aluno" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem
                      key={student.id_usuario}
                      value={student.id_usuario}
                    >
                      {student.nome} ({student.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Select Plano */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Plano</label>
              <Select
                value={newSubscription.id_plano}
                onValueChange={(value) =>
                  setNewSubscription({ ...newSubscription, id_plano: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o plano" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id_plano} value={plan.id_plano}>
                      {plan.nome} - {formatCurrency(plan.preco)}/
                      {plan.ciclo_cobranca}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Info */}
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Nota:</strong> A assinatura será criada com status
                "ativa" e renovação automática habilitada.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              disabled={creating}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreateSubscription} disabled={creating}>
              {creating ? 'Criando...' : 'Criar Assinatura'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog: Confirmar Cancelamento */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Assinatura</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar esta assinatura? Esta ação não pode ser desfeita.
              O aluno perderá acesso aos benefícios do plano.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCancelingId(null)}>
              Voltar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSubscription}
              className="bg-red-500 hover:bg-red-600"
            >
              Sim, Cancelar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
