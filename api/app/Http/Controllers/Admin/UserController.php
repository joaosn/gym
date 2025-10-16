<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\CreateUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Listar usuários com filtros
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::query();
        
        // SOFT DELETE: Não listar usuários excluídos
        $query->where('status', '!=', 'excluido');
        
        // Filtro por papel
        if ($request->has('papel') && $request->papel !== '') {
            $query->where('papel', $request->papel);
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
        $usuarios = $query->orderBy('nome')->get();
        
        // Mapear para formato frontend
        $data = $usuarios->map(function ($usuario) {
            return [
                'id_usuario' => (string) $usuario->id_usuario,
                'nome' => $usuario->nome,
                'email' => $usuario->email,
                'telefone' => $usuario->telefone,
                'documento' => $usuario->documento,
                'data_nascimento' => $usuario->data_nascimento?->format('Y-m-d'),
                'papel' => $usuario->papel,
                'status' => $usuario->status,
                'criado_em' => $usuario->criado_em->toISOString(),
                'atualizado_em' => $usuario->atualizado_em->toISOString(),
            ];
        });
        
        return response()->json([
            'data' => $data,
            'total' => $data->count(),
        ], 200);
    }

    /**
     * Buscar usuário por ID
     */
    public function show(string $id): JsonResponse
    {
        $usuario = User::findOrFail($id);
        
        return response()->json([
            'data' => [
                'id_usuario' => (string) $usuario->id_usuario,
                'nome' => $usuario->nome,
                'email' => $usuario->email,
                'telefone' => $usuario->telefone,
                'documento' => $usuario->documento,
                'data_nascimento' => $usuario->data_nascimento?->format('Y-m-d'),
                'papel' => $usuario->papel,
                'status' => $usuario->status,
                'criado_em' => $usuario->criado_em->toISOString(),
                'atualizado_em' => $usuario->atualizado_em->toISOString(),
            ],
        ], 200);
    }

    /**
     * Criar novo usuário
     */
    public function store(CreateUserRequest $request): JsonResponse
    {
        $usuario = User::create([
            'nome' => $request->nome,
            'email' => $request->email,
            'senha_hash' => Hash::make($request->senha),
            'telefone' => $request->telefone,
            'documento' => $request->documento,
            'data_nascimento' => $request->data_nascimento,
            'papel' => $request->papel,
            'status' => $request->status ?? 'ativo',
        ]);
        
        return response()->json([
            'data' => [
                'id_usuario' => (string) $usuario->id_usuario,
                'nome' => $usuario->nome,
                'email' => $usuario->email,
                'telefone' => $usuario->telefone,
                'documento' => $usuario->documento,
                'data_nascimento' => $usuario->data_nascimento?->format('Y-m-d'),
                'papel' => $usuario->papel,
                'status' => $usuario->status,
                'criado_em' => $usuario->criado_em->toISOString(),
                'atualizado_em' => $usuario->atualizado_em->toISOString(),
            ],
            'message' => 'Usuário criado com sucesso',
        ], 201);
    }

    /**
     * Atualizar usuário
     */
    public function update(UpdateUserRequest $request, string $id): JsonResponse
    {
        $usuario = User::findOrFail($id);
        
        // Atualizar apenas campos fornecidos
        if ($request->has('nome')) {
            $usuario->nome = $request->nome;
        }
        
        if ($request->has('email')) {
            $usuario->email = $request->email;
        }
        
        if ($request->has('senha')) {
            $usuario->senha_hash = Hash::make($request->senha);
        }
        
        if ($request->has('telefone')) {
            $usuario->telefone = $request->telefone;
        }
        
        if ($request->has('documento')) {
            $usuario->documento = $request->documento;
        }
        
        if ($request->has('data_nascimento')) {
            $usuario->data_nascimento = $request->data_nascimento;
        }
        
        if ($request->has('papel')) {
            $usuario->papel = $request->papel;
        }
        
        if ($request->has('status')) {
            $usuario->status = $request->status;
        }
        
        $usuario->save();
        
        return response()->json([
            'data' => [
                'id_usuario' => (string) $usuario->id_usuario,
                'nome' => $usuario->nome,
                'email' => $usuario->email,
                'telefone' => $usuario->telefone,
                'documento' => $usuario->documento,
                'data_nascimento' => $usuario->data_nascimento?->format('Y-m-d'),
                'papel' => $usuario->papel,
                'status' => $usuario->status,
                'criado_em' => $usuario->criado_em->toISOString(),
                'atualizado_em' => $usuario->atualizado_em->toISOString(),
            ],
            'message' => 'Usuário atualizado com sucesso',
        ], 200);
    }

    /**
     * Excluir usuário (SOFT DELETE)
     */
    public function destroy(string $id): JsonResponse
    {
        $usuario = User::findOrFail($id);
        
        // SOFT DELETE: Marcar como excluído em vez de deletar fisicamente
        $usuario->update(['status' => 'excluido']);
        
        return response()->json(null, 204);
    }

    /**
     * Alternar status (ativo/inativo)
     */
    public function updateStatus(string $id): JsonResponse
    {
        $usuario = User::findOrFail($id);
        
        // Alternar status automaticamente
        $usuario->status = $usuario->status === 'ativo' ? 'inativo' : 'ativo';
        $usuario->save();
        
        return response()->json([
            'data' => [
                'id_usuario' => (string) $usuario->id_usuario,
                'nome' => $usuario->nome,
                'email' => $usuario->email,
                'telefone' => $usuario->telefone,
                'documento' => $usuario->documento,
                'data_nascimento' => $usuario->data_nascimento?->format('Y-m-d'),
                'papel' => $usuario->papel,
                'status' => $usuario->status,
                'criado_em' => $usuario->criado_em->toISOString(),
                'atualizado_em' => $usuario->atualizado_em->toISOString(),
            ],
            'message' => 'Status do usuário atualizado com sucesso',
        ], 200);
    }
}
