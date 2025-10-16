<?php

namespace App\Http\Controllers;

use App\Models\SessaoPersonal;
use App\Http\Requests\CreateSessaoPersonalRequest;
use App\Http\Requests\UpdateSessaoPersonalRequest;
use App\Services\SessaoPersonalService;
use Illuminate\Http\Request;

class SessaoPersonalController extends Controller
{
    protected $service;

    public function __construct(SessaoPersonalService $service)
    {
        $this->service = $service;
    }

    /**
     * Listar sessões (com filtros)
     * GET /api/personal-sessions
     */
    public function index(Request $request)
    {
        $query = SessaoPersonal::with(['instrutor.usuario', 'usuario', 'quadra']);

        // Filtrar por instrutor
        if ($request->has('id_instrutor')) {
            $query->where('id_instrutor', $request->id_instrutor);
        }

        // Filtrar por aluno
        if ($request->has('id_usuario')) {
            $query->where('id_usuario', $request->id_usuario);
        }

        // Filtrar por status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filtrar por período (futuras/passadas)
        if ($request->has('periodo')) {
            if ($request->periodo === 'futuras') {
                $query->futuras();
            } elseif ($request->periodo === 'passadas') {
                $query->passadas();
            }
        }

        // Ordenar por data de início (mais recentes primeiro)
        $query->orderBy('inicio', 'desc');

        $sessoes = $query->paginate($request->get('per_page', 15));

        return response()->json($sessoes, 200);
    }

    /**
     * Buscar sessão específica
     * GET /api/personal-sessions/{id}
     */
    public function show($id)
    {
        $sessao = SessaoPersonal::with(['instrutor.usuario', 'usuario', 'quadra'])
            ->findOrFail($id);

        return response()->json(['data' => $sessao], 200);
    }

    /**
     * Criar nova sessão
     * POST /api/personal-sessions
     */
    public function store(CreateSessaoPersonalRequest $request)
    {
        try {
            $sessao = $this->service->criarSessao($request->validated());
            $sessao->load(['instrutor.usuario', 'usuario', 'quadra']);

            return response()->json(['data' => $sessao], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'code' => 'VALIDATION_ERROR'
            ], 422);
        }
    }

    /**
     * Atualizar sessão
     * PUT/PATCH /api/personal-sessions/{id}
     */
    public function update(UpdateSessaoPersonalRequest $request, $id)
    {
        $sessao = SessaoPersonal::findOrFail($id);

        try {
            $sessaoAtualizada = $this->service->atualizarSessao($sessao, $request->validated());
            $sessaoAtualizada->load(['instrutor.usuario', 'usuario', 'quadra']);

            return response()->json(['data' => $sessaoAtualizada], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'code' => 'VALIDATION_ERROR'
            ], 422);
        }
    }

    /**
     * Cancelar sessão
     * DELETE /api/personal-sessions/{id}
     */
    public function destroy($id)
    {
        $sessao = SessaoPersonal::findOrFail($id);
        
        // Atualizar status para cancelada (soft delete)
        $sessao->update(['status' => 'cancelada']);

        return response()->json(null, 204);
    }

    /**
     * Confirmar sessão
     * PATCH /api/personal-sessions/{id}/confirm
     */
    public function confirm($id)
    {
        $sessao = SessaoPersonal::findOrFail($id);
        $sessao->update(['status' => 'confirmada']);
        $sessao->load(['instrutor.usuario', 'usuario', 'quadra']);

        return response()->json(['data' => $sessao], 200);
    }

    /**
     * Verificar disponibilidade de um instrutor
     * POST /api/personal-sessions/check-availability
     */
    public function checkAvailability(Request $request)
    {
        $request->validate([
            'id_instrutor' => 'required|exists:instrutores,id_instrutor',
            'inicio' => 'required|date',
            'fim' => 'required|date|after:inicio',
        ]);

        $inicio = \Carbon\Carbon::parse($request->inicio);
        $fim = \Carbon\Carbon::parse($request->fim);

        $resultado = $this->service->validarDisponibilidade(
            $request->id_instrutor,
            $inicio,
            $fim
        );

        if ($resultado['disponivel']) {
            $preco = $this->service->calcularPreco($request->id_instrutor, $inicio, $fim);
            return response()->json([
                'disponivel' => true,
                'preco_total' => $preco
            ], 200);
        }

        return response()->json([
            'disponivel' => false,
            'motivo' => $resultado['motivo']
        ], 200);
    }
}
