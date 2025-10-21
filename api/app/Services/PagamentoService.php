<?php

namespace App\Services;

use App\Models\Cobranca;
use App\Models\CobrancaParcela;
use App\Models\Pagamento;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class PagamentoService
{
    protected NotificacaoService $notificacaoService;

    public function __construct(NotificacaoService $notificacaoService)
    {
        $this->notificacaoService = $notificacaoService;
    }

    /**
     * Criar cobrança com 1 parcela
     * 
     * @param int $idUsuario
     * @param string $tipo 'assinatura', 'reserva_quadra', 'sessao_personal', 'inscricao_aula', 'manual'
     * @param int|null $idReferencia
     * @param float $valor
     * @param string $descricao
     * @param Carbon|null $vencimento
     * @return Cobranca
     */
    public function criarCobranca(
        int $idUsuario,
        string $tipo,
        ?int $idReferencia,
        float $valor,
        string $descricao,
        ?Carbon $vencimento = null
    ): Cobranca {
        if (!$vencimento) {
            $vencimento = now()->addDays(1); // Vence amanhã por padrão
        }

        return DB::transaction(function () use ($idUsuario, $tipo, $idReferencia, $valor, $descricao, $vencimento) {
            // 1. Criar cobrança
            $cobranca = Cobranca::create([
                'id_usuario' => $idUsuario,
                'referencia_tipo' => $tipo,
                'referencia_id' => $idReferencia,
                'valor_total' => $valor,
                'valor_pago' => 0,
                'moeda' => 'BRL',
                'status' => 'pendente',
                'descricao' => $descricao,
                'vencimento' => $vencimento,
            ]);

            // 2. Criar parcela única (1x por enquanto)
            $parcela = CobrancaParcela::create([
                'id_cobranca' => $cobranca->id_cobranca,
                'numero_parcela' => 1,
                'total_parcelas' => 1,
                'valor' => $valor,
                'valor_pago' => 0,
                'status' => 'pendente',
                'vencimento' => $vencimento,
            ]);

            // Carregar relacionamento
            $cobranca->load('parcelas');

            return $cobranca;
        });
    }

    /**
     * Criar pagamento SIMULADO (aprovação imediata)
     * 
     * @param CobrancaParcela $parcela
     * @return Pagamento
     */
    public function criarPagamentoSimulado(CobrancaParcela $parcela): Pagamento
    {
        return DB::transaction(function () use ($parcela) {
            // 1. Criar pagamento simulado
            $pagamento = Pagamento::create([
                'id_parcela' => $parcela->id_parcela,
                'provedor' => 'simulacao',
                'metodo' => 'pix',
                'valor' => $parcela->valor,
                'status' => 'pendente',
                'url_checkout' => route('checkout.simulacao', ['id' => $parcela->id_parcela]),
                'qr_code' => null,
                'payload_json' => [
                    'tipo' => 'simulacao',
                    'mensagem' => 'Pagamento simulado - aprovar manualmente',
                ],
            ]);

            return $pagamento;
        });
    }

    /**
     * Aprovar pagamento simulado e confirmar recursos
     * 
     * @param Pagamento $pagamento
     * @return void
     */
    public function aprovarPagamentoSimulado(Pagamento $pagamento): void
    {
        if ($pagamento->provedor !== 'simulacao') {
            throw new \Exception('Este método só funciona para pagamentos simulados');
        }

        DB::transaction(function () use ($pagamento) {
            // 1. Atualizar pagamento
            $pagamento->update([
                'status' => 'aprovado',
                'aprovado_em' => now(),
            ]);

            // 2. Atualizar parcela
            $parcela = $pagamento->parcela;
            $parcela->update([
                'status' => 'pago',
                'valor_pago' => $parcela->valor,
                'pago_em' => now(),
            ]);

            // 3. Atualizar cobrança
            $cobranca = $parcela->cobranca;
            $cobranca->update([
                'status' => 'pago',
                'valor_pago' => $cobranca->valor_total,
            ]);

            // 4. Confirmar o recurso (sessão, reserva, etc)
            $this->confirmarRecurso($cobranca);
        });
    }

    /**
     * Confirmar o recurso relacionado à cobrança
     * (muda status de 'pendente' para 'confirmada')
     * 
     * @param Cobranca $cobranca
     * @return void
     */
    private function confirmarRecurso(Cobranca $cobranca): void
    {
        switch ($cobranca->referencia_tipo) {
            case 'sessao_personal':
                $sessao = \App\Models\SessaoPersonal::find($cobranca->referencia_id);
                if ($sessao && $sessao->status === 'pendente') {
                    $sessao->update(['status' => 'confirmada']);
                    
                    // Notificar usuário
                    $this->notificacaoService->notificarPagamentoAprovado(
                        $cobranca->id_usuario,
                        $cobranca->descricao,
                        $cobranca->valor_total
                    );
                }
                break;

            case 'reserva_quadra':
                $reserva = \App\Models\ReservaQuadra::find($cobranca->referencia_id);
                if ($reserva && $reserva->status === 'pendente') {
                    $reserva->update(['status' => 'confirmada']);
                    
                    // Notificar usuário
                    $this->notificacaoService->notificarPagamentoAprovado(
                        $cobranca->id_usuario,
                        $cobranca->descricao,
                        $cobranca->valor_total
                    );
                }
                break;

            case 'inscricao_aula':
                $inscricao = \App\Models\InscricaoAula::find($cobranca->referencia_id);
                if ($inscricao && $inscricao->status === 'inscrito') {
                    // Já está inscrito, nada a fazer
                    
                    // Notificar usuário
                    $this->notificacaoService->notificarPagamentoAprovado(
                        $cobranca->id_usuario,
                        $cobranca->descricao,
                        $cobranca->valor_total
                    );
                }
                break;

            case 'assinatura':
                $assinatura = \App\Models\Assinatura::find($cobranca->referencia_id);
                if ($assinatura && $assinatura->status === 'pendente') {
                    $assinatura->update(['status' => 'ativa']);
                    
                    // Notificar usuário com mensagem específica
                    $plano = $assinatura->plano;
                    $this->notificacaoService->notificarAssinaturaAtivada(
                        $cobranca->id_usuario,
                        $plano->nome
                    );
                }
                break;
        }
    }

    /**
     * Cancelar pagamento pendente
     * 
     * @param Pagamento $pagamento
     * @return void
     */
    public function cancelarPagamento(Pagamento $pagamento): void
    {
        if (!$pagamento->podeSerCancelado()) {
            throw new \Exception('Este pagamento não pode ser cancelado');
        }

        DB::transaction(function () use ($pagamento) {
            $pagamento->update(['status' => 'cancelado']);

            // Se era o único pagamento pendente, cancelar parcela e cobrança
            $parcela = $pagamento->parcela;
            $pagamentosPendentes = $parcela->pagamentos()
                ->whereIn('status', ['pendente', 'processando'])
                ->where('id_pagamento', '!=', $pagamento->id_pagamento)
                ->exists();

            if (!$pagamentosPendentes) {
                $parcela->update(['status' => 'cancelado']);
                $parcela->cobranca->update(['status' => 'cancelado']);
            }
        });
    }
}
