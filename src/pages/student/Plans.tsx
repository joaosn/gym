import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Zap, 
  Check, 
  Crown, 
  Calendar,
  Clock,
  Users,
  DollarSign,
  ArrowRight
} from 'lucide-react';

const StudentPlans = () => {
  const [currentPlan, setCurrentPlan] = useState('fit-plus'); // Mock current plan

  const plans = [
    {
      id: 'fit-basic',
      name: 'Fit Básico',
      price: 89,
      originalPrice: null,
      description: 'Ideal para quem está começando',
      popular: false,
      features: [
        '1 reserva futura',
        'Desconto em quadras (R$ 40/h)',
        'Aulas e personais à parte',
        'Suporte prioritário',
        'Acesso a todos os horários',
        'Cancelamento até 6h antes'
      ],
      limitations: [
        'Aulas não incluídas',
        'Personal trainings não incluídos'
      ]
    },
    {
      id: 'fit-plus',
      name: 'Fit Plus',
      price: 129,
      originalPrice: 149,
      description: 'O mais popular entre nossos alunos',
      popular: true,
      features: [
        '2 reservas futuras',
        'Desconto em quadras (R$ 40/h)',
        '1 aula/semana incluída',
        'Desconto 20% em personals',
        'Prioridade em reservas',
        'Suporte VIP',
        'Acesso exclusivo a eventos',
        'Cancelamento até 2h antes'
      ],
      limitations: []
    },
    {
      id: 'fit-premium',
      name: 'Fit Premium',
      price: 199,
      originalPrice: 229,
      description: 'Experiência completa FITWAY',
      popular: false,
      features: [
        '4 reservas futuras',
        'Quadras gratuitas (até 8h/mês)',
        '2 aulas/semana incluídas',
        '2 personals/mês incluídos',
        'Reservas ilimitadas',
        'Suporte 24/7',
        'Convidados com desconto',
        'Acesso VIP a novidades',
        'Cancelamento sem restrições'
      ],
      limitations: []
    }
  ];

  const currentSubscription = {
    plan: plans.find(p => p.id === currentPlan),
    status: 'active',
    nextPayment: '2024-02-15',
    startDate: '2024-01-15',
    daysRemaining: 20
  };

  const handleUpgrade = (planId: string) => {
    console.log('Upgrading to plan:', planId);
    // Here would be the actual upgrade logic
  };

  const handleDowngrade = (planId: string) => {
    console.log('Downgrading to plan:', planId);
    // Here would be the actual downgrade logic
  };

  return (
    <div className="min-h-screen bg-dashboard-bg text-dashboard-fg">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Meus Planos</h1>
          <p className="text-white/80">Gerencie sua assinatura e explore outras opções</p>
        </div>

        {/* Current Plan Status */}
        {currentSubscription.plan && (
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
                  <h3 className="text-2xl font-bold text-fitway-green">{currentSubscription.plan.name}</h3>
                  <p className="text-white/80 mb-2">{currentSubscription.plan.description}</p>
                  <div className="flex items-center gap-4 text-sm text-white/70">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Próximo vencimento: {new Date(currentSubscription.nextPayment).toLocaleDateString('pt-BR')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {currentSubscription.daysRemaining} dias restantes
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-fitway-green">
                    R$ {currentSubscription.plan.price}
                  </div>
                  <div className="text-white/70">/mês</div>
                  <Badge className="mt-2 bg-fitway-green text-fitway-dark">
                    {currentSubscription.status === 'active' ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Plans */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Todos os Planos Disponíveis</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const isCurrent = plan.id === currentPlan;
              const isUpgrade = plan.price > (currentSubscription.plan?.price || 0);
              const isDowngrade = plan.price < (currentSubscription.plan?.price || 0);

              return (
                <Card 
                  key={plan.id} 
                  className={`relative bg-dashboard-card border-dashboard-border ${
                    plan.popular ? 'ring-2 ring-fitway-green shadow-glow' : ''
                  } ${isCurrent ? 'border-fitway-green' : ''}`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-fitway-green text-fitway-dark font-bold">
                      Mais Popular
                    </Badge>
                  )}
                  {isCurrent && (
                    <Badge className="absolute -top-3 right-4 bg-fitway-neon text-fitway-dark font-bold">
                      Plano Atual
                    </Badge>
                  )}

                  <CardHeader>
                    <CardTitle className="text-center">
                      <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                      <p className="text-white/70 text-sm mt-1">{plan.description}</p>
                    </CardTitle>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        {plan.originalPrice && (
                          <span className="text-lg text-white/50 line-through">
                            R$ {plan.originalPrice}
                          </span>
                        )}
                        <span className="text-4xl font-bold text-fitway-green">
                          R$ {plan.price}
                        </span>
                      </div>
                      <span className="text-white/70">/mês</span>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      {/* Features */}
                      <div>
                        <h4 className="font-semibold text-white mb-3">Incluído:</h4>
                        <ul className="space-y-2">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-fitway-green mt-0.5 flex-shrink-0" />
                              <span className="text-white/80 text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Limitations */}
                      {plan.limitations.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-white mb-3">Não incluído:</h4>
                          <ul className="space-y-2">
                            {plan.limitations.map((limitation, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-white/40 text-sm">• {limitation}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Action Button */}
                      <div className="pt-4">
                        {isCurrent ? (
                          <Button variant="outline" className="w-full border-fitway-green text-fitway-green" disabled>
                            Plano Atual
                          </Button>
                        ) : isUpgrade ? (
                          <Button 
                            variant="sport" 
                            className="w-full"
                            onClick={() => handleUpgrade(plan.id)}
                          >
                            <ArrowRight className="mr-2 h-4 w-4" />
                            Fazer Upgrade
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            className="w-full border-fitway-green text-fitway-green hover:bg-fitway-green hover:text-fitway-dark"
                            onClick={() => handleDowngrade(plan.id)}
                          >
                            Alterar para este Plano
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Plan Comparison */}
        <Card className="bg-dashboard-card border-dashboard-border">
          <CardHeader>
            <CardTitle className="text-white">Comparação de Planos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dashboard-border">
                    <th className="text-left p-3 text-white">Recursos</th>
                    {plans.map(plan => (
                      <th key={plan.id} className="text-center p-3 text-white">
                        {plan.name}
                        <div className="text-fitway-green font-bold">R$ {plan.price}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-white/80">
                  <tr className="border-b border-dashboard-border/50">
                    <td className="p-3">Reservas futuras</td>
                    <td className="text-center p-3">1</td>
                    <td className="text-center p-3">2</td>
                    <td className="text-center p-3">4</td>
                  </tr>
                  <tr className="border-b border-dashboard-border/50">
                    <td className="p-3">Preço por hora</td>
                    <td className="text-center p-3">R$ 40</td>
                    <td className="text-center p-3">R$ 40</td>
                    <td className="text-center p-3">Grátis (8h/mês)</td>
                  </tr>
                  <tr className="border-b border-dashboard-border/50">
                    <td className="p-3">Aulas incluídas</td>
                    <td className="text-center p-3">-</td>
                    <td className="text-center p-3">1/semana</td>
                    <td className="text-center p-3">2/semana</td>
                  </tr>
                  <tr className="border-b border-dashboard-border/50">
                    <td className="p-3">Personal trainings</td>
                    <td className="text-center p-3">À parte</td>
                    <td className="text-center p-3">20% desconto</td>
                    <td className="text-center p-3">2/mês incluídos</td>
                  </tr>
                  <tr>
                    <td className="p-3">Cancelamento</td>
                    <td className="text-center p-3">Até 6h antes</td>
                    <td className="text-center p-3">Até 2h antes</td>
                    <td className="text-center p-3">Sem restrições</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Support */}
        <Card className="mt-6 bg-dashboard-card border-dashboard-border">
          <CardHeader>
            <CardTitle className="text-white">Precisa de Ajuda?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4">
                <Users className="h-8 w-8 text-fitway-green mx-auto mb-2" />
                <h4 className="font-semibold text-white mb-1">Suporte</h4>
                <p className="text-white/70 text-sm mb-3">Tire suas dúvidas sobre os planos</p>
                <Button variant="outline" size="sm" className="border-fitway-green text-fitway-green hover:bg-fitway-green hover:text-fitway-dark">
                  Falar com Suporte
                </Button>
              </div>
              <div className="text-center p-4">
                <DollarSign className="h-8 w-8 text-fitway-green mx-auto mb-2" />
                <h4 className="font-semibold text-white mb-1">Financeiro</h4>
                <p className="text-white/70 text-sm mb-3">Histórico de pagamentos</p>
                <Button variant="outline" size="sm" className="border-fitway-green text-fitway-green hover:bg-fitway-green hover:text-fitway-dark">
                  Ver Faturas
                </Button>
              </div>
              <div className="text-center p-4">
                <Zap className="h-8 w-8 text-fitway-green mx-auto mb-2" />
                <h4 className="font-semibold text-white mb-1">Benefícios</h4>
                <p className="text-white/70 text-sm mb-3">Saiba como aproveitar melhor</p>
                <Button variant="outline" size="sm" className="border-fitway-green text-fitway-green hover:bg-fitway-green hover:text-fitway-dark">
                  Ver Guia
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentPlans;