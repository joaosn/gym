<?php

namespace App\Services;

use App\Models\SessaoPersonal;
use App\Models\Instrutor;
use App\Models\DisponibilidadeInstrutor;
use App\Models\ReservaQuadra;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class SessaoPersonalService
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
     * Validar se o instrutor está disponível no horário solicitado
     * E se a quadra (se informada) está disponível
     */
    public function validarDisponibilidade(int $idInstrutor, Carbon $inicio, Carbon $fim, ?int $idQuadra = null, ?int $idUsuario = null, ?int $idSessaoAtual = null): array
    {
        // 1. Verificar se há conflito com outras sessões do instrutor (anti-overlap)
        $conflito = $this->verificarConflitoInstrutor($idInstrutor, $inicio, $fim, $idSessaoAtual);
        if ($conflito) {
            return [
                'disponivel' => false,
                'motivo' => 'O instrutor já possui outra sessão agendada neste horário'
            ];
        }

        // 2. Verificar se está dentro da disponibilidade semanal do instrutor
        $dentroDisponibilidade = $this->verificarDisponibilidadeSemanal($idInstrutor, $inicio, $fim);
        if (!$dentroDisponibilidade) {
            return [
                'disponivel' => false,
                'motivo' => 'O horário solicitado está fora da disponibilidade do instrutor'
            ];
        }

        // 3. Verificar se a quadra (se informada) está disponível
        if ($idQuadra) {
            $conflitoQuadra = $this->verificarConflitoQuadra($idQuadra, $inicio, $fim, $idSessaoAtual);
            if ($conflitoQuadra) {
                return [
                    'disponivel' => false,
                    'motivo' => 'A quadra já está reservada neste horário'
                ];
            }
        }

        // 4. Verificar se o aluno (se informado) já tem outra sessão no mesmo horário
        if ($idUsuario) {
            $conflitoAluno = $this->verificarConflitoAluno($idUsuario, $inicio, $fim, $idSessaoAtual);
            if ($conflitoAluno) {
                return [
                    'disponivel' => false,
                    'motivo' => 'O aluno já possui outra sessão agendada neste horário'
                ];
            }
        }

        return [
            'disponivel' => true,
            'motivo' => null
        ];
    }

    /**
     * Verificar conflito com outras sessões do instrutor (anti-overlap)
     */
    private function verificarConflitoInstrutor(int $idInstrutor, Carbon $inicio, Carbon $fim, ?int $idSessaoAtual = null): bool
    {
        $query = SessaoPersonal::where('id_instrutor', $idInstrutor)
            ->whereIn('status', ['pendente', 'confirmada']) // Apenas sessões ativas
            ->where(function($q) use ($inicio, $fim) {
                $q->whereBetween('inicio', [$inicio, $fim])
                  ->orWhereBetween('fim', [$inicio, $fim])
                  ->orWhere(function($subq) use ($inicio, $fim) {
                      $subq->where('inicio', '<=', $inicio)
                           ->where('fim', '>=', $fim);
                  });
            });

        if ($idSessaoAtual) {
            $query->where('id_sessao_personal', '!=', $idSessaoAtual);
        }

        return $query->exists();
    }

    /**
     * Verificar conflito com reservas de quadra (anti-overlap)
     */
    private function verificarConflitoQuadra(int $idQuadra, Carbon $inicio, Carbon $fim, ?int $idSessaoAtual = null): bool
    {
        // 1. Verificar conflito com RESERVAS DE QUADRA
        $conflitosReservas = ReservaQuadra::where('id_quadra', $idQuadra)
            ->whereIn('status', ['pendente', 'confirmada']) // Apenas reservas ativas
            ->where(function($q) use ($inicio, $fim) {
                $q->whereBetween('inicio', [$inicio, $fim])
                  ->orWhereBetween('fim', [$inicio, $fim])
                  ->orWhere(function($subq) use ($inicio, $fim) {
                      $subq->where('inicio', '<=', $inicio)
                           ->where('fim', '>=', $fim);
                  });
            })
            ->exists();

        if ($conflitosReservas) {
            return true;
        }

        // 2. Verificar conflito com OUTRAS SESSÕES PERSONAL que usam a mesma quadra
        $conflitosSessoes = SessaoPersonal::where('id_quadra', $idQuadra)
            ->whereIn('status', ['pendente', 'confirmada'])
            ->where(function($q) use ($inicio, $fim) {
                $q->whereBetween('inicio', [$inicio, $fim])
                  ->orWhereBetween('fim', [$inicio, $fim])
                  ->orWhere(function($subq) use ($inicio, $fim) {
                      $subq->where('inicio', '<=', $inicio)
                           ->where('fim', '>=', $fim);
                  });
            });

        if ($idSessaoAtual) {
            $conflitosSessoes->where('id_sessao_personal', '!=', $idSessaoAtual);
        }

        return $conflitosSessoes->exists();
    }

    /**
     * Verificar conflito de horário do aluno (não pode ter 2 sessões simultâneas)
     */
    private function verificarConflitoAluno(int $idUsuario, Carbon $inicio, Carbon $fim, ?int $idSessaoAtual = null): bool
    {
        $query = SessaoPersonal::where('id_usuario', $idUsuario)
            ->whereIn('status', ['pendente', 'confirmada'])
            ->where(function($q) use ($inicio, $fim) {
                $q->whereBetween('inicio', [$inicio, $fim])
                  ->orWhereBetween('fim', [$inicio, $fim])
                  ->orWhere(function($subq) use ($inicio, $fim) {
                      $subq->where('inicio', '<=', $inicio)
                           ->where('fim', '>=', $fim);
                  });
            });

        if ($idSessaoAtual) {
            $query->where('id_sessao_personal', '!=', $idSessaoAtual);
        }

        return $query->exists();
    }

    /**
     * Verificar se está dentro da disponibilidade semanal
     */
    private function verificarDisponibilidadeSemanal(int $idInstrutor, Carbon $inicio, Carbon $fim): bool
    {
        // Mapear dia da semana do Carbon (0=Sunday, 1=Monday, ..., 6=Saturday)
        // para nosso padrão ISO 8601 (1=Segunda, 2=Terça, ..., 7=Domingo)
        $diaSemanaCarbon = $inicio->dayOfWeek; // 0=Sunday, 1=Monday, ..., 6=Saturday
        $diaSemana = $diaSemanaCarbon === 0 ? 7 : $diaSemanaCarbon; // 1=Segunda, 7=Domingo

        // Buscar disponibilidade do instrutor neste dia
        $disponibilidades = DisponibilidadeInstrutor::where('id_instrutor', $idInstrutor)
            ->where('dia_semana', $diaSemana)
            ->get();

        if ($disponibilidades->isEmpty()) {
            return false; // Instrutor não trabalha neste dia
        }

        $horaInicio = $inicio->format('H:i:s');
        $horaFim = $fim->format('H:i:s');

        // Verificar se a sessão está dentro de algum intervalo de disponibilidade
        foreach ($disponibilidades as $disponibilidade) {
            if ($horaInicio >= $disponibilidade->hora_inicio && 
                $horaFim <= $disponibilidade->hora_fim) {
                return true;
            }
        }

        return false;
    }

    /**
     * Calcular preço total da sessão
     */
    public function calcularPreco(int $idInstrutor, Carbon $inicio, Carbon $fim): float
    {
        $instrutor = Instrutor::findOrFail($idInstrutor);
        
        // Calcular duração em horas (arredondado para cima em blocos de 30min)
        $duracaoMinutos = $inicio->diffInMinutes($fim);
        $duracaoHoras = ceil($duracaoMinutos / 30) * 0.5; // Blocos de 30min
        
        return round($instrutor->valor_hora * $duracaoHoras, 2);
    }

    /**
     * Criar nova sessão personal
     * Se tiver quadra, cria automaticamente uma reserva de quadra vinculada
     */
    public function criarSessao(array $dados): SessaoPersonal
    {
        $inicio = Carbon::parse($dados['inicio']);
        $fim = Carbon::parse($dados['fim']);
        $idQuadra = $dados['id_quadra'] ?? null;
        $idUsuario = $dados['id_usuario'];

        // Validar disponibilidade (instrutor + quadra + aluno)
        $validacao = $this->validarDisponibilidade(
            $dados['id_instrutor'], 
            $inicio, 
            $fim, 
            $idQuadra,
            $idUsuario
        );
        
        if (!$validacao['disponivel']) {
            throw new \Exception($validacao['motivo']);
        }

        // Calcular preço
        $preco = $this->calcularPreco($dados['id_instrutor'], $inicio, $fim);

        // Criar sessão dentro de uma transação (para garantir atomicidade)
        return DB::transaction(function () use ($dados, $inicio, $fim, $preco, $idQuadra, $idUsuario) {
            // 1. Criar sessão com status 'pendente' (aguardando pagamento)
            $sessao = SessaoPersonal::create([
                'id_instrutor' => $dados['id_instrutor'],
                'id_usuario' => $idUsuario,
                'id_quadra' => $idQuadra,
                'inicio' => $inicio,
                'fim' => $fim,
                'preco_total' => $preco,
                'status' => 'pendente',
                'observacoes' => $dados['observacoes'] ?? null,
            ]);

            // 2. Criar cobrança
            $instrutor = Instrutor::with('usuario')->find($dados['id_instrutor']);
            $descricao = "Sessão Personal com {$instrutor->nome} em {$inicio->format('d/m/Y H:i')}";
            
            $cobranca = $this->pagamentoService->criarCobranca(
                $idUsuario,
                'sessao_personal',
                $sessao->id_sessao_personal,
                $preco,
                $descricao,
                Carbon::parse($dados['inicio'])->subDay() // Vencimento 1 dia antes da sessão
            );

            // 3. Criar notificação
            $parcela = $cobranca->parcelas->first();
            $this->notificacaoService->notificarNovaCobranca(
                $idUsuario,
                $descricao,
                $preco,
                "/aluno/checkout/{$parcela->id_parcela}"
            );

            // 4. Se tem quadra, criar reserva automática
            if ($idQuadra) {
                $this->criarReservaAutomatica($sessao);
            }

            // Carregar relacionamentos para retorno
            $sessao->cobranca = $cobranca->load('parcelas');

            return $sessao;
        });
    }

    /**
     * Atualizar sessão existente
     * Se alterar quadra, atualiza/cria/deleta reserva automaticamente
     */
    public function atualizarSessao(SessaoPersonal $sessao, array $dados): SessaoPersonal
    {
        // Se alterar horário OU quadra OU aluno, validar disponibilidade
        $precisaValidar = isset($dados['inicio']) || isset($dados['fim']) || isset($dados['id_quadra']) || isset($dados['id_usuario']);

        if ($precisaValidar) {
            $inicio = isset($dados['inicio']) ? Carbon::parse($dados['inicio']) : $sessao->inicio;
            $fim = isset($dados['fim']) ? Carbon::parse($dados['fim']) : $sessao->fim;
            $idQuadra = isset($dados['id_quadra']) ? $dados['id_quadra'] : $sessao->id_quadra;
            $idUsuario = isset($dados['id_usuario']) ? $dados['id_usuario'] : $sessao->id_usuario;

            $validacao = $this->validarDisponibilidade(
                $sessao->id_instrutor, 
                $inicio, 
                $fim,
                $idQuadra,
                $idUsuario,
                $sessao->id_sessao_personal
            );

            if (!$validacao['disponivel']) {
                throw new \Exception($validacao['motivo']);
            }

            // Recalcular preço se horário mudou
            if (isset($dados['inicio']) || isset($dados['fim'])) {
                $dados['preco_total'] = $this->calcularPreco($sessao->id_instrutor, $inicio, $fim);
            }
        }

        return DB::transaction(function () use ($sessao, $dados) {
            $idQuadraAntiga = $sessao->id_quadra;
            $idQuadraNova = $dados['id_quadra'] ?? $idQuadraAntiga;

            // 1. Atualizar sessão
            $sessao->update($dados);
            $sessao = $sessao->fresh();

            // 2. Gerenciar reserva de quadra automaticamente
            // Caso 1: Tinha quadra, removeu quadra → deletar reserva
            if ($idQuadraAntiga && !$idQuadraNova) {
                $this->deletarReservaAutomatica($sessao);
            }
            // Caso 2: Não tinha quadra, adicionou quadra → criar reserva
            elseif (!$idQuadraAntiga && $idQuadraNova) {
                $this->criarReservaAutomatica($sessao);
            }
            // Caso 3: Mudou quadra OU horário → atualizar reserva
            elseif ($idQuadraAntiga && $idQuadraNova) {
                $this->atualizarReservaAutomatica($sessao);
            }

            return $sessao;
        });
    }

    /**
     * Criar reserva de quadra automaticamente vinculada à sessão
     */
    private function criarReservaAutomatica(SessaoPersonal $sessao): void
    {
        if (!$sessao->id_quadra) {
            return; // Não tem quadra, não cria reserva
        }

        ReservaQuadra::create([
            'id_quadra' => $sessao->id_quadra,
            'id_usuario' => $sessao->id_usuario,
            'id_sessao_personal' => $sessao->id_sessao_personal,
            'inicio' => $sessao->inicio,
            'fim' => $sessao->fim,
            'preco_total' => 0, // Preço é da sessão, não da reserva
            'origem' => 'admin', // Origem: criada automaticamente pelo sistema
            'status' => $sessao->status, // Mesma status da sessão
            'observacoes' => "Reserva automática para sessão personal #{$sessao->id_sessao_personal}",
        ]);
    }

    /**
     * Atualizar reserva de quadra existente
     */
    private function atualizarReservaAutomatica(SessaoPersonal $sessao): void
    {
        $reserva = ReservaQuadra::where('id_sessao_personal', $sessao->id_sessao_personal)->first();

        if ($reserva && $sessao->id_quadra) {
            // Atualizar apenas se sessão ainda tem quadra
            $reserva->update([
                'id_quadra' => $sessao->id_quadra,
                'inicio' => $sessao->inicio,
                'fim' => $sessao->fim,
                'status' => $sessao->status,
            ]);
        } elseif (!$sessao->id_quadra && $reserva) {
            // Se não tem mais quadra, deletar reserva
            $reserva->delete();
        } elseif ($sessao->id_quadra && !$reserva) {
            // Se não existe reserva mas deveria existir, criar
            $this->criarReservaAutomatica($sessao);
        }
    }

    /**
     * Deletar reserva de quadra automática
     */
    private function deletarReservaAutomatica(SessaoPersonal $sessao): void
    {
        ReservaQuadra::where('id_sessao_personal', $sessao->id_sessao_personal)->delete();
    }

    /**
     * ✨ NOVO: Obter todos os horários disponíveis de um instrutor em um dia
     * 
     * Retorna lista de horários (6am-11pm) com status:
     * - disponivel: true/false
     * - preco: valor da hora
     * 
     * Muito mais eficiente que fazer 18 requisições!
     */
    public function obterHorariosDisponiveisNoDia(int $idInstrutor, string $dateStr): array
    {
        $instrutor = Instrutor::findOrFail($idInstrutor);
        $data = Carbon::createFromFormat('Y-m-d', $dateStr)->startOfDay();
        
        $slots = [];
        
        // Verificar cada hora do dia (6am-11pm = 18 horários)
        for ($hour = 6; $hour <= 23; $hour++) {
            $inicio = $data->clone()->setHour($hour)->setMinute(0)->setSecond(0);
            $fim = $inicio->clone()->addHour();
            
            // Validar disponibilidade (sem lançar exceção)
            $validacao = $this->validarDisponibilidade(
                $idInstrutor,
                $inicio,
                $fim,
                null, // sem quadra
                null  // sem usuário (apenas verificando instrutor)
            );
            
            $timeStr = $inicio->format('H:00');
            
            $slots[] = [
                'time' => $timeStr,
                'available' => $validacao['disponivel'],
                'price' => $instrutor->valor_hora,
                'motivo' => $validacao['motivo'] ?? null,
            ];
        }
        
        return $slots;
    }

    /**
     * Cancelar sessão + cobrança automaticamente
     * 
     * - Marca sessão como cancelada
     * - Cancela reserva de quadra vinculada (se existe)
     * - Cancela cobrança pendente (se ainda não foi paga)
     */
    public function cancelarSessaoComCobranca(SessaoPersonal $sessao): void
    {
        DB::transaction(function () use ($sessao) {
            // 1. Cancelar sessão
            $sessao->update(['status' => 'cancelada']);

            // 2. Cancelar reserva de quadra vinculada
            if ($sessao->reservaQuadra) {
                $sessao->reservaQuadra->update(['status' => 'cancelada']);
            }

            // 3. Cancelar cobrança pendente
            $cobranca = \App\Models\Cobranca::where('referencia_tipo', 'sessao_personal')
                ->where('referencia_id', $sessao->id_sessao_personal)
                ->first();

            if ($cobranca && $cobranca->status !== 'pago') {
                // Cancelar todas as parcelas pendentes
                $parcelasPendentes = $cobranca->parcelas()
                    ->whereIn('status', ['pendente', 'aguardando'])
                    ->get();

                foreach ($parcelasPendentes as $parcela) {
                    // Cancelar pagamentos vinculados à parcela
                    $pagamentos = \App\Models\Pagamento::where('id_parcela', $parcela->id_parcela)
                        ->whereIn('status', ['pendente', 'aguardando'])
                        ->get();

                    foreach ($pagamentos as $pagamento) {
                        try {
                            $this->pagamentoService->cancelarPagamento($pagamento);
                        } catch (\Exception $e) {
                            // Log do erro mas continua
                            \Log::warning("Erro ao cancelar pagamento {$pagamento->id_pagamento}: {$e->getMessage()}");
                        }
                    }

                    // Marcar parcela como cancelada
                    $parcela->update(['status' => 'cancelado']);
                }

                // Marcar cobrança como cancelada
                $cobranca->update(['status' => 'cancelado']);
            }

            // 4. Enviar notificação simples (sem usar método inexistente)
            // Apenas log para agora
            \Log::info("Sessão {$sessao->id_sessao_personal} cancelada pelo usuário {$sessao->id_usuario}");
        });
    }
}
