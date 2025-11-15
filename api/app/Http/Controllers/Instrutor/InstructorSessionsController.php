<?php

namespace App\Http\Controllers\Instrutor;

use App\Http\Controllers\Controller;
use App\Models\SessaoPersonal;
use Illuminate\Http\Request;
use Carbon\Carbon;

class InstructorSessionsController extends Controller
{
    /**
     * Listar sessões do instrutor autenticado
     * GET /instructor/my-sessions
     */
    public function mySessions(Request $request)
    {
        $user = auth()->user();
        
        \Log::info('🔍 DEBUG mySessions', [
            'user_id' => $user->id_usuario,
            'user_email' => $user->email,
        ]);

        // Buscar instrutor relacionado ao usuário
        $instructor = \App\Models\Instrutor::where('id_usuario', $user->id_usuario)
            ->where('status', '!=', 'excluido')
            ->first();
            
        \Log::info('🔍 Instrutor encontrado', [
            'instructor' => $instructor ? $instructor->toArray() : 'NULL',
        ]);

        if (!$instructor) {
            return response()->json([
                'message' => 'Instrutor não encontrado',
                'user_id' => $user->id_usuario
            ], 404);
        }

        // Buscar todas as sessões do instrutor, ordenadas por data
        $sessoes = SessaoPersonal::where('id_instrutor', $instructor->id_instrutor)
            ->where('status', '!=', 'excluido') // Soft delete
            ->with([
                'usuario' => function ($query) {
                    $query->select('id_usuario', 'nome', 'email');
                }
            ])
            ->orderBy('inicio', 'asc')
            ->get();
            
        \Log::info('🔍 Sessões encontradas', [
            'count' => $sessoes->count(),
            'instructor_id' => $instructor->id_instrutor,
        ]);

        $resultado = $sessoes->map(function ($sessao) {
            return [
                'id_sessao_personal' => $sessao->id_sessao_personal,
                'id_instrutor' => $sessao->id_instrutor,
                'id_usuario' => $sessao->id_usuario,
                'aluno_nome' => $sessao->usuario->nome ?? 'Desconhecido',
                'aluno_email' => $sessao->usuario->email ?? '',
                'inicio' => $sessao->inicio,
                'fim' => $sessao->fim,
                'preco_total' => $sessao->preco_total,
                'status' => $sessao->status,
            ];
        })->toArray();

        return response()->json($resultado);
    }

    /**
     * Cancelar uma sessão
     * PATCH /instructor/sessions/{id}/cancel
     */
    public function cancelarSessao(Request $request, $idSessao)
    {
        $user = auth()->user();

        // Buscar instrutor
        $instructor = \App\Models\Instrutor::where('id_usuario', $user->id_usuario)
            ->where('status', '!=', 'excluido')
            ->firstOrFail();

        // Buscar sessão e validar propriedade
        $sessao = SessaoPersonal::where('id_sessao_personal', $idSessao)
            ->where('id_instrutor', $instructor->id_instrutor)
            ->where('status', '!=', 'excluido')
            ->firstOrFail();

        // Validar que a sessão não foi concluída
        if ($sessao->status === 'concluida') {
            return response()->json([
                'message' => 'Não é possível cancelar uma sessão já concluída',
                'code' => 'SESSION_ALREADY_COMPLETED'
            ], 422);
        }

        // Marcar como cancelada
        $sessao->update(['status' => 'cancelada']);

        // TODO: Enviar notificação/email ao aluno sobre o cancelamento
        // $this->notifyStudentCancellation($sessao);

        return response()->json([
            'message' => 'Sessão cancelada com sucesso',
            'data' => $sessao
        ]);
    }

    /**
     * Concluir uma sessão (marcar como realizada)
     * PATCH /instructor/sessions/{id}/complete
     */
    public function concluirSessao(Request $request, $idSessao)
    {
        $user = auth()->user();

        // Buscar instrutor
        $instructor = \App\Models\Instrutor::where('id_usuario', $user->id_usuario)
            ->where('status', '!=', 'excluido')
            ->firstOrFail();

        // Buscar sessão e validar propriedade
        $sessao = SessaoPersonal::where('id_sessao_personal', $idSessao)
            ->where('id_instrutor', $instructor->id_instrutor)
            ->where('status', '!=', 'excluido')
            ->firstOrFail();

        // Validar que a sessão está confirmada
        if ($sessao->status !== 'confirmada') {
            return response()->json([
                'message' => 'Apenas sessões confirmadas podem ser concluídas',
                'code' => 'INVALID_SESSION_STATUS',
                'current_status' => $sessao->status
            ], 422);
        }

        // Marcar como concluída
        $sessao->update(['status' => 'concluida']);

        // TODO: Registrar conclusão da sessão para cálculo de horas
        // TODO: Atualizar estatísticas do instrutor

        return response()->json([
            'message' => 'Sessão concluída com sucesso',
            'data' => $sessao
        ]);
    }

