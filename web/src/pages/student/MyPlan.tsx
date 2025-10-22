import { useState, useEffect } from 'react';
import { subscriptionsService } from '@/services/subscriptions.service';
import { plansService } from '@/services/plans.service';
import type { Assinatura, Plan } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Check, X, Calendar, CreditCard, AlertTriangle } from 'lucide-react';

export default function MyPlan() {
  const [subscription, setSubscription] = useState<Assinatura | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [subscribing, setSubscribing] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [subResponse, plansResponse] = await Promise.all([
        subscriptionsService.getMySubscription(),
        plansService.listPublicPlans(),
      ]);

      setSubscription(subResponse);
      setPlans(plansResponse.data.filter((p: Plan) => p.status === 'ativo'));
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar dados',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!selectedPlan) return;

    setSubscribing(true);
    try {
      await subscriptionsService.subscribe({
        id_plano: selectedPlan.id_plano,
        renova_automatico: true,
      });

      toast({
        title: 'Assinatura criada com sucesso!',
        description: `Você agora está no plano ${selectedPlan.nome}`,
      });

      setSelectedPlan(null);
      loadData();
    } catch (error: any) {
      toast({
        title: 'Erro ao assinar plano',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSubscribing(false);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await subscriptionsService.cancel();

      toast({
        title: 'Assinatura cancelada',
        description: 'Sua assinatura foi cancelada com sucesso',
      });

      setShowCancelDialog(false);
      loadData();
    } catch (error: any) {
      toast({
        title: 'Erro ao cancelar assinatura',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setCancelling(false);
    }
  };

  const getDaysUntilExpiry = (proximo_vencimento?: string): number | null => {
    if (!proximo_vencimento) return null;
    const today = new Date();
    const expiry = new Date(proximo_vencimento);
    const diff = expiry.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Meu Plano</h1>
        <p className="text-muted-foreground">
          Gerencie sua assinatura e benefícios
        </p>
      </div>

      {/* Assinatura Ativa */}
      {subscription && subscription.status === 'ativa' ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{subscription.plano?.nome || 'N/A'}</CardTitle>
                <CardDescription>Plano atual</CardDescription>
              </div>
              <Badge className="bg-green-500">Ativa</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Preço */}
            <div>
              <p className="text-3xl font-bold text-fitway-green">
                {formatCurrency(subscription.plano?.preco || 0)}
                <span className="text-lg text-muted-foreground ml-2">
                  /{subscription.plano?.ciclo_cobranca || 'mês'}
                </span>
              </p>
            </div>

            {/* Datas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Data de início
                </p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <p className="font-medium">
                    {formatDate(subscription.data_inicio)}
                  </p>
                </div>
              </div>

              {subscription.proximo_vencimento && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Próximo vencimento
                  </p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <p className="font-medium">
                      {formatDate(subscription.proximo_vencimento)}
                    </p>
                  </div>
                  {(() => {
                    const days = getDaysUntilExpiry(
                      subscription.proximo_vencimento
                    );
                    if (days !== null) {
                      return (
                        <p
                          className={`text-sm mt-1 ${
                            days < 7 ? 'text-red-500' : 'text-muted-foreground'
                          }`}
                        >
                          {days > 0 ? `${days} dias restantes` : 'Vencido!'}
                        </p>
                      );
                    }
                  })()}
                </div>
              )}
            </div>

            {/* Benefícios */}
            {subscription.plano?.beneficios_json && (
              <div>
                <p className="text-sm font-medium mb-2">Benefícios inclusos:</p>
                <ul className="space-y-1">
                  {(Array.isArray(subscription.plano.beneficios_json) 
                    ? subscription.plano.beneficios_json 
                    : []
                  ).map((benefit, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Renovação Automática */}
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              {subscription.renova_automatico ? (
                <>
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-sm">
                    Renovação automática ativada
                  </span>
                </>
              ) : (
                <>
                  <X className="h-5 w-5 text-red-500" />
                  <span className="text-sm">
                    Renovação automática desativada
                  </span>
                </>
              )}
            </div>

            {/* Botão Cancelar */}
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setShowCancelDialog(true)}
            >
              Cancelar Assinatura
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Sem Assinatura Ativa */
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <CreditCard className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">
                Você não possui assinatura ativa
              </h3>
              <p className="text-sm text-muted-foreground">
                Escolha um plano abaixo para começar
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Planos Disponíveis */}
      <div>
        <h2 className="text-2xl font-bold mb-4">
          {subscription?.status === 'ativa' ? 'Outros Planos Disponíveis' : 'Planos Disponíveis'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const isCurrentPlan = subscription?.id_plano === plan.id_plano && subscription?.status === 'ativa';
            
            return (
              <Card 
                key={plan.id_plano} 
                className={`hover:shadow-lg transition ${isCurrentPlan ? 'border-2 border-fitway-green' : ''}`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {plan.nome}
                    {isCurrentPlan && (
                      <span className="text-xs bg-fitway-green text-white px-2 py-1 rounded">
                        Plano Atual
                      </span>
                    )}
                  </CardTitle>
                  <div className="text-3xl font-bold text-fitway-green">
                    {formatCurrency(plan.preco)}
                    <span className="text-lg text-muted-foreground">
                      /{plan.ciclo_cobranca}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Benefícios */}
                  {plan.beneficios_json && (
                    <ul className="space-y-2">
                      {(Array.isArray(plan.beneficios_json)
                        ? plan.beneficios_json
                        : []
                      ).map((benefit, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <Button
                    className="w-full"
                    onClick={() => setSelectedPlan(plan)}
                    disabled={isCurrentPlan}
                  >
                    {isCurrentPlan ? 'Seu plano atual' : 'Assinar este plano'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Dialog: Confirmar Assinatura */}
      <Dialog open={!!selectedPlan} onOpenChange={() => setSelectedPlan(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Assinatura</DialogTitle>
            <DialogDescription>
              Você está prestes a assinar o plano{' '}
              <strong>{selectedPlan?.nome}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <span>Valor:</span>
              <span className="text-2xl font-bold text-fitway-green">
                {formatCurrency(selectedPlan?.preco || 0)}/
                {selectedPlan?.ciclo_cobranca}
              </span>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Renovação automática:</strong> Sua assinatura será
                renovada automaticamente no próximo vencimento.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedPlan(null)}
              disabled={subscribing}
            >
              Cancelar
            </Button>
            <Button onClick={handleSubscribe} disabled={subscribing}>
              {subscribing ? 'Processando...' : 'Confirmar Assinatura'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog: Confirmar Cancelamento */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Cancelar Assinatura?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Você perderá acesso aos benefícios do plano{' '}
              <strong>{subscription?.plano?.nome}</strong> imediatamente. Esta
              ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>
              Não cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={cancelling}
              className="bg-red-500 hover:bg-red-600"
            >
              {cancelling ? 'Cancelando...' : 'Sim, cancelar assinatura'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
