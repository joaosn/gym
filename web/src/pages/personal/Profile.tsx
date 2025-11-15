import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { 
  formatCurrency, 
  formatPhone,
  maskPhone,
  maskCREF,
  maskCurrency,
  parseCurrency,
  isValidEmail,
  getErrorMessage 
} from '@/lib/utils';
import { 
  User, 
  Mail, 
  Phone, 
  DollarSign, 
  Award, 
  Save,
  Loader2,
  AlertCircle,
  Clock,
  Plus,
  Trash2,
  Edit
} from 'lucide-react';

interface InstructorProfile {
  id_instrutor?: number;
  id_usuario?: number;
  nome: string;
  email: string;
  telefone?: string;
  cref?: string;
  valor_hora: string | number;
  especialidades_json?: string[] | null;
}

interface DisponibilidadeSlot {
  id_disponibilidade: number;
  id_instrutor: number;
  dia_semana: number; // 1-7 (Segunda a Domingo)
  hora_inicio: string; // "08:00:00"
  hora_fim: string; // "12:00:00"
  disponivel: boolean;
}

const DIAS_SEMANA = [
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' },
  { value: 7, label: 'Domingo' },
];

export default function InstructorProfile() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState<InstructorProfile | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cref: '',
    valor_hora: '',
    especialidades: '',
  });

  // Estados para horários disponíveis
  const [horarios, setHorarios] = useState<DisponibilidadeSlot[]>([]);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [showNovoHorarioModal, setShowNovoHorarioModal] = useState(false);
  const [editandoHorario, setEditandoHorario] = useState<DisponibilidadeSlot | null>(null);
  const [horarioFormData, setHorarioFormData] = useState({
    dia_semana: 1,
    hora_inicio: '08:00',
    hora_fim: '12:00',
    disponivel: true,
  });

  // Função para carregar horários (declarada antes dos useEffects)
  const loadHorarios = useCallback(async () => {
    try {
      setLoadingHorarios(true);
      console.log('🔄 Chamando API /instructor/availability...');
      const response: any = await apiClient.get('/instructor/availability');
      console.log('✅ Response completo:', response);
      console.log('✅ Response.data:', response.data);
      
      // API retorna array direto, não wrapped
      const horarios = Array.isArray(response) ? response : (response.data || []);
      console.log('✅ Horários processados:', horarios);
      setHorarios(horarios);
    } catch (error: any) {
      console.error('❌ Erro ao carregar horários:', error);
      toast({
        title: 'Erro ao carregar horários',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setLoadingHorarios(false);
    }
  }, [toast]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const response: any = await apiClient.get('/instructor/profile');
        
        // A resposta vem em response.data.data (wrapped)
        const data = response.data.data || response.data;
        
        if (!data) {
          throw new Error('Nenhum dado recebido da API');
        }
        
        console.log('📋 Profile carregado:', data);
        setProfile(data);
        
        const valorHora = typeof data.valor_hora === 'string' 
          ? data.valor_hora 
          : String(data.valor_hora || 0);
        
        // Aplicar máscaras aos dados carregados
        const telefoneFormatado = data.telefone ? maskPhone(data.telefone) : '';
        const crefFormatado = data.cref ? maskCREF(data.cref) : '';
        const rawValor = parseFloat(valorHora);
        const valorFormatado = !isNaN(rawValor) && rawValor > 0
          ? maskCurrency(String(Math.round(rawValor * 100)))
          : 'R$ 0,00';
        
        setFormData({
          nome: data.nome || '',
          email: data.email || '',
          telefone: telefoneFormatado,
          cref: crefFormatado,
          valor_hora: valorFormatado,
          especialidades: (data.especialidades_json || []).join(', '),
        });
        
        // 🚀 Carregar horários logo após carregar perfil
        console.log('🔍 Verificando id_instrutor:', data.id_instrutor);
        if (data.id_instrutor) {
          console.log('🕐 Carregando horários para instrutor:', data.id_instrutor);
          loadHorarios();
        } else {
          console.warn('⚠️ id_instrutor não encontrado no profile!', data);
        }
      } catch (error: any) {
        console.error('❌ Erro:', error);
        toast({
          title: 'Erro ao carregar perfil',
          description: getErrorMessage(error),
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [toast]);

  // ❌ REMOVIDO: useEffect duplicado causava loop infinito
  // A função loadHorarios() já é chamada dentro do loadProfile()

  const handleCriarHorario = async () => {
    try {
      await apiClient.post('/instructor/availability', {
        dia_semana: horarioFormData.dia_semana,
        hora_inicio: horarioFormData.hora_inicio + ':00',
        hora_fim: horarioFormData.hora_fim + ':00',
        disponivel: horarioFormData.disponivel,
      });

      toast({
        title: 'Horário adicionado!',
        description: 'Horário disponível criado com sucesso.',
      });

      setShowNovoHorarioModal(false);
      setHorarioFormData({
        dia_semana: 1,
        hora_inicio: '08:00',
        hora_fim: '12:00',
        disponivel: true,
      });
      loadHorarios();
    } catch (error: any) {
      toast({
        title: 'Erro ao criar horário',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    }
  };

  const handleEditarHorario = async () => {
    if (!editandoHorario) return;

    try {
      await apiClient.put(`/instructor/availability/${editandoHorario.id_disponibilidade}`, {
        dia_semana: horarioFormData.dia_semana,
        hora_inicio: horarioFormData.hora_inicio + ':00',
        hora_fim: horarioFormData.hora_fim + ':00',
        disponivel: horarioFormData.disponivel,
      });

      toast({
        title: 'Horário atualizado!',
        description: 'Horário disponível alterado com sucesso.',
      });

      setEditandoHorario(null);
      setHorarioFormData({
        dia_semana: 1,
        hora_inicio: '08:00',
        hora_fim: '12:00',
        disponivel: true,
      });
      loadHorarios();
    } catch (error: any) {
      toast({
        title: 'Erro ao editar horário',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    }
  };

  const handleDeletarHorario = async (id: number) => {
    if (!confirm('Deseja realmente excluir este horário?')) return;

    try {
      await apiClient.delete(`/instructor/availability/${id}`);
      toast({
        title: 'Horário excluído!',
        description: 'Horário removido com sucesso.',
      });
      loadHorarios();
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir horário',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    }
  };

  const abrirModalEditar = (horario: DisponibilidadeSlot) => {
    setEditandoHorario(horario);
    setHorarioFormData({
      dia_semana: horario.dia_semana,
      hora_inicio: horario.hora_inicio.substring(0, 5), // "08:00:00" -> "08:00"
      hora_fim: horario.hora_fim.substring(0, 5),
      disponivel: horario.disponivel,
    });
  };

  const handleChange = (field: string, value: string) => {
    // Aplicar máscaras conforme o campo
    let maskedValue = value;
    
    if (field === 'telefone') {
      maskedValue = maskPhone(value);
    } else if (field === 'cref') {
      maskedValue = maskCREF(value);
    } else if (field === 'valor_hora') {
      maskedValue = maskCurrency(value);
    }
    
    setFormData(prev => ({ ...prev, [field]: maskedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);

      // Validações
      if (!formData.nome.trim()) {
        toast({
          title: 'Nome obrigatório',
          description: 'Por favor, preencha o seu nome.',
          variant: 'destructive',
        });
        return;
      }

      if (!formData.email.trim()) {
        toast({
          title: 'Email obrigatório',
          description: 'Por favor, preencha o seu email.',
          variant: 'destructive',
        });
        return;
      }

      if (!isValidEmail(formData.email)) {
        toast({
          title: 'Email inválido',
          description: 'Por favor, informe um email válido.',
          variant: 'destructive',
        });
        return;
      }

      const valorHora = parseCurrency(formData.valor_hora);
      if (isNaN(valorHora) || valorHora <= 0) {
        toast({
          title: 'Valor/hora inválido',
          description: 'Por favor, informe um valor válido maior que zero.',
          variant: 'destructive',
        });
        return;
      }

      // Preparar especialidades (converter de string para array)
      const especialidades = formData.especialidades
        .split(',')
        .map(e => e.trim())
        .filter(e => e.length > 0);

      // Atualizar perfil
      await apiClient.put(`/instructor/profile`, {
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        cref: formData.cref,
        valor_hora: valorHora,
        especialidades_json: especialidades.length > 0 ? especialidades : null,
      });

      toast({
        title: 'Perfil atualizado!',
        description: 'Suas informações foram salvas com sucesso.',
      });

      // Recarregar página para ver dados atualizados
      window.location.reload();
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar perfil',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-fitway-green" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Não foi possível carregar seu perfil. Tente recarregar a página.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Meu Perfil</h1>
        <p className="text-gray-400">
          Gerencie suas informações pessoais e valor/hora
        </p>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações Pessoais
            </CardTitle>
            <CardDescription>
              Atualize seus dados cadastrais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Nome */}
            <div className="grid gap-2">
              <Label htmlFor="nome" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Nome Completo *
              </Label>
              <Input
                id="nome"
                type="text"
                value={formData.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                placeholder="Seu nome completo"
                required
              />
            </div>

            {/* Email */}
            <div className="grid gap-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="seu@email.com"
                required
              />
            </div>

            {/* Telefone */}
            <div className="grid gap-2">
              <Label htmlFor="telefone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Telefone
              </Label>
              <Input
                id="telefone"
                type="tel"
                value={formData.telefone}
                onChange={(e) => handleChange('telefone', e.target.value)}
                placeholder="(11) 98888-7777"
                maxLength={15}
              />
            </div>

            {/* CREF */}
            <div className="grid gap-2">
              <Label htmlFor="cref" className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                CREF
              </Label>
              <Input
                id="cref"
                type="text"
                value={formData.cref}
                onChange={(e) => handleChange('cref', e.target.value)}
                placeholder="123456-G/SP"
                maxLength={12}
              />
              <p className="text-xs text-gray-500">
                Ex: 123456-G/SP (número-categoria/UF)
              </p>
            </div>

            {/* Valor/Hora */}
            <div className="grid gap-2">
              <Label htmlFor="valor_hora" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Valor por Hora (R$) *
              </Label>
              <Input
                id="valor_hora"
                type="text"
                value={formData.valor_hora}
                onChange={(e) => handleChange('valor_hora', e.target.value)}
                placeholder="150,00"
                maxLength={10}
                required
              />
              <p className="text-xs text-gray-500">
                Digite apenas números (ex: 15000 = R$ 150,00)
              </p>
            </div>

            {/* Especialidades */}
            <div className="grid gap-2">
              <Label htmlFor="especialidades" className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Especialidades
              </Label>
              <Textarea
                id="especialidades"
                value={formData.especialidades}
                onChange={(e) => handleChange('especialidades', e.target.value)}
                placeholder="Beach Tennis, Tênis, Musculação (separado por vírgula)"
                rows={3}
              />
              <p className="text-xs text-gray-500">
                Separe múltiplas especialidades por vírgula
              </p>
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.location.reload()}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-fitway-green hover:bg-fitway-green/90"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Card de Informações Atuais */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Salvas</CardTitle>
          <CardDescription>
            Dados atualmente cadastrados no sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-400">Nome</p>
              <p className="text-white">{profile.nome}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Email</p>
              <p className="text-white">{profile.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Telefone</p>
              <p className="text-white">
                {profile.telefone ? formatPhone(profile.telefone) : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">CREF</p>
              <p className="text-white">{profile.cref || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Valor/Hora</p>
              <p className="text-white font-bold text-fitway-green">
                {formatCurrency(
                  typeof profile.valor_hora === 'string' 
                    ? parseFloat(profile.valor_hora) 
                    : profile.valor_hora
                )}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Especialidades</p>
              <p className="text-white">
                {profile.especialidades_json?.join(', ') || '-'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Horários Disponíveis */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Horários Disponíveis
              </CardTitle>
              <CardDescription>
                Gerencie sua disponibilidade semanal para sessões
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowNovoHorarioModal(true)}
              className="bg-fitway-green hover:bg-fitway-green/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Horário
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loadingHorarios ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-fitway-green" />
            </div>
          ) : horarios.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Clock className="h-12 w-12 mx-auto mb-3 text-gray-600" />
              <p>Nenhum horário cadastrado</p>
              <p className="text-sm mt-1">Adicione seus horários disponíveis para receber agendamentos</p>
            </div>
          ) : (
            <div className="space-y-2">
              {horarios.map((horario) => {
                const diaNome = DIAS_SEMANA.find(d => d.value === horario.dia_semana)?.label || '-';
                return (
                  <div
                    key={horario.id_disponibilidade}
                    className="flex items-center justify-between p-3 bg-gray-700 rounded border border-gray-600"
                  >
                    <div className="flex items-center gap-4">
                      <div className="min-w-[120px]">
                        <p className="font-medium text-white">{diaNome}</p>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <Clock className="h-4 w-4" />
                        <span>{horario.hora_inicio.substring(0, 5)} - {horario.hora_fim.substring(0, 5)}</span>
                      </div>
                      <div>
                        {horario.disponivel ? (
                          <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">
                            ✓ Disponível
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded">
                            ✗ Indisponível
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => abrirModalEditar(horario)}
                        className="border-gray-600"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletarHorario(horario.id_disponibilidade)}
                        className="border-red-500 text-red-500 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Novo/Editar Horário */}
      <Dialog open={showNovoHorarioModal || !!editandoHorario} onOpenChange={(open) => {
        if (!open) {
          setShowNovoHorarioModal(false);
          setEditandoHorario(null);
          setHorarioFormData({
            dia_semana: 1,
            hora_inicio: '08:00',
            hora_fim: '12:00',
            disponivel: true,
          });
        }
      }}>
        <DialogContent className="bg-gray-800 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle>
              {editandoHorario ? 'Editar Horário' : 'Novo Horário Disponível'}
            </DialogTitle>
            <DialogDescription>
              {editandoHorario 
                ? 'Altere as informações do horário disponível'
                : 'Adicione um novo horário à sua disponibilidade semanal'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Dia da Semana */}
            <div className="grid gap-2">
              <Label htmlFor="dia_semana">Dia da Semana *</Label>
              <Select
                value={String(horarioFormData.dia_semana)}
                onValueChange={(value) => setHorarioFormData(prev => ({ ...prev, dia_semana: parseInt(value) }))}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {DIAS_SEMANA.map((dia) => (
                    <SelectItem key={dia.value} value={String(dia.value)}>
                      {dia.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Horário Início */}
            <div className="grid gap-2">
              <Label htmlFor="hora_inicio">Horário de Início *</Label>
              <Input
                id="hora_inicio"
                type="time"
                value={horarioFormData.hora_inicio}
                onChange={(e) => setHorarioFormData(prev => ({ ...prev, hora_inicio: e.target.value }))}
                className="bg-gray-700 border-gray-600"
              />
            </div>

            {/* Horário Fim */}
            <div className="grid gap-2">
              <Label htmlFor="hora_fim">Horário de Término *</Label>
              <Input
                id="hora_fim"
                type="time"
                value={horarioFormData.hora_fim}
                onChange={(e) => setHorarioFormData(prev => ({ ...prev, hora_fim: e.target.value }))}
                className="bg-gray-700 border-gray-600"
              />
            </div>

            {/* Disponível */}
            <div className="flex items-center justify-between">
              <Label htmlFor="disponivel" className="flex flex-col gap-1">
                <span>Disponível para agendamentos</span>
                <span className="text-xs text-gray-400 font-normal">
                  Desative se quiser bloquear este horário temporariamente
                </span>
              </Label>
              <Switch
                id="disponivel"
                checked={horarioFormData.disponivel}
                onCheckedChange={(checked) => setHorarioFormData(prev => ({ ...prev, disponivel: checked }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowNovoHorarioModal(false);
                setEditandoHorario(null);
              }}
              className="border-gray-600"
            >
              Cancelar
            </Button>
            <Button
              onClick={editandoHorario ? handleEditarHorario : handleCriarHorario}
              className="bg-fitway-green hover:bg-fitway-green/90"
            >
              <Save className="h-4 w-4 mr-2" />
              {editandoHorario ? 'Salvar Alterações' : 'Adicionar Horário'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
