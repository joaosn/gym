<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\CreateReservaQuadraRequest;
use App\Http\Requests\UpdateReservaQuadraRequest;
use App\Models\ReservaQuadra;
use App\Services\ReservaQuadraService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReservaQuadraController extends Controller
{
    protected ReservaQuadraService $service;

    public function __construct(ReservaQuadraService $service)
    {
        $this->service = $service;
    }

    /**
     * Listar reservas de quadras com filtros
     * 
     * GET /api/admin/court-bookings
     */
    public function index(Request $request): JsonResponse
    {
        $query = ReservaQuadra::with(['quadra', 'usuario']);

        // Filtro por quadra
        if ($request->has('id_quadra') && $request->id_quadra !== '') {
            $query->where('id_quadra', $request->id_quadra);
        }

        // Filtro por usuário
        if ($request->has('id_usuario') && $request->id_usuario !== '') {
            $query->where('id_usuario', $request->id_usuario);
        }

        // Filtro por status
        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        // Filtro por período
        if ($request->has('data_inicio') && $request->data_inicio !== '') {
            $query->where('inicio', '>=', $request->data_inicio);
        }
        if ($request->has('data_fim') && $request->data_fim !== '') {
            $query->where('fim', '<=', $request->data_fim);
        }

        // Busca por nome de usuário
        if ($request->has('search') && $request->search !== '') {
            $search = $request->search;
            $query->whereHas('usuario', function ($q) use ($search) {
                $q->where('nome', 'ILIKE', "%{$search}%");
            });
        }

        // Ordenar por data mais recente
        $reservas = $query->orderBy('inicio', 'desc')->get();

        // Mapear para formato frontend
        $data = $reservas->map(function ($reserva) {
            return [
                'id_reserva_quadra' => (string) $reserva->id_reserva_quadra,
                'id_quadra' => (string) $reserva->id_quadra,
                'id_usuario' => (string) $reserva->id_usuario,
                'inicio' => $reserva->inicio->toISOString(),
                'fim' => $reserva->fim->toISOString(),
                'preco_total' => (float) $reserva->preco_total,
                'status' => $reserva->status,
                'observacoes' => $reserva->observacoes,
                'quadra' => $reserva->quadra ? [
                    'id_quadra' => (string) $reserva->quadra->id_quadra,
                    'nome' => $reserva->quadra->nome,
                ] : null,
                'usuario' => $reserva->usuario ? [
                    'id_usuario' => (string) $reserva->usuario->id_usuario,
                    'nome' => $reserva->usuario->nome,
                    'email' => $reserva->usuario->email,
                ] : null,
                'criado_em' => $reserva->criado_em->toISOString(),
                'atualizado_em' => $reserva->atualizado_em->toISOString(),
            ];
        });

        return response()->json([
            'data' => $data,
            'total' => $data->count(),
        ], 200);
    }

    /**
     * Buscar reserva por ID
     * 
     * GET /api/admin/court-bookings/{id}
     */
    public function show(string $id): JsonResponse
    {
        $reserva = ReservaQuadra::with(['quadra', 'usuario'])->findOrFail($id);

        return response()->json([
            'data' => [
                'id_reserva_quadra' => (string) $reserva->id_reserva_quadra,
                'id_quadra' => (string) $reserva->id_quadra,
                'id_usuario' => (string) $reserva->id_usuario,
                'inicio' => $reserva->inicio->toISOString(),
                'fim' => $reserva->fim->toISOString(),
                'preco_total' => (float) $reserva->preco_total,
                'status' => $reserva->status,
                'observacoes' => $reserva->observacoes,
                'quadra' => $reserva->quadra ? [
                    'id_quadra' => (string) $reserva->quadra->id_quadra,
                    'nome' => $reserva->quadra->nome,
                    'preco_hora' => (float) $reserva->quadra->preco_hora,
                ] : null,
                'usuario' => $reserva->usuario ? [
                    'id_usuario' => (string) $reserva->usuario->id_usuario,
                    'nome' => $reserva->usuario->nome,
                    'email' => $reserva->usuario->email,
                    'telefone' => $reserva->usuario->telefone,
                ] : null,
                'criado_em' => $reserva->criado_em->toISOString(),
                'atualizado_em' => $reserva->atualizado_em->toISOString(),
            ],
        ], 200);
    }

    /**
     * Criar nova reserva
     * 
     * POST /api/admin/court-bookings
     */
    public function store(CreateReservaQuadraRequest $request): JsonResponse
    {
        try {
            $reserva = $this->service->criarReserva($request->validated());

            return response()->json([
                'data' => [
                    'id_reserva_quadra' => (string) $reserva->id_reserva_quadra,
                    'id_quadra' => (string) $reserva->id_quadra,
                    'id_usuario' => (string) $reserva->id_usuario,
                    'inicio' => $reserva->inicio->toISOString(),
                    'fim' => $reserva->fim->toISOString(),
                    'preco_total' => (float) $reserva->preco_total,
                    'status' => $reserva->status,
                    'observacoes' => $reserva->observacoes,
                    'criado_em' => $reserva->criado_em->toISOString(),
                    'atualizado_em' => $reserva->atualizado_em->toISOString(),
                ],
                'message' => 'Reserva criada com sucesso',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao criar reserva',
                'error' => $e->getMessage(),
            ], 409);
        }
    }

    /**
     * Atualizar reserva
     * 
     * PUT/PATCH /api/admin/court-bookings/{id}
     */
    public function update(UpdateReservaQuadraRequest $request, string $id): JsonResponse
    {
        try {
            $reserva = ReservaQuadra::findOrFail($id);
            $reservaAtualizada = $this->service->atualizarReserva($reserva, $request->validated());

            return response()->json([
                'data' => [
                    'id_reserva_quadra' => (string) $reservaAtualizada->id_reserva_quadra,
                    'id_quadra' => (string) $reservaAtualizada->id_quadra,
                    'id_usuario' => (string) $reservaAtualizada->id_usuario,
                    'inicio' => $reservaAtualizada->inicio->toISOString(),
                    'fim' => $reservaAtualizada->fim->toISOString(),
                    'preco_total' => (float) $reservaAtualizada->preco_total,
                    'status' => $reservaAtualizada->status,
                    'observacoes' => $reservaAtualizada->observacoes,
                    'criado_em' => $reservaAtualizada->criado_em->toISOString(),
                    'atualizado_em' => $reservaAtualizada->atualizado_em->toISOString(),
                ],
                'message' => 'Reserva atualizada com sucesso',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao atualizar reserva',
                'error' => $e->getMessage(),
            ], 409);
        }
    }

    /**
     * Cancelar reserva (soft delete)
     * 
     * DELETE /api/admin/court-bookings/{id}
     */
    public function destroy(string $id): JsonResponse
    {
        $reserva = ReservaQuadra::findOrFail($id);
        $reserva->update(['status' => 'cancelada']);

        return response()->json(null, 204);
    }

    /**
     * Confirmar reserva
     * 
     * PATCH /api/admin/court-bookings/{id}/confirm
     */
    public function confirm(string $id): JsonResponse
    {
        $reserva = ReservaQuadra::findOrFail($id);
        $reserva->update(['status' => 'confirmada']);

        return response()->json([
            'data' => [
                'id_reserva_quadra' => (string) $reserva->id_reserva_quadra,
                'status' => $reserva->status,
            ],
            'message' => 'Reserva confirmada com sucesso',
        ], 200);
    }

    /**
     * Verificar disponibilidade
     * 
     * POST /api/admin/court-bookings/check-availability
     */
    public function checkAvailability(Request $request): JsonResponse
    {
        $request->validate([
            'id_quadra' => 'required|integer|exists:quadras,id_quadra',
            'inicio' => 'required|date',
            'fim' => 'required|date|after:inicio',
        ]);

        $resultado = $this->service->verificarDisponibilidade(
            $request->id_quadra,
            $request->inicio,
            $request->fim
        );

        return response()->json(['data' => $resultado], 200);
    }
}
