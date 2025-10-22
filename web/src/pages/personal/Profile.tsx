import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { 
  formatCurrency, 
  formatPhone,
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
  AlertCircle
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

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const response: any = await apiClient.get('/instructor/profile');
        
        // A resposta JÁ vem em response.data (não response.data.data)
        const data = response.data;
        
        if (!data) {
          throw new Error('Nenhum dado recebido da API');
        }
        
        setProfile(data);
        const valorHora = typeof data.valor_hora === 'string' 
          ? data.valor_hora 
          : String(data.valor_hora || 0);
        
        setFormData({
          nome: data.nome || '',
          email: data.email || '',
          telefone: data.telefone || '',
          cref: data.cref || '',
          valor_hora: valorHora,
          especialidades: (data.especialidades_json || []).join(', '),
        });
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

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

      const valorHora = parseFloat(formData.valor_hora.replace(',', '.'));
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
              />
              {formData.telefone && (
                <p className="text-xs text-gray-500">
                  Formatado: {formatPhone(formData.telefone)}
                </p>
              )}
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
              />
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
                placeholder="150.00"
                required
              />
              <p className="text-xs text-gray-500">
                Este é o valor cobrado por hora de sessão personal
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
    </div>
  );
}
