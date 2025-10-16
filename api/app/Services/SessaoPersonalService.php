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
        // Mapear dia da semana do Carbon (0=Sunday) para nosso padrão (0=Segunda)
        $diaSemanaCarbon = $inicio->dayOfWeek; // 0=Sunday, 1=Monday, ..., 6=Saturday
        $diaSemana = $diaSemanaCarbon === 0 ? 6 : $diaSemanaCarbon - 1; // 0=Segunda, 6=Domingo

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

        // Criar sessão
        return SessaoPersonal::create([
            'id_instrutor' => $dados['id_instrutor'],
            'id_usuario' => $idUsuario,
            'id_quadra' => $idQuadra,
            'inicio' => $inicio,
            'fim' => $fim,
            'preco_total' => $preco,
            'status' => 'pendente',
            'observacoes' => $dados['observacoes'] ?? null,
        ]);
    }

    /**
     * Atualizar sessão existente
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

        $sessao->update($dados);
        return $sessao->fresh();
    }
}
