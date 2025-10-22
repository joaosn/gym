import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Check, 
  Crown, 
  Calendar,
  Clock,
  DollarSign,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { plansService } from '@/services/plans.service';
import { formatCurrency, formatDate, getErrorMessage } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import type { Plan } from '@/types';

const StudentPlans = () => {
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [subscribeDialog, setSubscribeDialog] = useState<{
    open: boolean;
    plan: Plan | null;
  }>({
    open: false,
    plan: null,
  });
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Carregar assinatura atual do aluno
        const { data: subscription } = await plansService.getMySubscription();
        setCurrentSubscription(subscription);
        
        // Carregar planos disponíveis
        const { data: plans } = await plansService.listPublicPlans();
        setAvailablePlans(plans);
      } catch (err: any) {
        toast({
          title: 'Erro ao carregar planos',
          description: getErrorMessage(err),
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleOpenSubscribeDialog = (plan: Plan) => {
    setSubscribeDialog({
      open: true,
      plan,
    });
  };

  const handleConfirmSubscribe = async () => {
    if (!subscribeDialog.plan) return;

    try {
      setSubscribing(true);
      const response = await plansService.subscribe(Number(subscribeDialog.plan.id_plano));
      const cobranca = (response as any)?.cobranca;
      const valorCobranca = cobranca?.valor_total ?? cobranca?.valor;
      const vencimentoCobranca = cobranca?.vencimento;

      toast({
        title: 'Plano assinado!',
        description: [
          'Sua assinatura foi criada e uma cobrança foi gerada.',
          valorCobranca ? `Valor: ${formatCurrency(valorCobranca)}` : null,
          vencimentoCobranca ? `Vencimento: ${formatDate(vencimentoCobranca)}` : null,
          'Conclua o pagamento na área de Pagamentos.',
        ]
          .filter(Boolean)
          .join('
'),
      });

      setSubscribeDialog({ open: false, plan: null });

      const [{ data: subscription }, { data: plans }] = await Promise.all([
        plansService.getMySubscription(),
        plansService.listPublicPlans(),
      ]);
      setCurrentSubscription(subscription);
      setAvailablePlans(plans);
    } catch (err: any) {
      toast({
        title: 'Erro ao assinar plano',
        description: getErrorMessage(err),
        variant: 'destructive'
      });
    } finally {
      setSubscribing(false);
    }
  };

  const handleOpenCancelDialog = () => {
    setCancelDialogOpen(true);
  };

  const handleConfirmCancelSubscription = async () => {
    if (!currentSubscription) return;

    try {
      setCanceling(true);
      await plansService.cancelSubscription(currentSubscription.id_assinatura);

      toast({
        title: 'Assinatura cancelada',
        description: 'Sua assinatura foi encerrada e eventuais cobranças pendentes foram canceladas.',
      });

      setCurrentSubscription(null);
      const { data: plans } = await plansService.listPublicPlans();
      setAvailablePlans(plans);
    } catch (err: any) {
      toast({
        title: 'Erro ao cancelar assinatura',
        description: getErrorMessage(err),
        variant: 'destructive'
      });
    } finally {
      setCanceling(false);
      setCancelDialogOpen(false);
    }
  };

  const handleDowngrade = (planId: string) => {
    console.log('Downgrading to plan:', planId);
    // Here would be the actual downgrade logic
  };

  return (
    <div className="min-h-screen bg-dashboard-bg text-dashboard-fg">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Meu Plano</h1>
          <p className="text-white/80">Gerencie sua assinatura e benefícios</p>
        </div>

        {loading && (
          <Card className="bg-dashboard-card border-dashboard-border">
            <CardContent className="py-12 text-center text-white/70 flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Carregando...
            </CardContent>
          </Card>
        )}

        {!loading && !currentSubscription && (
          <Card className="mb-8 bg-dashboard-card border-dashboard-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <DollarSign className="h-5 w-5 text-yellow-500" />
                Você não possui assinatura ativa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/70 mb-4">
                Escolha um plano abaixo para começar a aproveitar todos os benefícios do FITWAY!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Current Plan Status */}
        {!loading && currentSubscription && (
          <Card className="mb-8 bg-dashboard-card border-fitway-green/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Crown className="h-5 w-5 text-fitway-green" />
                Seu Plano Atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-fitway-green">{currentSubscription.plano?.nome}</h3>
                  <div className="flex items-center gap-4 text-sm text-white/70 mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Início: {formatDate(currentSubscription.data_inicio)}
                    </span>
                    {currentSubscription.proximo_vencimento && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Próximo vencimento: {formatDate(currentSubscription.proximo_vencimento)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-fitway-green">
                    {formatCurrency(currentSubscription.plano?.preco)}
                  </div>
                  <div className="text-white/70">/{currentSubscription.plano?.ciclo_cobranca}</div>
                  <Badge className="mt-2 bg-fitway-green text-fitway-dark">
                    {currentSubscription.status === 'ativa' ? 'Ativo' : currentSubscription.status}
                  </Badge>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-dashboard-border">
                <Button
                  variant="outline"
                  className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                  onClick={handleOpenCancelDialog}
                  disabled={canceling}
                >
                  Cancelar Assinatura
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Plans */}
        {!loading && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              {currentSubscription ? 'Outros Planos Disponíveis' : 'Planos Disponíveis'}
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {availablePlans.map((plan) => {
                const isCurrent = currentSubscription?.id_plano === plan.id_plano;
                const beneficios = Array.isArray(plan.beneficios_json) 
                  ? plan.beneficios_json 
                  : [];

                return (
                  <Card 
                    key={plan.id_plano} 
                    className={`relative bg-dashboard-card border-dashboard-border ${
                      isCurrent ? 'border-fitway-green ring-2 ring-fitway-green' : ''
                    }`}
                  >
                    {isCurrent && (
                      <Badge className="absolute -top-3 right-4 bg-fitway-green text-fitway-dark font-bold">
                        Plano Atual
                      </Badge>
                    )}

                    <CardHeader>
                      <CardTitle className="text-white text-2xl">{plan.nome}</CardTitle>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-fitway-green">
                          {formatCurrency(plan.preco)}
                        </span>
                        <span className="text-white/70">/{plan.ciclo_cobranca}</span>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Benefícios */}
                      <div className="space-y-2">
                        {beneficios.map((benefit: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-fitway-green mt-0.5 flex-shrink-0" />
                            <span className="text-white/80 text-sm">{benefit}</span>
                          </div>
                        ))}
                      </div>

                      {/* Max reservas */}
                      {plan.max_reservas_futuras && (
                        <div className="flex items-center gap-2 text-white/70 text-sm pt-2 border-t border-dashboard-border">
                          <Calendar className="h-4 w-4" />
                          <span>Até {plan.max_reservas_futuras} reservas futuras</span>
                        </div>
                      )}

                      {/* Botão de ação */}
                      <Button
                        className={`w-full ${
                          isCurrent
                            ? 'bg-gray-600 text-white cursor-not-allowed'
                            : 'bg-fitway-green text-fitway-dark hover:bg-fitway-neon'
                        }`}
                        onClick={() => !isCurrent && handleOpenSubscribeDialog(plan)}
                        disabled={isCurrent || subscribing}
                      >
                        {isCurrent ? (
                          'Plano Ativo'
                        ) : subscribing ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Processando...
                          </>
                        ) : (
                          <>
                            Assinar Este Plano
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialogos */}
      <AlertDialog
        open={subscribeDialog.open}
        onOpenChange={(open) => {
          if (!open && !subscribing) {
            setSubscribeDialog({ open: false, plan: null });
          }
        }}
      >
        <AlertDialogContent className="bg-dashboard-card border-dashboard-border max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Confirmar assinatura</AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              Revise os detalhes antes de confirmar. Uma cobrança será gerada automaticamente.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {subscribeDialog.plan && (
            <div className="bg-dashboard-bg/60 rounded-lg p-5 space-y-3">
              <div>
                <p className="text-white/60 text-sm">Plano selecionado</p>
                <p className="text-white font-semibold text-lg">{subscribeDialog.plan.nome}</p>
                <p className="text-white/70 text-sm capitalize">{subscribeDialog.plan.ciclo_cobranca}</p>
              </div>
              <div className="flex items-baseline justify-between border-t border-dashboard-border pt-3">
                <span className="text-white/70 text-sm">Valor da cobrança:</span>
                <span className="text-fitway-green font-bold text-2xl">
                  {formatCurrency(subscribeDialog.plan.preco)}
                </span>
              </div>
              {Array.isArray(subscribeDialog.plan.beneficios_json) && subscribeDialog.plan.beneficios_json.length > 0 && (
                <div>
                  <p className="text-white/70 text-sm mb-1">Benefícios incluídos:</p>
                  <ul className="list-disc list-inside text-white/80 text-sm space-y-1">
                    {subscribeDialog.plan.beneficios_json.map((benefit, index) => (
                      <li key={`${subscribeDialog.plan?.id_plano}-benefit-${index}`}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="text-white/60 text-xs">
                A cobrança ficará disponível na área de Pagamentos. Você só será cobrado(a) após confirmar.
              </p>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-dashboard-border text-white hover:bg-dashboard-border"
              disabled={subscribing}
            >
              Voltar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-fitway-green text-fitway-dark hover:bg-fitway-neon"
              onClick={handleConfirmSubscribe}
              disabled={subscribing}
            >
              {subscribing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processando...
                </>
              ) : (
                'Confirmar e gerar cobrança'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={cancelDialogOpen}
        onOpenChange={(open) => !open && !canceling && setCancelDialogOpen(false)}
      >
        <AlertDialogContent className="bg-dashboard-card border-dashboard-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-400">Cancelar assinatura</AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              Ao cancelar, sua assinatura será encerrada imediatamente e as próximas cobranças serão interrompidas.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {currentSubscription?.plano && (
            <div className="bg-dashboard-bg/60 rounded-lg p-4 space-y-2">
              <p className="text-white font-semibold">{currentSubscription.plano?.nome}</p>
              <div className="flex justify-between text-sm text-white/70">
                <span>Valor atual:</span>
                <span>{formatCurrency(currentSubscription.plano?.preco)}</span>
              </div>
              {currentSubscription.proximo_vencimento && (
                <div className="flex justify-between text-sm text-white/70">
                  <span>Próximo vencimento:</span>
                  <span>{formatDate(currentSubscription.proximo_vencimento)}</span>
                </div>
              )}
              <p className="text-white/60 text-xs">
                Se houver uma cobrança pendente, ela será automaticamente cancelada.
              </p>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-dashboard-border text-white hover:bg-dashboard-border"
              disabled={canceling}
            >
              Manter assinatura
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={handleConfirmCancelSubscription}
              disabled={canceling}
            >
              {canceling ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Cancelando...
                </>
              ) : (
                'Cancelar assinatura'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      </div>
  );
};
