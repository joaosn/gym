<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\CreateQuadraRequest;
use App\Http\Requests\UpdateQuadraRequest;
use App\Models\Quadra;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QuadraController extends Controller
{
    /**
     * Listar todas as quadras
     * 
     * GET /api/admin/courts
     */
    public function index(Request $request): JsonResponse
    {
        $query = Quadra::query();

        // Filtro por esporte
        if ($request->has('esporte') && $request->esporte) {
            $query->porEsporte($request->esporte);
        }

        // Filtro por status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Busca por nome
        if ($request->has('search') && $request->search) {
            $query->where('nome', 'ILIKE', '%' . $request->search . '%');
        }

        // Ordenação
        $sortBy = $request->get('sort_by', 'nome');
        $sortOrder = $request->get('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        // Paginação
        $perPage = $request->get('per_page', 15);
        $quadras = $query->paginate($perPage);

        return response()->json([
            'data' => $quadras->items(),
            'pagination' => [
                'total' => $quadras->total(),
                'per_page' => $quadras->perPage(),
                'current_page' => $quadras->currentPage(),
                'last_page' => $quadras->lastPage(),
                'from' => $quadras->firstItem(),
                'to' => $quadras->lastItem(),
            ]
        ]);
    }

    /**
     * Exibir uma quadra específica
     * 
     * GET /api/admin/courts/{id}
     */
    public function show(string $id): JsonResponse
    {
        $quadra = Quadra::find($id);

        if (!$quadra) {
            return response()->json([
                'message' => 'Quadra não encontrada',
                'code' => 'NOT_FOUND'
            ], 404);
        }

        return response()->json(['data' => $quadra]);
    }

    /**
     * Criar nova quadra
     * 
     * POST /api/admin/courts
     */
    public function store(CreateQuadraRequest $request): JsonResponse
    {
        $dados = $request->validated();

        // Converter características para JSON se for array
        if (isset($dados['caracteristicas_json']) && is_array($dados['caracteristicas_json'])) {
            $dados['caracteristicas_json'] = json_encode($dados['caracteristicas_json']);
        }

        $quadra = Quadra::create($dados);

        return response()->json([
            'message' => 'Quadra criada com sucesso',
            'data' => $quadra
        ], 201);
    }

    /**
     * Atualizar uma quadra existente
     * 
     * PUT/PATCH /api/admin/courts/{id}
     */
    public function update(UpdateQuadraRequest $request, string $id): JsonResponse
    {
        $quadra = Quadra::find($id);

        if (!$quadra) {
            return response()->json([
                'message' => 'Quadra não encontrada',
                'code' => 'NOT_FOUND'
            ], 404);
        }

        $dados = $request->validated();

        // Converter características para JSON se for array
        if (isset($dados['caracteristicas_json']) && is_array($dados['caracteristicas_json'])) {
            $dados['caracteristicas_json'] = json_encode($dados['caracteristicas_json']);
        }

        $quadra->update($dados);

        return response()->json([
            'message' => 'Quadra atualizada com sucesso',
            'data' => $quadra->fresh()
        ]);
    }

    /**
     * Excluir uma quadra
     * 
     * DELETE /api/admin/courts/{id}
     */
    public function destroy(string $id): JsonResponse
    {
        $quadra = Quadra::find($id);

        if (!$quadra) {
            return response()->json([
                'message' => 'Quadra não encontrada',
                'code' => 'NOT_FOUND'
            ], 404);
        }

        // TODO: Verificar se há reservas futuras antes de excluir
        // Por enquanto, apenas excluímos

        $quadra->delete();

        return response()->json([
            'message' => 'Quadra excluída com sucesso'
        ], 200);
    }

    /**
     * Atualizar apenas o status de uma quadra
     * 
     * PATCH /api/admin/courts/{id}/status
     */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'status' => 'required|string|in:ativa,inativa'
        ]);

        $quadra = Quadra::find($id);

        if (!$quadra) {
            return response()->json([
                'message' => 'Quadra não encontrada',
                'code' => 'NOT_FOUND'
            ], 404);
        }

        $quadra->update(['status' => $request->status]);

        return response()->json([
            'message' => 'Status atualizado com sucesso',
            'data' => $quadra->fresh()
        ]);
    }
}
