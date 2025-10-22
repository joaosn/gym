import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar, 
  Clock, 
  User, 
  TrendingUp, 
  DollarSign, 
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { dashboardService } from '@/services/dashboard.service';
import { 
  formatCurrency, 
  formatDate, 
  formatTime, 
  getErrorMessage 
} from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

// Skeleton loader para cards de estatística
const StatCardSkeleton = () => (
  <Card className="animate-pulse">
    <CardContent className="pt-6">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
      <div className="h-6 bg-gray-100 rounded w-1/2"></div>
    </CardContent>
  </Card>
);

export default function PersonalDashboard() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const dashboardData = await dashboardService.getInstructorDashboard();
      setData(dashboardData);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar dashboard',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Cards de estatística */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Nenhum dado disponível. Tente recarregar a página.
        </AlertDescription>
      </Alert>
    );
  }

  const statCards = [
    {
      title: 'Alunos',
      value: data.alunos?.total_atendidos || 0,
      icon: User,
      color: 'bg-blue-100 dark:bg-blue-900',
      iconColor: 'text-blue-700 dark:text-blue-400',
      textColor: 'text-blue-950 dark:text-blue-50',
      titleColor: 'text-blue-800 dark:text-blue-300',
    },
    {
      title: 'Sessões Hoje',
      value: data.sessoes_personal?.hoje || 0,
      icon: Calendar,
      color: 'bg-green-100 dark:bg-green-900',
      iconColor: 'text-green-700 dark:text-green-400',
      textColor: 'text-green-950 dark:text-green-50',
      titleColor: 'text-green-800 dark:text-green-300',
    },
    {
      title: 'Receita do Mês',
      value: formatCurrency(data.financeiro?.receita_mes || 0, false),
      icon: DollarSign,
      color: 'bg-purple-100 dark:bg-purple-900',
      iconColor: 'text-purple-700 dark:text-purple-400',
      textColor: 'text-purple-950 dark:text-purple-50',
      titleColor: 'text-purple-800 dark:text-purple-300',
    },
    {
      title: 'Turmas Ativas',
      value: data.aulas?.turmas || 0,
      icon: TrendingUp,
      color: 'bg-orange-100 dark:bg-orange-900',
      iconColor: 'text-orange-700 dark:text-orange-400',
      textColor: 'text-orange-950 dark:text-orange-50',
      titleColor: 'text-orange-800 dark:text-orange-300',
    },
    {
      title: 'Valor/Hora',
      value: formatCurrency(data.financeiro?.valor_hora || 0, false),
      icon: Clock,
      color: 'bg-red-100 dark:bg-red-900',
      iconColor: 'text-red-700 dark:text-red-400',
      textColor: 'text-red-950 dark:text-red-50',
      titleColor: 'text-red-800 dark:text-red-300',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Grid de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="overflow-hidden border-0 shadow-md hover:shadow-lg transition">
              <CardContent className={`pt-6 ${stat.color}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className={`text-sm font-semibold ${stat.titleColor} mb-2`}>
                      {stat.title}
                    </p>
                    <p className={`text-3xl font-bold ${stat.textColor}`}>
                      {stat.value}
                    </p>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.iconColor}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Próximas Sessões e Estatísticas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Próximas Sessões (2/3) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Próximas Sessões Personal
            </CardTitle>
            <CardDescription>
              Seus próximos atendimentos 1:1
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.proximas_sessoes && data.proximas_sessoes.length > 0 ? (
              <div className="space-y-4">
                {data.proximas_sessoes.slice(0, 5).map((sessao: any) => {
                  const duracao = new Date(sessao.fim).getTime() - new Date(sessao.inicio).getTime();
                  const minutos = Math.floor(duracao / 60000);
                  
                  return (
                    <div
                      key={sessao.id_sessao_personal}
                      className="flex items-start justify-between p-4 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <span className="font-mono text-sm font-bold text-blue-800 dark:text-blue-200">
                            {formatTime(sessao.inicio)}
                          </span>
                          <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                            ({minutos} min)
                          </span>
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white mb-1 text-base">
                          {sessao.aluno_nome}
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 font-medium">
                          {formatDate(sessao.inicio, true)}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              sessao.status === 'confirmada'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {sessao.status === 'confirmada'
                              ? '✓ Confirmada'
                              : '○ Pendente'}
                          </Badge>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-300 mt-1" />
                    </div>
                  );
                })}
                {data.proximas_sessoes.length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    Nenhuma sessão agendada
                  </p>
                )}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                Nenhuma sessão agendada
              </p>
            )}
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => navigate('/instrutor/agenda')}
            >
              Ver Agenda Completa
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Estatísticas (1/3) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Estatísticas
            </CardTitle>
            <CardDescription>
              Métricas gerais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Sessões este mês
                </p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {data.sessoes_personal?.mes || 0}
                </p>
              </div>

              <div className="pt-4 border-t-2 border-gray-300 dark:border-gray-600">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Total de sessões
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {data.sessoes_personal?.total || 0}
                </p>
              </div>

              <div className="pt-4 border-t-2 border-gray-300 dark:border-gray-600">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Aulas este mês
                </p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {data.aulas?.aulas_mes || 0}
                </p>
              </div>

              <div className="pt-4 border-t-2 border-gray-300 dark:border-gray-600">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Horários configurados
                </p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {data.disponibilidade?.horarios_configurados || 0}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/instrutor/slots')}
            >
              Gerenciar Horários
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
