import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils';
import { enrollmentsService } from '@/services/enrollments.service';
import { ApiError } from '@/lib/api-client';
import type { InscricaoAula, AdminUser } from '@/types';
import { 
  ArrowLeft,
  UserPlus,
  Trash2,
  Loader2,
  Users,
  Calendar,
  MapPin,
  User,
  Mail,
  AlertCircle,
  Search,
  X
} from 'lucide-react';

const OccurrenceEnrollments = () => {
  const { occurrenceId } = useParams<{ occurrenceId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<InscricaoAula[]>([]);
  const [availableStudents, setAvailableStudents] = useState<AdminUser[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]); // ✅ Array para multi-seleção
  const [searchQuery, setSearchQuery] = useState(''); // ✅ Busca
  const [addingStudent, setAddingStudent] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);

  useEffect(() => {
    if (occurrenceId) {
      loadEnrollments();
      loadAvailableStudents();
    }
  }, [occurrenceId]);

  const loadEnrollments = async () => {
    if (!occurrenceId) return;
    
    try {
      setLoading(true);
      const response = await enrollmentsService.listByOccurrence(occurrenceId);
      setEnrollments(response.data);
      setMeta(response.meta);
    } catch (error) {
      const apiError = error as ApiError;
      toast({
        title: 'Erro ao carregar inscrições',
        description: apiError.message || 'Ocorreu um erro ao buscar as inscrições',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableStudents = async () => {
    if (!occurrenceId) return;
    
    try {
      const students = await enrollmentsService.getAvailableStudents(occurrenceId);
      setAvailableStudents(students);
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
    }
  };

  const handleAddStudent = async () => {
    if (!selectedStudents.length || !occurrenceId) return;

    // ✅ VALIDAÇÃO FRONTEND: Verificar se excede capacidade
    const vagasDisponiveis = meta?.vagas_disponiveis || 0;
    if (selectedStudents.length > vagasDisponiveis) {
      toast({
        title: 'Limite de vagas excedido!',
        description: `Você selecionou ${selectedStudents.length} aluno(s), mas há apenas ${vagasDisponiveis} vaga(s) disponível(is).`,
        variant: 'destructive'
      });
      return; // ⛔ Bloqueia a inscrição
    }

    try {
      setAddingStudent(true);
      
      // ✅ Inscrever múltiplos alunos em paralelo
      const promises = selectedStudents.map(studentId => 
        enrollmentsService.enrollStudent(occurrenceId, studentId)
      );
      
      await Promise.all(promises);
      
      toast({
        title: `${selectedStudents.length} aluno(s) inscrito(s) com sucesso!`,
        description: 'Os alunos foram adicionados à ocorrência.',
      });

      setShowAddDialog(false);
      setSelectedStudents([]);
      setSearchQuery('');
      loadEnrollments();
      loadAvailableStudents();
    } catch (error) {
      const apiError = error as ApiError;
      
      let description = apiError.message || 'Ocorreu um erro ao inscrever o(s) aluno(s)';
      
      // Mensagens específicas de erro
      if (apiError.errors) {
        const errorMessages = Object.entries(apiError.errors)
          .map(([field, messages]) => `• ${messages[0]}`)
          .join('\n');
        description = errorMessages;
      }
      
      toast({
        title: 'Erro ao inscrever aluno',
        description,
        variant: 'destructive'
      });
    } finally {
      setAddingStudent(false);
    }
  };

  const handleRemoveEnrollment = async (enrollmentId: string, studentName: string) => {
    try {
      await enrollmentsService.removeEnrollment(enrollmentId);
      
      toast({
        title: 'Inscrição removida',
        description: `${studentName} foi removido da aula.`,
      });

      loadEnrollments();
      loadAvailableStudents();
    } catch (error) {
      const apiError = error as ApiError;
      toast({
        title: 'Erro ao remover inscrição',
        description: apiError.message || 'Ocorreu um erro ao remover a inscrição',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-fitway-green" />
      </div>
    );
  }

  if (!meta) {
    return (
      <div className="p-6">
        <div className="text-center text-white/60">
          <AlertCircle className="h-12 w-12 mx-auto mb-4" />
          <p>Ocorrência não encontrada</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => navigate(-1)}
          >
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  const capacityPercentage = (meta.capacidade_atual / meta.capacidade_maxima) * 100;
  const isFull = meta.capacidade_atual >= meta.capacidade_maxima;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-white/60 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">Inscrições da Ocorrência</h1>
            <p className="text-white/60 mt-1">Gerencie os alunos inscritos nesta aula</p>
          </div>
        </div>

        <AlertDialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <AlertDialogTrigger asChild>
            <Button 
              className="bg-fitway-green hover:bg-fitway-green/90"
              disabled={isFull}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Inscrever Alunos
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-[#1a1a1a] border-white/10 max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Inscrever Alunos</AlertDialogTitle>
              <AlertDialogDescription className="text-white/60">
                Selecione um ou mais alunos para inscrever nesta ocorrência ({selectedStudents.length} selecionado{selectedStudents.length !== 1 ? 's' : ''})
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <div className="space-y-4 py-4 flex-1 overflow-hidden flex flex-col">
              {/* Busca */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input
                  placeholder="Buscar aluno por nome ou email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 text-white/60 hover:text-white"
                    onClick={() => setSearchQuery('')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Lista de alunos com checkbox */}
              <div className="flex-1 overflow-y-auto border border-white/10 rounded-lg bg-white/5">
                {!availableStudents || availableStudents.length === 0 ? (
                  <div className="p-8 text-center text-white/60">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhum aluno disponível</p>
                  </div>
                ) : (
                  <>
                    {availableStudents
                      .filter(student => {
                        if (!searchQuery) return true;
                        const query = searchQuery.toLowerCase();
                        return (
                          student.nome.toLowerCase().includes(query) ||
                          student.email.toLowerCase().includes(query)
                        );
                      })
                      .map((student) => {
                        const isSelected = selectedStudents.includes(student.id_usuario);
                        const vagasDisponiveis = meta.vagas_disponiveis || 0;
                        const podeSelecionarMais = selectedStudents.length < vagasDisponiveis;
                        const isDisabled = !isSelected && !podeSelecionarMais;
                        
                        return (
                          <div
                            key={student.id_usuario}
                            className={`flex items-center gap-3 p-3 border-b border-white/5 transition-colors ${
                              isDisabled 
                                ? 'opacity-50 cursor-not-allowed' 
                                : 'hover:bg-white/5 cursor-pointer'
                            } ${isSelected ? 'bg-fitway-green/10' : ''}`}
                            onClick={() => {
                              if (isDisabled) return; // ✅ Impede clique se atingiu limite
                              
                              if (isSelected) {
                                setSelectedStudents(prev => prev.filter(id => id !== student.id_usuario));
                              } else {
                                setSelectedStudents(prev => [...prev, student.id_usuario]);
                              }
                            }}
                          >
                            <Checkbox
                              checked={isSelected}
                              disabled={isDisabled}
                              className="border-white/20 data-[state=checked]:bg-fitway-green data-[state=checked]:border-fitway-green"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-medium truncate">{student.nome}</p>
                              <p className="text-white/50 text-sm truncate">{student.email}</p>
                            </div>
                            <User className="h-4 w-4 text-white/40 flex-shrink-0" />
                          </div>
                        );
                      })}
                  </>
                )}
              </div>

              {/* Alerta quando atingir limite */}
              {selectedStudents.length >= (meta?.vagas_disponiveis || 0) && selectedStudents.length > 0 && (
                <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                  <span className="text-yellow-500 text-sm">
                    Limite de vagas atingido! Você selecionou o máximo permitido ({meta.vagas_disponiveis} vaga{meta.vagas_disponiveis !== 1 ? 's' : ''}).
                  </span>
                </div>
              )}

              {/* Contador */}
              {selectedStudents.length > 0 && (
                <div className="flex items-center justify-between p-3 bg-fitway-green/10 border border-fitway-green/30 rounded-lg">
                  <span className="text-white text-sm">
                    {selectedStudents.length} de {meta?.vagas_disponiveis || 0} vaga{(meta?.vagas_disponiveis || 0) !== 1 ? 's' : ''} selecionada{selectedStudents.length !== 1 ? 's' : ''}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-fitway-green hover:text-fitway-green/80 h-auto p-1"
                    onClick={() => setSelectedStudents([])}
                  >
                    Limpar seleção
                  </Button>
                </div>
              )}
            </div>
            
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-white/5 hover:bg-white/10 text-white border-white/10">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-fitway-green hover:bg-fitway-green/90 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleAddStudent}
                disabled={
                  selectedStudents.length === 0 || 
                  addingStudent || 
                  selectedStudents.length > (meta?.vagas_disponiveis || 0) // ✅ Desabilita se exceder
                }
              >
                {addingStudent ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Inscrevendo...
                  </>
                ) : (
                  `Inscrever (${selectedStudents.length})`
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Informações da Ocorrência */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-fitway-green" />
              <div>
                <p className="text-white/60 text-sm">Data/Hora</p>
                <p className="text-white font-medium">
                  {formatDate(meta.ocorrencia.inicio, true)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-fitway-green" />
              <div>
                <p className="text-white/60 text-sm">Aula</p>
                <p className="text-white font-medium">{meta.ocorrencia.aula_nome}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-fitway-green" />
              <div>
                <p className="text-white/60 text-sm">Instrutor</p>
                <p className="text-white font-medium">{meta.ocorrencia.instrutor_nome}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-fitway-green" />
              <div>
                <p className="text-white/60 text-sm">Quadra</p>
                <p className="text-white font-medium">{meta.ocorrencia.quadra_nome}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Capacidade */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5" />
            Capacidade
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-white">
                {meta.capacidade_atual} / {meta.capacidade_maxima}
              </p>
              <p className="text-white/60 text-sm">
                {meta.vagas_disponiveis} {meta.vagas_disponiveis === 1 ? 'vaga disponível' : 'vagas disponíveis'}
              </p>
            </div>
            <Badge 
              variant={isFull ? 'destructive' : 'secondary'}
              className={isFull ? '' : 'bg-fitway-green/20 text-fitway-green'}
            >
              {isFull ? 'Lotado' : `${capacityPercentage.toFixed(0)}% ocupado`}
            </Badge>
          </div>

          {/* Barra de progresso */}
          <div className="w-full bg-white/10 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all ${
                isFull ? 'bg-red-500' : 'bg-fitway-green'
              }`}
              style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de Inscrições */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">
            Alunos Inscritos ({enrollments?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!enrollments || enrollments.length === 0 ? (
            <div className="text-center py-12 text-white/60">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum aluno inscrito ainda</p>
              <p className="text-sm mt-2">Clique em "Inscrever Aluno" para adicionar</p>
            </div>
          ) : (
            <div className="space-y-2">
              {enrollments.map((enrollment) => (
                <div 
                  key={enrollment.id_inscricao_aula}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-fitway-green/20 flex items-center justify-center">
                      <User className="h-5 w-5 text-fitway-green" />
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {enrollment.usuario?.name || 'Usuário desconhecido'}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <Mail className="h-3 w-3" />
                        {enrollment.usuario?.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge 
                      variant="secondary"
                      className="bg-green-500/20 text-green-400"
                    >
                      {enrollment.status}
                    </Badge>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-[#1a1a1a] border-white/10">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-white">
                            Remover Inscrição
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-white/60">
                            Tem certeza que deseja remover <strong>{enrollment.usuario?.name}</strong> desta ocorrência?
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-white/5 hover:bg-white/10 text-white border-white/10">
                            Cancelar
                          </AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-500 hover:bg-red-600"
                            onClick={() => handleRemoveEnrollment(
                              enrollment.id_inscricao_aula, 
                              enrollment.usuario?.name || 'Aluno'
                            )}
                          >
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OccurrenceEnrollments;
