<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\CreateInstrutorRequest;
use App\Http\Requests\UpdateInstrutorRequest;
use App\Models\Instrutor;
use App\Models\DisponibilidadeInstrutor;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class InstrutorController extends Controller
{
    /**
     * Listar instrutores com filtros
     */
    public function index(Request $request): JsonResponse
    {
        $query = Instrutor::with('disponibilidades');
        
        // SOFT DELETE: Não listar instrutores excluídos
        $query->where('status', '!=', 'excluido');
        
        // Filtro por especialidade
        if ($request->has('especialidade') && $request->especialidade !== '') {
            $query->comEspecialidade($request->especialidade);
        }
        
        // Filtro por status
        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }
        
        // Busca por nome ou email
        if ($request->has('search') && $request->search !== '') {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nome', 'ILIKE', "%{$search}%")
                  ->orWhere('email', 'ILIKE', "%{$search}%");
            });
        }
        
        // Ordenar
        $instrutores = $query->orderBy('nome')->get();
        
        // Mapear para formato frontend
        $data = $instrutores->map(function ($instrutor) {
            return [
                'id_instrutor' => (string) $instrutor->id_instrutor,
                'id_usuario' => $instrutor->id_usuario ? (string) $instrutor->id_usuario : null,
                'nome' => $instrutor->nome,
                'email' => $instrutor->email,
                'telefone' => $instrutor->telefone,
                'cref' => $instrutor->cref,
                'valor_hora' => (float) $instrutor->valor_hora,
                'especialidades' => $instrutor->especialidades_json ?? [],
                'bio' => $instrutor->bio,
                'status' => $instrutor->status,
                'criado_em' => $instrutor->criado_em->toISOString(),
                'atualizado_em' => $instrutor->atualizado_em->toISOString(),
                'disponibilidades' => $instrutor->disponibilidades->map(function ($disp) {
                    return [
                        'id_disponibilidade' => (string) $disp->id_disponibilidade,
                        'dia_semana' => $disp->dia_semana,
                        'dia_semana_texto' => $disp->dia_semana_texto,
                        'hora_inicio' => substr($disp->hora_inicio, 0, 5), // HH:MM
                        'hora_fim' => substr($disp->hora_fim, 0, 5),
                        'disponivel' => $disp->disponivel,
                    ];
                }),
            ];
        });
        
        return response()->json([
            'data' => $data,
            'total' => $data->count(),
        ], 200);
    }

    /**
     * Buscar instrutor por ID
     */
    public function show(string $id): JsonResponse
    {
        $instrutor = Instrutor::with('disponibilidades')->findOrFail($id);
        
        return response()->json([
            'data' => [
                'id_instrutor' => (string) $instrutor->id_instrutor,
                'id_usuario' => $instrutor->id_usuario ? (string) $instrutor->id_usuario : null,
                'nome' => $instrutor->nome,
                'email' => $instrutor->email,
                'telefone' => $instrutor->telefone,
                'cref' => $instrutor->cref,
                'valor_hora' => (float) $instrutor->valor_hora,
                'especialidades' => $instrutor->especialidades_json ?? [],
                'bio' => $instrutor->bio,
                'status' => $instrutor->status,
                'criado_em' => $instrutor->criado_em->toISOString(),
                'atualizado_em' => $instrutor->atualizado_em->toISOString(),
                'disponibilidades' => $instrutor->disponibilidades->map(function ($disp) {
                    return [
                        'id_disponibilidade' => (string) $disp->id_disponibilidade,
                        'dia_semana' => $disp->dia_semana,
                        'dia_semana_texto' => $disp->dia_semana_texto,
                        'hora_inicio' => substr($disp->hora_inicio, 0, 5),
                        'hora_fim' => substr($disp->hora_fim, 0, 5),
                        'disponivel' => $disp->disponivel,
                    ];
                }),
            ],
        ], 200);
    }

    /**
     * Criar novo instrutor
     */
    public function store(CreateInstrutorRequest $request): JsonResponse
    {
        DB::beginTransaction();
        
        try {
            $idUsuario = null;
            
            // Se deve criar usuário junto
            if ($request->criar_usuario) {
                $usuario = User::create([
                    'nome' => $request->nome,
                    'email' => $request->email,
                    'senha_hash' => Hash::make($request->senha),
                    'telefone' => $request->telefone,
                    'papel' => 'personal', // Ou 'instrutor'
                    'status' => 'ativo',
                ]);
                $idUsuario = $usuario->id_usuario;
            } else {
                $idUsuario = $request->id_usuario;
            }
            
            $instrutor = Instrutor::create([
                'id_usuario' => $idUsuario,
                'nome' => $request->nome,
                'email' => $request->email,
                'telefone' => $request->telefone,
                'cref' => $request->cref,
                'valor_hora' => $request->valor_hora,
                'especialidades_json' => $request->especialidades ?? [],
                'bio' => $request->bio,
                'status' => $request->status ?? 'ativo',
            ]);
            
            DB::commit();
            
            return response()->json([
                'data' => [
                    'id_instrutor' => (string) $instrutor->id_instrutor,
                    'nome' => $instrutor->nome,
                    'email' => $instrutor->email,
                    'valor_hora' => (float) $instrutor->valor_hora,
                    'status' => $instrutor->status,
                ],
                'message' => 'Instrutor criado com sucesso',
            ], 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erro ao criar instrutor: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Atualizar instrutor
     */
    public function update(UpdateInstrutorRequest $request, string $id): JsonResponse
    {
        $instrutor = Instrutor::findOrFail($id);
        
        $instrutor->update($request->only([
            'nome',
            'email',
            'telefone',
            'cref',
            'valor_hora',
            'bio',
            'status',
        ]));
        
        // Atualizar especialidades se fornecidas
        if ($request->has('especialidades')) {
            $instrutor->especialidades_json = $request->especialidades;
            $instrutor->save();
        }
        
        return response()->json([
            'data' => [
                'id_instrutor' => (string) $instrutor->id_instrutor,
                'nome' => $instrutor->nome,
                'email' => $instrutor->email,
                'valor_hora' => (float) $instrutor->valor_hora,
                'especialidades' => $instrutor->especialidades_json ?? [],
                'status' => $instrutor->status,
            ],
            'message' => 'Instrutor atualizado com sucesso',
        ], 200);
    }

    /**
     * Excluir instrutor (SOFT DELETE)
     */
    public function destroy(string $id): JsonResponse
    {
        $instrutor = Instrutor::findOrFail($id);
        
        // SOFT DELETE: Marcar como excluído em vez de deletar fisicamente
        $instrutor->update(['status' => 'excluido']);
        
        return response()->json(null, 204);
    }

    /**
     * Alternar status (ativo/inativo)
     */
    public function updateStatus(string $id): JsonResponse
    {
        $instrutor = Instrutor::findOrFail($id);
        $instrutor->status = $instrutor->status === 'ativo' ? 'inativo' : 'ativo';
        $instrutor->save();
        
        return response()->json([
            'data' => [
                'id_instrutor' => (string) $instrutor->id_instrutor,
                'status' => $instrutor->status,
            ],
            'message' => 'Status atualizado com sucesso',
        ], 200);
    }

    /**
     * Atualizar disponibilidade do instrutor
     */
    public function updateAvailability(Request $request, string $id): JsonResponse
    {
        $instrutor = Instrutor::findOrFail($id);
        
        $request->validate([
            'disponibilidades' => 'required|array',
            'disponibilidades.*.dia_semana' => 'required|integer|between:1,7',
            'disponibilidades.*.hora_inicio' => 'required|date_format:H:i',
            'disponibilidades.*.hora_fim' => 'required|date_format:H:i|after:disponibilidades.*.hora_inicio',
            'disponibilidades.*.disponivel' => 'nullable|boolean',
        ]);
        
        DB::beginTransaction();
        
        try {
            // Remover disponibilidades antigas
            DisponibilidadeInstrutor::where('id_instrutor', $id)->delete();
            
            // Criar novas disponibilidades
            foreach ($request->disponibilidades as $disp) {
                DisponibilidadeInstrutor::create([
                    'id_instrutor' => $id,
                    'dia_semana' => $disp['dia_semana'],
                    'hora_inicio' => $disp['hora_inicio'],
                    'hora_fim' => $disp['hora_fim'],
                    'disponivel' => $disp['disponivel'] ?? true,
                ]);
            }
            
            DB::commit();
            
            return response()->json([
                'message' => 'Disponibilidade atualizada com sucesso',
            ], 200);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erro ao atualizar disponibilidade: ' . $e->getMessage(),
            ], 500);
        }
    }
}
