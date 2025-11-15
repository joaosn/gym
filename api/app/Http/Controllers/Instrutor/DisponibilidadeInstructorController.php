<?php

namespace App\Http\Controllers\Instrutor;

use App\Http\Controllers\Controller;
use App\Models\DisponibilidadeInstrutor;
use App\Models\Instrutor;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DisponibilidadeInstructorController extends Controller
{
    /**
     * Lista todos os horários disponíveis do instrutor autenticado
     * 
     * GET /instructor/availability
     */
    public function index(Request $request): JsonResponse
    {
        try {
            // Pegar ID do instrutor autenticado
            $user = auth()->user();
            $instrutor = Instrutor::where('id_usuario', $user->id_usuario)->first();

            if (!$instrutor) {
                return response()->json([
                    'message' => 'Instrutor não encontrado',
                ], 404);
            }

            // Buscar horários ordenados por dia da semana e hora de início
            $horarios = DisponibilidadeInstrutor::where('id_instrutor', $instrutor->id_instrutor)
                ->orderBy('dia_semana')
                ->orderBy('hora_inicio')
                ->get();

            return response()->json($horarios, 200);
        } catch (\Exception $e) {
            \Log::error('Erro ao listar disponibilidade:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Erro ao carregar horários disponíveis',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cria um novo horário disponível
     * 
     * POST /instructor/availability
     * Body: { dia_semana, hora_inicio, hora_fim, disponivel }
     */
    public function store(Request $request): JsonResponse
    {
        try {
            // Validação
            $validated = $request->validate([
                'dia_semana' => 'required|integer|min:1|max:7',
                'hora_inicio' => 'required|date_format:H:i:s',
                'hora_fim' => 'required|date_format:H:i:s|after:hora_inicio',
                'disponivel' => 'nullable|boolean',
            ], [
                'dia_semana.required' => 'O dia da semana é obrigatório',
                'dia_semana.min' => 'Dia da semana inválido (1-7)',
                'dia_semana.max' => 'Dia da semana inválido (1-7)',
                'hora_inicio.required' => 'A hora de início é obrigatória',
                'hora_inicio.date_format' => 'Formato de hora inválido (use HH:mm:ss)',
                'hora_fim.required' => 'A hora de término é obrigatória',
                'hora_fim.date_format' => 'Formato de hora inválido (use HH:mm:ss)',
                'hora_fim.after' => 'A hora de término deve ser posterior à hora de início',
            ]);

            // Pegar ID do instrutor autenticado
            $user = auth()->user();
            $instrutor = Instrutor::where('id_usuario', $user->id_usuario)->first();

            if (!$instrutor) {
                return response()->json([
                    'message' => 'Instrutor não encontrado',
                ], 404);
            }

            // Verificar se já existe horário conflitante (overlap)
            $conflito = DisponibilidadeInstrutor::where('id_instrutor', $instrutor->id_instrutor)
                ->where('dia_semana', $validated['dia_semana'])
                ->where(function ($query) use ($validated) {
                    $query->where(function ($q) use ($validated) {
                        // Início do novo horário está dentro de um existente
                        $q->where('hora_inicio', '<=', $validated['hora_inicio'])
                          ->where('hora_fim', '>', $validated['hora_inicio']);
                    })->orWhere(function ($q) use ($validated) {
                        // Fim do novo horário está dentro de um existente
                        $q->where('hora_inicio', '<', $validated['hora_fim'])
                          ->where('hora_fim', '>=', $validated['hora_fim']);
                    })->orWhere(function ($q) use ($validated) {
                        // Novo horário engloba um existente
                        $q->where('hora_inicio', '>=', $validated['hora_inicio'])
                          ->where('hora_fim', '<=', $validated['hora_fim']);
                    });
                })
                ->exists();

            if ($conflito) {
                return response()->json([
                    'message' => 'Já existe um horário cadastrado que conflita com este período',
                    'errors' => [
                        'hora_inicio' => ['Horário conflitante com período já cadastrado'],
                        'hora_fim' => ['Horário conflitante com período já cadastrado']
                    ]
                ], 422);
            }

            // Criar horário
            $horario = DisponibilidadeInstrutor::create([
                'id_instrutor' => $instrutor->id_instrutor,
                'dia_semana' => $validated['dia_semana'],
                'hora_inicio' => $validated['hora_inicio'],
                'hora_fim' => $validated['hora_fim'],
                'disponivel' => $validated['disponivel'] ?? true,
            ]);

            return response()->json([
                'message' => 'Horário disponível criado com sucesso',
                'data' => $horario
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Dados inválidos',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Erro ao criar disponibilidade:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Erro ao criar horário disponível',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Atualiza um horário disponível existente
     * 
     * PUT /instructor/availability/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            // Pegar ID do instrutor autenticado
            $user = auth()->user();
            $instrutor = Instrutor::where('id_usuario', $user->id_usuario)->first();

            if (!$instrutor) {
                return response()->json([
                    'message' => 'Instrutor não encontrado',
                ], 404);
            }

            // Buscar horário (só do próprio instrutor!)
            $horario = DisponibilidadeInstrutor::where('id_disponibilidade', $id)
                ->where('id_instrutor', $instrutor->id_instrutor)
                ->first();

            if (!$horario) {
                return response()->json([
                    'message' => 'Horário não encontrado ou não pertence a você',
                ], 404);
            }

            // Validação
            $validated = $request->validate([
                'dia_semana' => 'required|integer|min:1|max:7',
                'hora_inicio' => 'required|date_format:H:i:s',
                'hora_fim' => 'required|date_format:H:i:s|after:hora_inicio',
                'disponivel' => 'nullable|boolean',
            ], [
                'dia_semana.required' => 'O dia da semana é obrigatório',
                'dia_semana.min' => 'Dia da semana inválido (1-7)',
                'dia_semana.max' => 'Dia da semana inválido (1-7)',
                'hora_inicio.required' => 'A hora de início é obrigatória',
                'hora_inicio.date_format' => 'Formato de hora inválido (use HH:mm:ss)',
                'hora_fim.required' => 'A hora de término é obrigatória',
                'hora_fim.date_format' => 'Formato de hora inválido (use HH:mm:ss)',
                'hora_fim.after' => 'A hora de término deve ser posterior à hora de início',
            ]);

            // Verificar conflito (excluindo o próprio registro)
            $conflito = DisponibilidadeInstrutor::where('id_instrutor', $instrutor->id_instrutor)
                ->where('id_disponibilidade', '!=', $id)
                ->where('dia_semana', $validated['dia_semana'])
                ->where(function ($query) use ($validated) {
                    $query->where(function ($q) use ($validated) {
                        $q->where('hora_inicio', '<=', $validated['hora_inicio'])
                          ->where('hora_fim', '>', $validated['hora_inicio']);
                    })->orWhere(function ($q) use ($validated) {
                        $q->where('hora_inicio', '<', $validated['hora_fim'])
                          ->where('hora_fim', '>=', $validated['hora_fim']);
                    })->orWhere(function ($q) use ($validated) {
                        $q->where('hora_inicio', '>=', $validated['hora_inicio'])
                          ->where('hora_fim', '<=', $validated['hora_fim']);
                    });
                })
                ->exists();

            if ($conflito) {
                return response()->json([
                    'message' => 'Já existe um horário cadastrado que conflita com este período',
                    'errors' => [
                        'hora_inicio' => ['Horário conflitante com período já cadastrado'],
                        'hora_fim' => ['Horário conflitante com período já cadastrado']
                    ]
                ], 422);
            }

            // Atualizar
            $horario->update([
                'dia_semana' => $validated['dia_semana'],
                'hora_inicio' => $validated['hora_inicio'],
                'hora_fim' => $validated['hora_fim'],
                'disponivel' => $validated['disponivel'] ?? $horario->disponivel,
            ]);

            return response()->json([
                'message' => 'Horário atualizado com sucesso',
                'data' => $horario->fresh()
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Dados inválidos',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Erro ao atualizar disponibilidade:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Erro ao atualizar horário disponível',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove um horário disponível
     * 
     * DELETE /instructor/availability/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            // Pegar ID do instrutor autenticado
            $user = auth()->user();
            $instrutor = Instrutor::where('id_usuario', $user->id_usuario)->first();

            if (!$instrutor) {
                return response()->json([
                    'message' => 'Instrutor não encontrado',
                ], 404);
            }

            // Buscar horário (só do próprio instrutor!)
            $horario = DisponibilidadeInstrutor::where('id_disponibilidade', $id)
                ->where('id_instrutor', $instrutor->id_instrutor)
                ->first();

            if (!$horario) {
                return response()->json([
                    'message' => 'Horário não encontrado ou não pertence a você',
                ], 404);
            }

            // Deletar (hard delete, não tem soft delete nesta tabela)
            $horario->delete();

            return response()->json([
                'message' => 'Horário excluído com sucesso'
            ], 200);
        } catch (\Exception $e) {
            \Log::error('Erro ao excluir disponibilidade:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Erro ao excluir horário disponível',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
