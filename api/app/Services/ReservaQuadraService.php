<?php

namespace App\Services;

use App\Models\Quadra;
use App\Models\ReservaQuadra;
use App\Models\SessaoPersonal;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ReservaQuadraService
{
    protected PagamentoService $pagamentoService;
    protected NotificacaoService $notificacaoService;

    public function __construct(
        PagamentoService $pagamentoService,
        NotificacaoService $notificacaoService
    ) {
        $this->pagamentoService = $pagamentoService;
        $this->notificacaoService = $notificacaoService;
    }

    /**
     * Valida disponibilidade da quadra no período
     * 
     * Verifica:
     * 1. Quadra está ativa
     * 2. Não há sobreposição com outras reservas
     * 3. Não há sobreposição com sessões personal (que também usam quadras)
     * 
     * @throws \Exception
     */
    public function validarDisponibilidade(
        int $idQuadra,
        Carbon $inicio,
        Carbon $fim,
        ?int $idReservaIgnorar = null
    ): void {
        // 1. Verificar se quadra existe e está ativa
        $quadra = Quadra::find($idQuadra);
        if (!$quadra) {
            throw new \Exception('Quadra não encontrada');
        }

        if ($quadra->status !== 'ativa') {
            throw new \Exception('Quadra não está disponível');
        }

        // 2. Verificar sobreposição com outras reservas de quadra
        $conflitosReserva = ReservaQuadra::where('id_quadra', $idQuadra)
            ->whereIn('status', ['pendente', 'confirmada'])
            ->where(function ($query) use ($inicio, $fim) {
                $query->where(function ($q) use ($inicio, $fim) {
                    // Início da nova reserva está dentro de uma existente
                    $q->where('inicio', '<=', $inicio)
                      ->where('fim', '>', $inicio);
                })->orWhere(function ($q) use ($inicio, $fim) {
                    // Fim da nova reserva está dentro de uma existente
                    $q->where('inicio', '<', $fim)
                      ->where('fim', '>=', $fim);
                })->orWhere(function ($q) use ($inicio, $fim) {
                    // Nova reserva engloba uma existente
                    $q->where('inicio', '>=', $inicio)
                      ->where('fim', '<=', $fim);
                });
            });

        if ($idReservaIgnorar) {
            $conflitosReserva->where('id_reserva_quadra', '!=', $idReservaIgnorar);
        }

        if ($conflitosReserva->exists()) {
            $conflito = $conflitosReserva->first();
            throw new \Exception(
                "Quadra já reservada neste horário (Reserva #{$conflito->id_reserva_quadra})"
            );
        }

        // 3. Verificar sobreposição com sessões personal
        $conflitosSessao = SessaoPersonal::where('id_quadra', $idQuadra)
            ->whereIn('status', ['pendente', 'confirmada'])
            ->where(function ($query) use ($inicio, $fim) {
                $query->where(function ($q) use ($inicio, $fim) {
                    $q->where('inicio', '<=', $inicio)
                      ->where('fim', '>', $inicio);
                })->orWhere(function ($q) use ($inicio, $fim) {
                    $q->where('inicio', '<', $fim)
                      ->where('fim', '>=', $fim);
                })->orWhere(function ($q) use ($inicio, $fim) {
                    $q->where('inicio', '>=', $inicio)
                      ->where('fim', '<=', $fim);
                });
            });

        if ($conflitosSessao->exists()) {
            $conflito = $conflitosSessao->first();
            throw new \Exception(
                "Quadra já está reservada para sessão personal neste horário (Sessão #{$conflito->id_sessao_personal})"
            );
        }
    }

    /**
     * Calcula o preço da reserva com base na duração e preço/hora da quadra
     */
    public function calcularPreco(int $idQuadra, Carbon $inicio, Carbon $fim): float
    {
        $quadra = Quadra::findOrFail($idQuadra);
        $duracaoHoras = $inicio->floatDiffInHours($fim);
        
        return round($quadra->preco_hora * $duracaoHoras, 2);
    }

    /**
     * Cria uma nova reserva com validações
     */
    public function criarReserva(array $dados): ReservaQuadra
    {
        $inicio = Carbon::parse($dados['inicio']);
        $fim = Carbon::parse($dados['fim']);

        // Validar disponibilidade
        $this->validarDisponibilidade(
            $dados['id_quadra'],
            $inicio,
            $fim
        );

        // Calcular preço
        $precoTotal = $this->calcularPreco($dados['id_quadra'], $inicio, $fim);

        // Criar reserva dentro de transação
        return DB::transaction(function () use ($dados, $inicio, $fim, $precoTotal) {
            // 1. Criar reserva com status 'pendente' (aguardando pagamento)
            $reserva = ReservaQuadra::create([
                'id_quadra' => $dados['id_quadra'],
                'id_usuario' => $dados['id_usuario'],
                'inicio' => $inicio,
                'fim' => $fim,
                'preco_total' => $precoTotal,
                'status' => 'pendente',
                'observacoes' => $dados['observacoes'] ?? null,
            ]);

            // 2. Criar cobrança
            $quadra = Quadra::find($dados['id_quadra']);
            $descricao = "Reserva da quadra {$quadra->nome} em {$inicio->format('d/m/Y H:i')}";
            
            $cobranca = $this->pagamentoService->criarCobranca(
                $dados['id_usuario'],
                'reserva_quadra',
                $reserva->id_reserva_quadra,
                $precoTotal,
                $descricao,
                Carbon::parse($dados['inicio'])->subDay() // Vencimento 1 dia antes da reserva
            );

            // 3. Criar notificação
            $parcela = $cobranca->parcelas->first();
            $this->notificacaoService->notificarNovaCobranca(
                $dados['id_usuario'],
                $descricao,
                $precoTotal,
                "/aluno/checkout/{$parcela->id_parcela}"
            );

            // Carregar relacionamento para retorno
            $reserva->cobranca = $cobranca->load('parcelas');

            return $reserva;
        });
    }

    /**
     * Atualiza uma reserva existente com validações
     */
    public function atualizarReserva(ReservaQuadra $reserva, array $dados): ReservaQuadra
    {
        // Se estiver mudando horário ou quadra, validar novamente
        if (
            (isset($dados['inicio']) || isset($dados['fim']) || isset($dados['id_quadra']))
            && $reserva->status !== 'cancelada'
        ) {
            $inicio = isset($dados['inicio']) 
                ? Carbon::parse($dados['inicio']) 
                : $reserva->inicio;
            
            $fim = isset($dados['fim']) 
                ? Carbon::parse($dados['fim']) 
                : $reserva->fim;
            
            $idQuadra = $dados['id_quadra'] ?? $reserva->id_quadra;

            $this->validarDisponibilidade(
                $idQuadra,
                $inicio,
                $fim,
                $reserva->id_reserva_quadra
            );

            // Recalcular preço se mudou horário
            if (isset($dados['inicio']) || isset($dados['fim']) || isset($dados['id_quadra'])) {
                $dados['preco_total'] = $this->calcularPreco($idQuadra, $inicio, $fim);
            }
        }

        $reserva->update($dados);
        return $reserva->fresh();
    }

    /**
     * Verifica disponibilidade sem criar reserva
     */
    public function verificarDisponibilidade(
        int $idQuadra,
        string $inicio,
        string $fim
    ): array {
        try {
            $this->validarDisponibilidade(
                $idQuadra,
                Carbon::parse($inicio),
                Carbon::parse($fim)
            );

            $preco = $this->calcularPreco(
                $idQuadra,
                Carbon::parse($inicio),
                Carbon::parse($fim)
            );

            return [
                'disponivel' => true,
                'preco_total' => $preco,
            ];
        } catch (\Exception $e) {
            return [
                'disponivel' => false,
                'motivo' => $e->getMessage(),
            ];
        }
    }
}
