import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { formatDate, formatTime } from '@/lib/utils';
import { classesService, classOccurrencesService } from '@/services/classes.service';
import { enrollmentsService } from '@/services/enrollments.service';
import type { Aula, OcorrenciaAula, AdminUser } from '@/types';
import { 
  ArrowLeft,
  Users,
  Calendar,
  Loader2,
  AlertCircle,
  Search,
  X,
  CheckCircle2
} from 'lucide-react';

const BulkEnrollment = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [aula, setAula] = useState<Aula | null>(null);
  const [occurrences, setOccurrences] = useState<OcorrenciaAula[]>([]);
  const [availableStudents, setAvailableStudents] = useState<AdminUser[]>([]);
  
  const [selectedOccurrences, setSelectedOccurrences] = useState<string[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [searchStudent, setSearchStudent] = useState('');
  const [searchOccurrence, setSearchOccurrence] = useState('');

  useEffect(() => {
    if (classId) {
      loadData();
    }
  }, [classId]);

  const loadData = async () => {
    if (!classId) return;

    try {
      setLoading(true);
      
      // Carregar dados da aula
      const classData = await classesService.get(classId);
      setAula(classData);

      // Carregar todas as ocorrências desta aula
      const occurrencesData = await classOccurrencesService.list({
        id_aula: classId,
        status: 'agendada'
      });
      setOccurrences(occurrencesData.data);

      // Carregar alunos disponíveis (busca geral, sem filtro por ocorrência)
      // Vamos buscar todos os alunos ativos
      const studentsResponse = await enrollmentsService.getAvailableStudents('0'); // Fake ID para listar todos
      setAvailableStudents(studentsResponse);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar dados',
        description: error.message || 'Ocorreu um erro',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkEnroll = async () => {
    if (selectedOccurrences.length === 0) {
      toast({
        title: 'Nenhuma ocorrência selecionada',
        description: 'Selecione pelo menos uma data para inscrever os alunos',
        variant: 'destructive'
      });
      return;
    }

    if (selectedStudents.length === 0) {
      toast({
        title: 'Nenhum aluno selecionado',
        description: 'Selecione pelo menos um aluno para inscrever',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSubmitting(true);

      // Inscrever cada aluno em cada ocorrência selecionada
      const promises: Promise<any>[] = [];
      
      selectedOccurrences.forEach(occurrenceId => {
        selectedStudents.forEach(studentId => {
          promises.push(
            enrollmentsService.enrollStudent(occurrenceId, studentId)
          );
        });
      });

      await Promise.allSettled(promises); // allSettled para não parar no primeiro erro

      toast({
        title: 'Inscrições realizadas!',
        description: `${selectedStudents.length} aluno(s) inscrito(s) em ${selectedOccurrences.length} ocorrência(s)`,
      });

      // Limpar seleções
      setSelectedOccurrences([]);
      setSelectedStudents([]);
      
      // Recarregar dados
      loadData();
    } catch (error: any) {
      toast({
        title: 'Erro ao inscrever',
        description: error.message || 'Alguns alunos podem já estar inscritos',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-fitway-green" />
      </div>
    );
  }

  if (!aula) {
    return (
      <div className="p-6">
        <div className="text-center text-white/60">
          <AlertCircle className="h-12 w-12 mx-auto mb-4" />
          <p>Aula não encontrada</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => navigate('/admin/aulas')}
          >
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  const filteredOccurrences = occurrences.filter(occ => {
    if (!searchOccurrence) return true;
    const searchLower = searchOccurrence.toLowerCase();
    return (
      formatDate(occ.inicio).toLowerCase().includes(searchLower) ||
      occ.instrutor?.nome?.toLowerCase().includes(searchLower) ||
      occ.quadra?.nome?.toLowerCase().includes(searchLower)
    );
  });

  const filteredStudents = availableStudents.filter(student => {
    if (!searchStudent) return true;
    const searchLower = searchStudent.toLowerCase();
    return (
      student.nome.toLowerCase().includes(searchLower) ||
      student.email.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin/aulas')}
            className="text-white/60 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">Inscrição em Lote</h1>
            <p className="text-white/60 mt-1">{aula.nome}</p>
          </div>
        </div>

        <Button
          className="bg-fitway-green hover:bg-fitway-green/90"
          onClick={handleBulkEnroll}
          disabled={submitting || selectedOccurrences.length === 0 || selectedStudents.length === 0}
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Inscrevendo...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Confirmar Inscrições ({selectedStudents.length} aluno(s) × {selectedOccurrences.length} data(s))
            </>
          )}
        </Button>
      </div>

      {/* Grid 2 colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coluna 1: Selecionar Ocorrências */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span>1. Selecionar Datas ({selectedOccurrences.length} selecionadas)</span>
              {selectedOccurrences.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-fitway-green hover:text-fitway-green/80"
                  onClick={() => setSelectedOccurrences([])}
                >
                  Limpar
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                placeholder="Buscar por data, instrutor ou quadra..."
                value={searchOccurrence}
                onChange={(e) => setSearchOccurrence(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white"
              />
              {searchOccurrence && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => setSearchOccurrence('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Lista de ocorrências */}
            <div className="max-h-[500px] overflow-y-auto space-y-2 border border-white/10 rounded-lg p-2">
              {filteredOccurrences.length === 0 ? (
                <div className="text-center py-8 text-white/60">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhuma ocorrência encontrada</p>
                </div>
              ) : (
                filteredOccurrences.map((occ) => {
                  const isSelected = selectedOccurrences.includes(occ.id_ocorrencia_aula);
                  const capacidade = occ.inscricoes_count || 0;
                  const isFull = capacidade >= (aula.capacidade_max || 0);

                  return (
                    <div
                      key={occ.id_ocorrencia_aula}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        isSelected ? 'bg-fitway-green/10 border border-fitway-green' : 'bg-white/5 hover:bg-white/10'
                      }`}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedOccurrences(prev => prev.filter(id => id !== occ.id_ocorrencia_aula));
                        } else {
                          setSelectedOccurrences(prev => [...prev, occ.id_ocorrencia_aula]);
                        }
                      }}
                    >
                      <Checkbox checked={isSelected} className="border-white/20" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-fitway-green" />
                          <p className="text-white font-medium">
                            {formatDate(occ.inicio)}
                          </p>
                          {isFull && (
                            <Badge variant="destructive" className="text-xs">
                              Lotada
                            </Badge>
                          )}
                        </div>
                        <p className="text-white/60 text-sm">
                          {formatTime(occ.inicio)} - {formatTime(occ.fim)} • {capacidade}/{aula.capacidade_max} alunos
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Coluna 2: Selecionar Alunos */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span>2. Selecionar Alunos ({selectedStudents.length} selecionados)</span>
              {selectedStudents.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-fitway-green hover:text-fitway-green/80"
                  onClick={() => setSelectedStudents([])}
                >
                  Limpar
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white"
              />
              {searchStudent && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => setSearchStudent('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Lista de alunos */}
            <div className="max-h-[500px] overflow-y-auto space-y-2 border border-white/10 rounded-lg p-2">
              {filteredStudents.length === 0 ? (
                <div className="text-center py-8 text-white/60">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhum aluno encontrado</p>
                </div>
              ) : (
                filteredStudents.map((student) => {
                  const isSelected = selectedStudents.includes(student.id_usuario);

                  return (
                    <div
                      key={student.id_usuario}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        isSelected ? 'bg-fitway-green/10 border border-fitway-green' : 'bg-white/5 hover:bg-white/10'
                      }`}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedStudents(prev => prev.filter(id => id !== student.id_usuario));
                        } else {
                          setSelectedStudents(prev => [...prev, student.id_usuario]);
                        }
                      }}
                    >
                      <Checkbox checked={isSelected} className="border-white/20" />
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{student.nome}</p>
                        <p className="text-white/60 text-sm truncate">{student.email}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BulkEnrollment;
