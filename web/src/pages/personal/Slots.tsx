import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import {
  formatTime,
  formatCurrency,
  getErrorMessage
} from '@/lib/utils';
import {
  Calendar,
  Clock,
  User,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  MessageSquare,
  Plus
} from 'lucide-react';

interface Sessao {
  id_sessao_personal: number;
  id_instrutor: number;
  id_usuario: number;
  aluno_nome: string;
  aluno_email: string;
  inicio: string;
  fim: string;
  preco_total: string | number;
  status: 'pendente' | 'confirmada' | 'cancelada' | 'concluida';
}

interface GroupedSessoes {
  [key: string]: Sessao[];
}

interface NovaFormData {
  id_usuario: number;
  data: string;
  horaInicio: string;
  duracao: number; // em minutos
}

export default function InstructorSlots() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [cancelando, setCancelando] = useState<number | null>(null);
  const [concluindo, setConcluindo] = useState<number | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState<{
    show: boolean;
    sessaoId?: number;
    aluno?: { nome: string; email: string };
  }>({ show: false });
  
  // Nova Sessão Modal
  const [showNovaModal, setShowNovaModal] = useState(false);
  const [carregandoAlunos, setCarregandoAlunos] = useState(false);
  const [alunos, setAlunos] = useState<any[]>([]);
  const [criando, setCriando] = useState(false);
  const [novaFormData, setNovaFormData] = useState<NovaFormData>({
    id_usuario: 0,
    data: new Date().toISOString().split('T')[0],
    horaInicio: '08:00',
    duracao: 60,
  });

  useEffect(() => {
    loadSessoes();
  }, []);

  // Carregar alunos quando modal abre
  useEffect(() => {
    if (showNovaModal) {
      loadAlunos();
    }
  }, [showNovaModal]);

  const loadSessoes = async () => {
    try {
      setLoading(true);
      console.log('📋 Iniciando carregamento de sessões...');
      
      // A API retorna array diretamente (não é { data: [...] })
      const response: any = await apiClient.get('/instructor/my-sessions');
      console.log('✅ Resposta da API:', response);
      
      // apiClient retorna JSON direto, então response JÁ é o array
      const dados = Array.isArray(response) ? response : [];
      console.log('📊 Sessões carregadas:', dados.length, 'items');
      
      setSessoes(dados);
    } catch (error: any) {
      console.error('❌ Erro ao carregar sessões:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.statusCode,
        errors: error.errors,
      });
      toast({
        title: 'Erro ao carregar sessões',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
      setSessoes([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAlunos = async () => {
    try {
      setCarregandoAlunos(true);
      const response = await apiClient.get('/instructor/students');
      
      // Response é um array direto: [{ id_usuario, nome, email, telefone }, ...]
      const listaAlunos = Array.isArray(response) ? response : [];
      setAlunos(listaAlunos);
      
      console.log('✅ Alunos carregados:', listaAlunos);
    } catch (error: any) {
      console.error('❌ Erro ao carregar alunos:', error);
      toast({
        title: 'Erro ao carregar alunos',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
      setAlunos([]);
    } finally {
      setCarregandoAlunos(false);
    }
  };

  const handleCriarNovaSessao = async () => {
    try {
      if (!novaFormData.id_usuario) {
        toast({
          title: 'Erro',
          description: 'Selecione um aluno',
          variant: 'destructive',
        });
        return;
      }

      setCriando(true);

      const inicio = `${novaFormData.data}T${novaFormData.horaInicio}:00`;
      const fim = new Date(new Date(inicio).getTime() + novaFormData.duracao * 60000).toISOString();

      const response: any = await apiClient.post('/personal-sessions', {
        id_usuario: novaFormData.id_usuario,
        id_instrutor: 0, // TODO: pegar do auth
        inicio,
        fim,
      });

      toast({
        title: '✓ Sessão criada!',
        description: 'A cobrança será gerada para o aluno',
      });

      // Resetar form
      setNovaFormData({
        id_usuario: 0,
        data: new Date().toISOString().split('T')[0],
        horaInicio: '08:00',
        duracao: 60,
      });
      setShowNovaModal(false);

      // Recarregar sessões
      await loadSessoes();
    } catch (error: any) {
      console.error('❌ Erro ao criar sessão:', error);
      toast({
        title: 'Erro ao criar sessão',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setCriando(false);
    }
  };

  const handleCancelarSessao = async (idSessao: number, alunoNome: string, alunoEmail: string) => {
    try {
      setCancelando(idSessao);

      // Cancelar sessão
      await apiClient.patch(`/instructor/sessions/${idSessao}/cancel`, {});

      // Enviar lembrete ao aluno
      toast({
        title: '✓ Sessão cancelada',
        description: `Lembrete enviado para ${alunoNome}`,
      });

      // Recarregar lista
      await loadSessoes();
      setShowCancelDialog({ show: false });
    } catch (error: any) {
      console.error('❌ Erro ao cancelar:', error);
      toast({
        title: 'Erro ao cancelar sessão',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setCancelando(null);
    }
  };

  const handleConcluirSessao = async (idSessao: number) => {
    try {
      setConcluindo(idSessao);

      // Marcar como concluída
      await apiClient.patch(`/instructor/sessions/${idSessao}/complete`, {});

      toast({
        title: '✓ Sessão concluída!',
        description: 'A aula foi marcada como concluída.',
      });

      // Recarregar lista
      await loadSessoes();
    } catch (error: any) {
      console.error('❌ Erro ao concluir:', error);
      toast({
        title: 'Erro ao concluir sessão',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setConcluindo(null);
    }
  };

  const grouparPorData = (sessoesArray: Sessao[]): GroupedSessoes => {
    return sessoesArray.reduce((grupos: GroupedSessoes, sessao: Sessao) => {
      const data = sessao.inicio.split('T')[0];
      if (!grupos[data]) {
        grupos[data] = [];
      }
      grupos[data].push(sessao);
      return grupos;
    }, {});
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmada':
        return { bg: 'bg-green-500/20', text: 'text-green-400', badge: 'bg-green-500' };
      case 'pendente':
        return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', badge: 'bg-yellow-500' };
      case 'cancelada':
        return { bg: 'bg-red-500/20', text: 'text-red-400', badge: 'bg-red-500' };
      case 'concluida':
        return { bg: 'bg-blue-500/20', text: 'text-blue-400', badge: 'bg-blue-500' };
      default:
        return { bg: 'bg-gray-500/20', text: 'text-gray-400', badge: 'bg-gray-500' };
    }
  };

  const getStatusTexto = (status: string) => {
    switch (status) {
      case 'confirmada':
        return 'Confirmada';
      case 'pendente':
        return 'Pendente';
      case 'cancelada':
        return 'Cancelada';
      case 'concluida':
        return 'Concluída';
      default:
        return status;
    }
  };

  const sessoesAgrupadas = grouparPorData(sessoes);
  const sessoesHoje = sessoes.filter(s => {
    const dataHoje = new Date().toISOString().split('T')[0];
    const dataSessao = s.inicio.split('T')[0];
    return dataSessao === dataHoje;
  });
  const sessoesConfirmadas = sessoes.filter(s => s.status === 'confirmada').length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Minhas Sessões Personal</h1>
          <p className="text-gray-400">Gerencie suas aulas 1:1</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="h-8 w-16 mb-2 bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-24 bg-gray-700 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com Botão */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Minhas Sessões Personal</h1>
          <p className="text-gray-400">Gerencie suas aulas 1:1 com alunos</p>
        </div>
        <Button
          onClick={() => setShowNovaModal(true)}
          className="bg-fitway-green hover:bg-fitway-green/90 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Sessão
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Confirmadas</p>
                <p className="text-2xl font-bold text-white">{sessoesConfirmadas}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Hoje</p>
                <p className="text-2xl font-bold text-white">{sessoesHoje.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-fitway-green" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total</p>
                <p className="text-2xl font-bold text-white">{sessoes.length}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sessões por Data */}
      <div className="space-y-6">
        {Object.keys(sessoesAgrupadas)
          .sort()
          .map(data => (
            <Card key={data}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Calendar className="h-5 w-5 text-fitway-green" />
                  {new Date(data + 'T00:00:00').toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {sessoesAgrupadas[data].map(sessao => {
                  const statusStyle = getStatusColor(sessao.status);
                  const inicio = new Date(sessao.inicio);
                  const fim = new Date(sessao.fim);
                  const duracao = Math.floor((fim.getTime() - inicio.getTime()) / 60000);

                  return (
                    <div
                      key={sessao.id_sessao_personal}
                      className={`p-4 rounded-lg border border-gray-700 ${statusStyle.bg}`}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-fitway-green" />
                          <div>
                            <p className="font-mono font-bold text-white">
                              {formatTime(sessao.inicio)} - {formatTime(sessao.fim)}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {duracao} minutos
                            </p>
                          </div>
                        </div>
                        <Badge className={`${statusStyle.badge} text-white`}>
                          {getStatusTexto(sessao.status)}
                        </Badge>
                      </div>

                      {/* Aluno */}
                      <div className="mb-3 pl-8">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-4 w-4 text-fitway-green" />
                          <p className="font-medium text-white">{sessao.aluno_nome}</p>
                        </div>
                        <p className="text-sm text-gray-400">{sessao.aluno_email}</p>
                      </div>

                      {/* Preço */}
                      <div className="mb-4 pl-8">
                        <p className="text-sm text-gray-400">Valor da sessão</p>
                        <p className="text-lg font-bold text-fitway-green">
                          {formatCurrency(Number(sessao.preco_total))}
                        </p>
                      </div>

                      {/* Ações */}
                      <div className="flex gap-2 pl-8 flex-wrap">
                        {sessao.status === 'confirmada' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleConcluirSessao(sessao.id_sessao_personal)}
                              disabled={concluindo === sessao.id_sessao_personal}
                              className="bg-green-500 hover:bg-green-600 text-white"
                            >
                              {concluindo === sessao.id_sessao_personal ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Concluindo...
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Concluir Aula
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setShowCancelDialog({
                                  show: true,
                                  sessaoId: sessao.id_sessao_personal,
                                  aluno: { nome: sessao.aluno_nome, email: sessao.aluno_email }
                                })
                              }
                              className="border-red-500 text-red-500 hover:bg-red-500/10"
                            >
                              <X className="mr-2 h-4 w-4" />
                              Cancelar
                            </Button>
                          </>
                        )}

                        {sessao.status === 'pendente' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setShowCancelDialog({
                                show: true,
                                sessaoId: sessao.id_sessao_personal,
                                aluno: { nome: sessao.aluno_nome, email: sessao.aluno_email }
                              })
                            }
                            disabled={cancelando === sessao.id_sessao_personal}
                            className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/10 w-full"
                          >
                            {cancelando === sessao.id_sessao_personal ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Cancelando...
                              </>
                            ) : (
                              <>
                                <X className="mr-2 h-4 w-4" />
                                Cancelar
                              </>
                            )}
                          </Button>
                        )}

                        {sessao.status === 'cancelada' && (
                          <p className="text-sm text-red-400 italic">❌ Sessão cancelada</p>
                        )}

                        {sessao.status === 'concluida' && (
                          <p className="text-sm text-green-400 italic">✓ Sessão concluída</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Vazio */}
      {sessoes.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-white text-lg font-medium mb-2">Nenhuma sessão agendada</h3>
            <p className="text-gray-400">
              Seus alunos precisam agendar sessões para que elas apareçam aqui
            </p>
          </CardContent>
        </Card>
      )}

      {/* Dialog Cancelar */}
      <AlertDialog open={showCancelDialog.show} onOpenChange={(open) => !open && setShowCancelDialog({ show: false })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar sessão?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar a sessão com <strong>{showCancelDialog.aluno?.nome}</strong>?
              <br />
              Um lembrete será enviado para {showCancelDialog.aluno?.email}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2">
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (showCancelDialog.sessaoId && showCancelDialog.aluno) {
                  handleCancelarSessao(
                    showCancelDialog.sessaoId,
                    showCancelDialog.aluno.nome,
                    showCancelDialog.aluno.email
                  );
                }
              }}
              disabled={cancelando !== null}
              className="bg-red-500 hover:bg-red-600"
            >
              {cancelando !== null ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelando...
                </>
              ) : (
                'Cancelar Sessão'
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal Nova Sessão */}
      <Dialog open={showNovaModal} onOpenChange={setShowNovaModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Sessão Personal</DialogTitle>
            <DialogDescription>
              Crie uma nova sessão quando o aluno ligar. A cobrança será gerada automaticamente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Seletor de Aluno */}
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">Aluno</label>
              <select
                value={novaFormData.id_usuario}
                onChange={(e) =>
                  setNovaFormData({ ...novaFormData, id_usuario: parseInt(e.target.value) })
                }
                disabled={carregandoAlunos || alunos.length === 0}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white disabled:opacity-50"
              >
                <option value={0}>
                  {carregandoAlunos ? '⏳ Carregando alunos...' : 'Selecione um aluno'}
                </option>
                {alunos.map((aluno: any) => (
                  <option key={aluno.id_usuario} value={aluno.id_usuario}>
                    {aluno.nome} ({aluno.email})
                  </option>
                ))}
              </select>
              {alunos.length === 0 && !carregandoAlunos && (
                <p className="text-xs text-red-400 mt-1">⚠️ Nenhum aluno disponível</p>
              )}
            </div>

            {/* Data */}
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">Data</label>
              <Input
                type="date"
                value={novaFormData.data}
                onChange={(e) =>
                  setNovaFormData({ ...novaFormData, data: e.target.value })
                }
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            {/* Horário de Início */}
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Horário de Início
              </label>
              <Input
                type="time"
                value={novaFormData.horaInicio}
                onChange={(e) =>
                  setNovaFormData({ ...novaFormData, horaInicio: e.target.value })
                }
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            {/* Duração */}
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Duração (minutos)
              </label>
              <select
                value={novaFormData.duracao}
                onChange={(e) =>
                  setNovaFormData({
                    ...novaFormData,
                    duracao: parseInt(e.target.value),
                  })
                }
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              >
                <option value="30">30 minutos</option>
                <option value="45">45 minutos</option>
                <option value="60" selected>
                  1 hora
                </option>
                <option value="90">1h 30min</option>
                <option value="120">2 horas</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNovaModal(false)}
              className="border-gray-600"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCriarNovaSessao}
              disabled={criando || !novaFormData.id_usuario}
              className="bg-fitway-green hover:bg-fitway-green/90 text-white"
            >
              {criando ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Sessão
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}