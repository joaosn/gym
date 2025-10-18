<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\CreatePlanoRequest;
use App\Http\Requests\UpdatePlanoRequest;
use App\Models\Plano;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PlanoController extends Controller
{
    /**
     * Listar todos os planos (com filtros e paginação)
     * GET /api/admin/plans
     * 
     * @param \Illuminate\Http\Request $request
     */
    public function index(Request $request): JsonResponse
    {
        $query = Plano::query();
        
        // SOFT DELETE: Não listar planos excluídos
        $query->where('status', '!=', 'excluido');

        // Filtro por ciclo de cobrança
        if ($request->filled('ciclo')) {
            $query->where('ciclo_cobranca', $request->ciclo);
        }

        // Filtro por status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Busca por nome
        if ($request->filled('search')) {
            $query->where('nome', 'ILIKE', '%' . $request->search . '%');
        }

        // Ordenação
        $sortBy = $request->get('sort_by', 'criado_em');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Paginação
        $perPage = $request->get('per_page', 15);
        $planos = $query->paginate($perPage);

        return response()->json([
            'data' => $planos->items(),
            'pagination' => [
                'total' => $planos->total(),
                'per_page' => $planos->perPage(),
                'current_page' => $planos->currentPage(),
                'last_page' => $planos->lastPage(),
                'from' => $planos->firstItem(),
                'to' => $planos->lastItem(),
            ],
        ]);
    }

    /**
     * Obter detalhes de um plano específico
     * GET /api/admin/plans/{id}
     */
    public function show(string $id): JsonResponse
    {
        $plano = Plano::findOrFail($id);
        
        return response()->json([
            'data' => $plano,
        ]);
    }

    /**
     * Criar novo plano
     * POST /api/admin/plans
     */
    public function store(CreatePlanoRequest $request): JsonResponse
    {
        $plano = Plano::create($request->validated());

        return response()->json([
            'data' => $plano,
            'message' => 'Plano criado com sucesso',
        ], 201);
    }

    /**
     * Atualizar plano existente
     * PUT /api/admin/plans/{id}
     */
    public function update(UpdatePlanoRequest $request, string $id): JsonResponse
    {
        $plano = Plano::findOrFail($id);
        $plano->update($request->validated());

        return response()->json([
            'data' => $plano->fresh(),
            'message' => 'Plano atualizado com sucesso',
        ]);
    }

    /**
     * Excluir plano (SOFT DELETE)
     * DELETE /api/admin/plans/{id}
     */
    public function destroy(string $id): JsonResponse
    {
        $plano = Plano::findOrFail($id);
        
        // SOFT DELETE: Marcar como excluído em vez de deletar fisicamente
        $plano->update(['status' => 'excluido']);

        return response()->json(null, 204);
    }

    /**
     * Atualizar status do plano (ativo/inativo)
     * PATCH /api/admin/plans/{id}/status
     */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $plano = Plano::findOrFail($id);
        
        // Alternar status automaticamente
        $plano->status = $plano->status === 'ativo' ? 'inativo' : 'ativo';
        $plano->save();

        return response()->json([
            'data' => $plano,
            'message' => 'Status do plano atualizado com sucesso',
        ]);
    }
}
