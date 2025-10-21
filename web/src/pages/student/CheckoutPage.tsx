import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { paymentsService } from '@/services/payments.service';
import type { CobrancaParcela, Pagamento } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Loader2, CreditCard, CheckCircle, ArrowLeft, QrCode } from 'lucide-react';

export default function CheckoutPage() {
  const { idParcela } = useParams<{ idParcela: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [parcela, setParcela] = useState<CobrancaParcela | null>(null);
  const [pagamento, setPagamento] = useState<Pagamento | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'aluno') {
      navigate('/');
      return;
    }
    if (!idParcela) {
      navigate('/aluno/pagamentos');
      return;
    }
    loadCheckout();
  }, [idParcela, user]);

  const loadCheckout = async () => {
    if (!idParcela) return;
    
    setLoading(true);
    try {
      const parcelaData = await paymentsService.getParcela(idParcela);
      setParcela(parcelaData);
      
      // Se já tiver pagamento pendente, carregar
      if (parcelaData.pagamentos && parcelaData.pagamentos.length > 0) {
        const pagamentoPendente = parcelaData.pagamentos.find(p => p.status === 'pendente');
        if (pagamentoPendente) {
          setPagamento(pagamentoPendente);
        }
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar checkout',
        description: error.message,
        variant: 'destructive',
      });
      navigate('/aluno/pagamentos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePayment = async () => {
    if (!idParcela) return;

    setCreating(true);
    try {
      // Preferência Mercado Pago
      try {
        const mp = await paymentsService.createCheckoutMercadoPago(idParcela);
        if (mp.url_checkout) {
          // Abre link do Mercado Pago
          window.location.href = mp.url_checkout;
          return;
        }
      } catch (e) {
        // fallback simulação se MP indisponível
      }

      // Fallback: simulação
      const response = await paymentsService.createCheckout(idParcela, { provedor: 'simulacao' });
      setPagamento(response.pagamento);
      toast({ title: 'Pagamento (simulação) criado', description: 'Clique em Aprovar para confirmar.' });
    } catch (error: any) {
      toast({
        title: 'Erro ao criar pagamento',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const handleApprovePayment = async () => {
    if (!pagamento) return;

    setApproving(true);
    try {
      await paymentsService.approveSimulation(pagamento.id_pagamento);
      toast({
        title: 'Pagamento aprovado!',
        description: 'Seu agendamento foi confirmado com sucesso',
      });
      // Recarregar dados para mostrar status atualizado
      await loadCheckout();
      // Aguardar 2s e redirecionar
      setTimeout(() => {
        navigate('/aluno/pagamentos');
      }, 2000);
    } catch (error: any) {
      toast({
        title: 'Erro ao aprovar pagamento',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setApproving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Button
        variant="ghost"
        onClick={() => navigate('/aluno/pagamentos')}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </Button>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-6 h-6" />
            Pagamento
          </CardTitle>
          <CardDescription>
            {parcela ? `Parcela ${parcela.numero_parcela}/${parcela.total_parcelas}` : 'Carregando...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {parcela && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Valor:</span>
                <span className="text-2xl font-bold">{formatCurrency(parcela.valor)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Vencimento:</span>
                <span>{formatDate(parcela.vencimento)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant={parcela.status === 'pago' ? 'default' : 'outline'}>
                  {parcela.status.charAt(0).toUpperCase() + parcela.status.slice(1)}
                </Badge>
              </div>
              {parcela.cobranca && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-1">Descrição:</p>
                  <p className="font-medium">{parcela.cobranca.descricao}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {!pagamento ? (
        <Card>
          <CardHeader>
            <CardTitle>Criar Pagamento</CardTitle>
            <CardDescription>
              Clique no botão abaixo para gerar um pagamento simulado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleCreatePayment}
              disabled={creating}
              className="w-full"
              size="lg"
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <QrCode className="w-4 h-4 mr-2" />
                  Criar Pagamento (Simulação)
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-6 h-6" />
              Pagamento Gerado
            </CardTitle>
            <CardDescription>
              Provedor: {pagamento.provedor} | Status: {pagamento.status}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-2">
                🧪 Modo Simulação
              </p>
              <p className="text-xs text-muted-foreground">
                Este é um pagamento de teste. Clique em "Aprovar" para confirmar.
              </p>
            </div>

            <Button
              onClick={handleApprovePayment}
              disabled={approving}
              className="w-full"
              size="lg"
            >
              {approving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Aprovando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Aprovar Pagamento (Simulação)
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
