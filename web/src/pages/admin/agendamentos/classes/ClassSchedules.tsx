import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { classesService, classSchedulesService } from '@/services/classes.service';
import { instructorsService } from '@/services/instructors.service';
import { courtsService } from '@/services/courts.service';
import { ApiError } from '@/lib/api-client';
import type { Aula, HorarioAula, HorarioAulaFormData, Instructor, Court } from '@/types';
import { ArrowLeft, Plus, Trash2, Loader2, Calendar, Clock, User, MapPin, HelpCircle, BookOpen } from 'lucide-react';
import { formatTime } from '@/lib/utils';

const ClassSchedules = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  const [aula, setAula] = useState<Aula | null>(null);
  const [horarios, setHorarios] = useState<HorarioAula[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState<HorarioAulaFormData>({
    id_aula: id || '',
    dia_semana: 1,
    hora_inicio: '08:00',
    id_instrutor: '',
    id_quadra: '',
  });

  const diasSemana: Record<number, string> = {
    1: 'Segunda-feira',
    2: 'Terça-feira',
    3: 'Quarta-feira',
    4: 'Quinta-feira',
    5: 'Sexta-feira',
    6: 'Sábado',
    7: 'Domingo',
  };

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [aulaData, horariosData, instrutoresData, quadrasData] = await Promise.all([
        classesService.get(id!),
        classSchedulesService.list({ id_aula: id }),
        instructorsService.listInstructors({ status: 'ativo' }),
        courtsService.getCourts(),
      ]);

      setAula(aulaData);
      setHorarios(horariosData);
      setInstructors(instrutoresData.data);
      setCourts(quadrasData);
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          title: 'Erro ao carregar dados',
          description: error.message,
          variant: 'destructive',
        });
      }
      navigate('/admin/aulas');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.id_instrutor || !formData.id_quadra) {
      toast({
        title: 'Erro de validação',
        description: 'Instrutor e quadra são obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      await classSchedulesService.create(formData);

      toast({
        title: 'Horário adicionado!',
        description: 'Horário semanal configurado com sucesso.',
      });

      // Limpar formulário
      setFormData({
        id_aula: id || '',
        dia_semana: 1,
        hora_inicio: '08:00',
        id_instrutor: '',
        id_quadra: '',
      });

      // Recarregar horários
      const horariosData = await classSchedulesService.list({ id_aula: id });
      setHorarios(horariosData);
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          title: 'Erro ao adicionar horário',
          description: error.message,
          variant: 'destructive',
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await classSchedulesService.delete(deleteId);

      toast({
        title: 'Horário removido!',
        description: 'Horário semanal removido com sucesso.',
      });

      setHorarios((prev) => prev.filter((h) => h.id_horario_aula !== deleteId));
      setDeleteId(null);
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          title: 'Erro ao remover horário',
          description: error.message,
          variant: 'destructive',
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-fitway-green" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/admin/aulas')}
            className="border-dashboard-border text-white hover:bg-dashboard-border"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">Horários Semanais</h1>
            <p className="text-white/80">
              Configure os horários recorrentes para: <span className="font-semibold">{aula?.nome}</span>
            </p>
          </div>
        </div>

        {/* Botão de Ajuda */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
            >
              <HelpCircle className="mr-2 h-4 w-4" />
              Como Funciona?
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-dashboard-card border-dashboard-border max-w-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-400" />
                Como Configurar Horários Semanais
              </AlertDialogTitle>
              <AlertDialogDescription className="text-white/80 space-y-4 text-left">
                <div className="space-y-3">
                  <p className="font-semibold text-white">📅 O que são Horários Semanais?</p>
                  <p>
                    São as <strong className="text-fitway-green">configurações recorrentes</strong> que definem quando essa aula acontece toda semana.
                  </p>
                  
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 space-y-2">
                    <p className="font-semibold text-blue-200">💡 Exemplo Prático:</p>
                    <p className="text-sm">
                      Você quer que "Beach Tennis Iniciante" aconteça:
                    </p>
                    <ul className="text-sm space-y-1 ml-4">
                      <li>• <strong>Toda Terça-feira às 19:00</strong> com o Instrutor Carlos na Quadra 1</li>
                      <li>• <strong>Toda Quinta-feira às 19:00</strong> com a Instrutora Ana na Quadra 2</li>
                    </ul>
                    <p className="text-sm mt-2">
                      ✅ Configure esses 2 horários aqui!
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="font-semibold text-white">🔄 Como funciona o processo?</p>
                    <ol className="text-sm space-y-2 ml-4">
                      <li><strong>1. Configure os horários</strong> - Defina quando a aula acontece (dia da semana + hora)</li>
                      <li><strong>2. Gere as ocorrências</strong> - Sistema cria as aulas no calendário baseado nos horários</li>
                      <li><strong>3. Alunos se inscrevem</strong> - Alunos escolhem datas específicas para participar</li>
                    </ol>
                  </div>

                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                    <p className="text-sm text-yellow-200">
                      <strong>⚠️ Importante:</strong> Sem horários configurados, você não conseguirá gerar ocorrências no calendário.
                      Configure pelo menos 1 horário semanal antes de prosseguir.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="font-semibold text-white">📝 O que preencher?</p>
                    <ul className="text-sm space-y-1 ml-4">
                      <li><strong>Dia da Semana:</strong> Segunda, Terça, Quarta... (quando repete toda semana)</li>
                      <li><strong>Horário de Início:</strong> Hora que a aula começa (ex: 19:00)</li>
                      <li><strong>Instrutor:</strong> Quem vai ministrar a aula neste horário</li>
                      <li><strong>Quadra:</strong> Onde a aula vai acontecer</li>
                    </ul>
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction className="bg-fitway-green hover:bg-fitway-green/90">
                Entendi!
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário para adicionar horário */}
        <Card className="bg-dashboard-card border-dashboard-border lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Adicionar Horário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dia_semana" className="text-white flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Dia da Semana
                </Label>
                <Select
                  value={String(formData.dia_semana)}
                  onValueChange={(value) => setFormData({ ...formData, dia_semana: Number(value) })}
                >
                  <SelectTrigger className="bg-dashboard-bg border-dashboard-border text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(diasSemana).map(([num, nome]) => (
                      <SelectItem key={num} value={num}>
                        {nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hora_inicio" className="text-white flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Horário de Início
                </Label>
                <Input
                  id="hora_inicio"
                  type="time"
                  value={formData.hora_inicio}
                  onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
                  className="bg-dashboard-bg border-dashboard-border text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="id_instrutor" className="text-white flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Instrutor
                </Label>
                <Select
                  value={formData.id_instrutor}
                  onValueChange={(value) => setFormData({ ...formData, id_instrutor: value })}
                >
                  <SelectTrigger className="bg-dashboard-bg border-dashboard-border text-white">
                    <SelectValue placeholder="Selecione o instrutor" />
                  </SelectTrigger>
                  <SelectContent>
                    {instructors.map((instrutor) => (
                      <SelectItem key={instrutor.id_instrutor} value={instrutor.id_instrutor}>
                        {instrutor.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="id_quadra" className="text-white flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Quadra
                </Label>
                <Select
                  value={formData.id_quadra}
                  onValueChange={(value) => setFormData({ ...formData, id_quadra: value })}
                >
                  <SelectTrigger className="bg-dashboard-bg border-dashboard-border text-white">
                    <SelectValue placeholder="Selecione a quadra" />
                  </SelectTrigger>
                  <SelectContent>
                    {courts.map((quadra) => (
                      <SelectItem key={quadra.id_quadra} value={quadra.id_quadra}>
                        {quadra.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                className="w-full bg-fitway-green hover:bg-fitway-green/90 text-white"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adicionando...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Horário
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Lista de horários cadastrados */}
        <Card className="bg-dashboard-card border-dashboard-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white">
              Horários Cadastrados ({horarios.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {horarios.length === 0 ? (
              <div className="text-center py-12 text-white/60">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum horário cadastrado ainda.</p>
                <p className="text-sm">Adicione horários semanais para essa aula.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-dashboard-border hover:bg-dashboard-border/50">
                    <TableHead className="text-white">Dia da Semana</TableHead>
                    <TableHead className="text-white">Horário</TableHead>
                    <TableHead className="text-white">Instrutor</TableHead>
                    <TableHead className="text-white">Quadra</TableHead>
                    <TableHead className="text-white text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {horarios
                    .sort((a, b) => a.dia_semana - b.dia_semana || a.hora_inicio.localeCompare(b.hora_inicio))
                    .map((horario) => (
                      <TableRow
                        key={horario.id_horario_aula}
                        className="border-dashboard-border hover:bg-dashboard-border/50"
                      >
                        <TableCell className="text-white font-medium">
                          {diasSemana[horario.dia_semana]}
                        </TableCell>
                        <TableCell className="text-white">
                          {formatTime(horario.hora_inicio)}
                        </TableCell>
                        <TableCell className="text-white">
                          {horario.instrutor?.nome || 'N/A'}
                        </TableCell>
                        <TableCell className="text-white">
                          {horario.quadra?.nome || 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteId(horario.id_horario_aula)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-dashboard-card border-dashboard-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-white/80">
              Tem certeza que deseja remover este horário semanal? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-dashboard-border text-white hover:bg-dashboard-border">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ClassSchedules;
