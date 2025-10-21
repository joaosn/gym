import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { paymentsService } from '@/services/payments.service';
import type { Cobranca, PaymentHistoryFilters } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Loader2, Receipt, Clock, CheckCircle, XCircle, AlertCircle, Plus, Link as LinkIcon } from 'lucide-react';

export default function PaymentHistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [cobrancas, setCobrancas] = useState<Cobranca[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<PaymentHistoryFilters>({
    status: 'all',
    page: 1,
    per_page: 20,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    current_page: 1,
    last_page: 1,
  });
  const [showNewChargeModal, setShowNewChargeModal] = useState(false);
  const [newChargeForm, setNewChargeForm] = useState({
    descricao: '',
    valor: '',
    vencimento: new Date().toISOString().split('T')[0],
    observacoes: '',
  });
  const [creatingCharge, setCreatingCharge] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'aluno') {
      navigate('/');
      return;
    }
    loadHistory();
  }, [filters, user]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const response = await paymentsService.getMyHistory(filters);
      setCobrancas(response.data);
      setPagination({
        total: response.total,
        current_page: response.current_page,
        last_page: response.last_page,
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar histórico',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'destructive' | 'outline' | 'secondary'; icon: any }> = {
      pendente: { variant: 'outline', icon: Clock },
      parcialmente_pago: { variant: 'secondary', icon: AlertCircle },
      pago: { variant: 'default', icon: CheckCircle },
      cancelado: { variant: 'destructive', icon: XCircle },
      estornado: { variant: 'destructive', icon: XCircle },
    };

    const config = variants[status] || variants.pendente;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {status === 'parcialmente_pago' ? 'Parc. Pago' : status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      assinatura: 'Assinatura',
      reserva_quadra: 'Reserva de Quadra',
      sessao_personal: 'Sessão Personal',
      inscricao_aula: 'Aula em Grupo',
    };
    return labels[tipo] || tipo;
  };

  const handleGenerateLink = async (cobranca: Cobranca) => {
    try {
      // usar primeira parcela pendente
      const parcelaPendente = cobranca.parcelas?.find((p) => p.status === 'pendente');
      if (!parcelaPendente) {
        toast({ title: 'Sem parcela pendente', description: 'Não há parcela pendente para esta cobrança', variant: 'destructive' });
        return;
      }
      const res = await paymentsService.createCheckoutMercadoPago(String(parcelaPendente.id_parcela));
      if (res.url_checkout) {
        window.location.href = res.url_checkout;
      }
    } catch (error: any) {
      toast({ title: 'Erro ao gerar link', description: error.message, variant: 'destructive' });
    }
  };

  const handleViewCharge = (cobranca: Cobranca) => {
    // Se pendente, redirecionar para checkout
    if (cobranca.status === 'pendente' && cobranca.parcelas && cobranca.parcelas.length > 0) {
      const parcela = cobranca.parcelas[0];
      navigate(`/aluno/checkout/${parcela.id_parcela}`);
    }
  };

  const handleCreateCharge = async () => {
    if (!newChargeForm.descricao || !newChargeForm.valor) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha descrição e valor',
        variant: 'destructive',
      });
      return;
    }

    setCreatingCharge(true);
    try {
      await paymentsService.createManualCharge({
        descricao: newChargeForm.descricao,
        valor: parseFloat(newChargeForm.valor),
        vencimento: newChargeForm.vencimento,
        observacoes: newChargeForm.observacoes || undefined,
      });

      toast({
        title: 'Cobrança criada!',
        description: 'Nova cobrança adicionada ao seu histórico',
      });

      setShowNewChargeModal(false);
      setNewChargeForm({
        descricao: '',
        valor: '',
        vencimento: new Date().toISOString().split('T')[0],
        observacoes: '',
      });

      loadHistory();
    } catch (error: any) {
      toast({
        title: 'Erro ao criar cobrança',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setCreatingCharge(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Histórico de Pagamentos</h1>
          <p className="text-muted-foreground">Acompanhe todas as suas cobranças</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={showNewChargeModal} onOpenChange={setShowNewChargeModal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nova Cobrança
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Cobrança</DialogTitle>
                <DialogDescription>
                  Crie uma cobrança manual para teste
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="descricao">Descrição *</Label>
                  <Input
                    id="descricao"
                    placeholder="Ex: Mensalidade de Academia"
                    value={newChargeForm.descricao}
                    onChange={(e) => setNewChargeForm({ ...newChargeForm, descricao: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="valor">Valor (R$) *</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="150.00"
                    value={newChargeForm.valor}
                    onChange={(e) => setNewChargeForm({ ...newChargeForm, valor: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="vencimento">Vencimento *</Label>
                  <Input
                    id="vencimento"
                    type="date"
                    value={newChargeForm.vencimento}
                    onChange={(e) => setNewChargeForm({ ...newChargeForm, vencimento: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    placeholder="Informações adicionais..."
                    value={newChargeForm.observacoes}
                    onChange={(e) => setNewChargeForm({ ...newChargeForm, observacoes: e.target.value })}
                  />
                </div>
                <Button
                  onClick={handleCreateCharge}
                  disabled={creatingCharge}
                  className="w-full"
                >
                  {creatingCharge ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    'Criar Cobrança'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Receipt className="w-8 h-8 text-muted-foreground" />
        </div>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) => setFilters({ ...filters, status: value === 'all' ? 'all' : value as any, page: 1 })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Lista de Cobranças */}
          <div className="space-y-4">
            {cobrancas.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Receipt className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Nenhuma cobrança encontrada</p>
                </CardContent>
              </Card>
            ) : (
              cobrancas.map((cobranca) => (
                <Card key={cobranca.id_cobranca} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{cobranca.descricao}</CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{getTipoLabel(cobranca.referencia_tipo)}</span>
                          <span>•</span>
                          <span>Vencimento: {formatDate(cobranca.vencimento)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(cobranca.status)}
                        <p className="text-2xl font-bold mt-2">{formatCurrency(cobranca.valor_total)}</p>
                        {cobranca.valor_pago > 0 && cobranca.valor_pago < cobranca.valor_total && (
                          <p className="text-sm text-muted-foreground">
                            Pago: {formatCurrency(cobranca.valor_pago)}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  {cobranca.status === 'pendente' && (
                    <CardContent>
                      <div className="flex gap-2">
                        <Button onClick={() => handleViewCharge(cobranca)} className="flex-1">
                          Pagar no App
                        </Button>
                        <Button variant="secondary" onClick={() => handleGenerateLink(cobranca)}>
                          <LinkIcon className="w-4 h-4 mr-1" /> Link MP
                        </Button>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))
            )}
          </div>

          {/* Paginação */}
          {pagination.last_page > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                disabled={pagination.current_page === 1}
                onClick={() => setFilters({ ...filters, page: pagination.current_page - 1 })}
              >
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {pagination.current_page} de {pagination.last_page}
              </span>
              <Button
                variant="outline"
                disabled={pagination.current_page === pagination.last_page}
                onClick={() => setFilters({ ...filters, page: pagination.current_page + 1 })}
              >
                Próxima
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
