import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { formatDate, formatTime } from '@/lib/utils';
import { classesService, classOccurrencesService } from '@/services/classes.service';
import type { Aula, OcorrenciaAula } from '@/types';
import { 
  ArrowLeft,
  Users,
  Calendar,
  MapPin,
  User as UserIcon,
  Loader2,
  Clock,
  AlertCircle
} from 'lucide-react';

const ClassOccurrencesList = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [aula, setAula] = useState<Aula | null>(null);
  const [occurrences, setOccurrences] = useState<OcorrenciaAula[]>([]);

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
        status: 'agendada' // Apenas ocorrências agendadas/ativas
      });
      
      setOccurrences(occurrencesData.data);
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
            <h1 className="text-3xl font-bold text-white">{aula.nome}</h1>
            <p className="text-white/60 mt-1">
              {occurrences.length} ocorrência{occurrences.length !== 1 ? 's' : ''} gerada{occurrences.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <Button
          className="bg-orange-500 hover:bg-orange-600"
          onClick={() => navigate(`/admin/aulas/${classId}/inscricao-lote`)}
        >
          <UserIcon className="mr-2 h-4 w-4" />
          Inscrição em Lote
        </Button>
      </div>

      {/* Informações da Aula */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Informações da Aula</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-white/60 text-sm">Esporte</p>
              <p className="text-white font-medium">{aula.esporte}</p>
            </div>
            <div>
              <p className="text-white/60 text-sm">Nível</p>
              <Badge variant="outline" className="border-fitway-green text-fitway-green">
                {aula.nivel}
              </Badge>
            </div>
            <div>
              <p className="text-white/60 text-sm">Duração</p>
              <p className="text-white font-medium flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {aula.duracao_min} min
              </p>
            </div>
            <div>
              <p className="text-white/60 text-sm">Capacidade</p>
              <p className="text-white font-medium flex items-center gap-1">
                <Users className="h-4 w-4" />
                {aula.capacidade_max} alunos
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Ocorrências */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Ocorrências (Datas Específicas)</CardTitle>
        </CardHeader>
        <CardContent>
          {occurrences.length === 0 ? (
            <div className="text-center py-12 text-white/60">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma ocorrência gerada ainda</p>
              <p className="text-sm mt-2">Clique em "Gerar" na página de Aulas para criar ocorrências</p>
            </div>
          ) : (
            <div className="space-y-2">
              {occurrences.map((occurrence) => {
                const capacidadeAtual = occurrence.inscricoes_count || 0;
                const capacidadeMaxima = aula.capacidade_max;
                const percentual = (capacidadeAtual / capacidadeMaxima) * 100;
                const isFull = capacidadeAtual >= capacidadeMaxima;

                return (
                  <div
                    key={occurrence.id_ocorrencia_aula}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {/* Data */}
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-fitway-green" />
                        <div>
                          <p className="text-white font-medium">
                            {formatDate(occurrence.inicio)}
                          </p>
                          <p className="text-white/60 text-sm">
                            {formatTime(occurrence.inicio)} - {formatTime(occurrence.fim)}
                          </p>
                        </div>
                      </div>

                      {/* Instrutor */}
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4 text-white/40" />
                        <span className="text-white/80 text-sm">
                          {occurrence.instrutor?.nome || 'Sem instrutor'}
                        </span>
                      </div>

                      {/* Quadra */}
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-white/40" />
                        <span className="text-white/80 text-sm">
                          {occurrence.quadra?.nome || 'Sem quadra'}
                        </span>
                      </div>

                      {/* Capacidade */}
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-white/40" />
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${isFull ? 'text-red-400' : 'text-white'}`}>
                            {capacidadeAtual}/{capacidadeMaxima}
                          </span>
                          {isFull && (
                            <Badge variant="destructive" className="text-xs">
                              Lotada
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Barra de progresso */}
                      <div className="flex-1 max-w-[200px]">
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all ${
                              isFull ? 'bg-red-500' : 'bg-fitway-green'
                            }`}
                            style={{ width: `${Math.min(percentual, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Botão Gerenciar */}
                    <Button
                      size="sm"
                      className="bg-purple-500 hover:bg-purple-600"
                      onClick={() => navigate(`/admin/aulas/ocorrencias/${occurrence.id_ocorrencia_aula}/inscricoes`)}
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Gerenciar Inscrições
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClassOccurrencesList;