    /**
     * Listar alunos ativos para seleção ao criar sessão
     * GET /instructor/students
     * 
     * Retorna lista de usuários com papel 'aluno' que estão ativos
     * para o instrutor criar uma nova sessão
     */
    public function getStudents(Request $request)
    {
        try {
            // Buscar todos os alunos ativos (não deletados)
            $alunos = \App\Models\Usuario::where('papel', 'aluno')
                ->where('status', '!=', 'excluido')
                ->select('id_usuario', 'nome', 'email', 'telefone')
                ->orderBy('nome', 'asc')
                ->get();

            // Formatar resposta
            $formattedAlunos = $alunos->map(function ($aluno) {
                return [
                    'id_usuario' => $aluno->id_usuario,
                    'nome' => $aluno->nome,
                    'email' => $aluno->email,
                    'telefone' => $aluno->telefone,
                ];
            });

            return response()->json($formattedAlunos);
        } catch (\Exception $e) {
            \Log::error('❌ Erro ao buscar alunos:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            return response()->json([
                'message' => 'Erro ao buscar alunos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Buscar horários disponíveis do instrutor para um dia específico
     * POST /instructor/availability-slots
     * Body: { data: "YYYY-MM-DD" }
     */
    public function availabilitySlots(Request $request)
    {
        try {
            $request->validate([
                'data' => 'required|date_format:Y-m-d',
            ]);

            $user = auth()->user();
            
            // Buscar instrutor
            $instructor = \App\Models\Instrutor::where('id_usuario', $user->id_usuario)
                ->where('status', '!=', 'excluido')
                ->first();

            if (!$instructor) {
                return response()->json([
                    'disponivel' => false,
                    'motivo' => 'Instrutor não encontrado',
                    'slots' => [],
                ]);
            }

            $data = $request->data;
            $diaSemana = \Carbon\Carbon::createFromFormat('Y-m-d', $data)->dayOfWeekIso; // 1=seg, 7=dom

            // Buscar disponibilidades do instrutor para este dia da semana
            $disponibilidades = \App\Models\DisponibilidadeInstrutor::where('id_instrutor', $instructor->id_instrutor)
                ->where('dia_semana', $diaSemana)
                ->get();

            if ($disponibilidades->isEmpty()) {
                return response()->json([
                    'disponivel' => false,
                    'motivo' => 'Você não tem disponibilidade neste dia da semana',
                    'slots' => [],
                ]);
            }

            // Gerar slots de 1 hora para cada disponibilidade
            $slots = [];
            $sessoes = \App\Models\SessaoPersonal::where('id_instrutor', $instructor->id_instrutor)
                ->where('status', '!=', 'excluido')
                ->whereBetween('inicio', [
                    \Carbon\Carbon::createFromFormat('Y-m-d', $data)->startOfDay(),
                    \Carbon\Carbon::createFromFormat('Y-m-d', $data)->endOfDay(),
                ])
                ->get();

            foreach ($disponibilidades as $disp) {
                try {
                    // Fazer parse com H:i:s pois o banco armazena com segundos
                    $horaInicio = \Carbon\Carbon::createFromFormat('H:i:s', trim($disp->hora_inicio));
                    $horaFim = \Carbon\Carbon::createFromFormat('H:i:s', trim($disp->hora_fim));

                    // Gerar slots de 1 hora
                    $current = $horaInicio->clone();
                    while ($current->copy()->addHours(1) <= $horaFim) {
                        $slotInicio = \Carbon\Carbon::createFromFormat('Y-m-d H:i:s', "$data {$current->format('H:i')}:00");
                        $slotFim = $slotInicio->clone()->addHours(1);

                        // Verificar se há conflito com sessões existentes
                        $temConflito = $sessoes->some(function ($sessao) use ($slotInicio, $slotFim) {
                            return !($slotFim <= $sessao->inicio || $slotInicio >= $sessao->fim);
                        });

                        $slots[] = [
                            'hora' => $current->format('H:i'),
                            'inicio' => $slotInicio->toIso8601String(),
                            'fim' => $slotFim->toIso8601String(),
                            'disponivel' => !$temConflito,
                        ];

                        $current = $current->addHours(1);
                    }
                } catch (\Exception $slotError) {
                    \Log::error('❌ Erro ao processar horário de disponibilidade:', [
                        'hora_inicio' => $disp->hora_inicio,
                        'hora_fim' => $disp->hora_fim,
                        'error' => $slotError->getMessage(),
                    ]);
                    // Continuar processando outras disponibilidades
                    continue;
                }
            }

            // Filtrar apenas slots disponíveis
            $slotsDisponiveis = array_filter($slots, fn($s) => $s['disponivel']);

            return response()->json([
                'disponivel' => !empty($slotsDisponiveis),
                'motivo' => empty($slotsDisponiveis) ? 'Todos os horários estão ocupados neste dia' : null,
                'slots' => array_values($slots), // array_values para reindexar
                'instrutor' => [
                    'id_instrutor' => $instructor->id_instrutor,
                    'nome' => $instructor->nome,
                ],
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'disponivel' => false,
                'motivo' => 'Data inválida',
                'slots' => [],
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            \Log::error('❌ Erro ao buscar disponibilidade:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'disponivel' => false,
                'motivo' => 'Erro ao buscar disponibilidade: ' . $e->getMessage(),
                'slots' => [],
                'error_debug' => [
                    'message' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                ]
            ], 500);
        }
    }
}
