<?php

namespace App\Http\Controllers;

use App\Models\OcorrenciaAula;
use App\Services\OcorrenciaAulaService;
use Carbon\Carbon;
use Illuminate\Http\Request;

class OcorrenciaAulaController extends Controller
{
    protected $ocorrenciaService;

    public function __construct(OcorrenciaAulaService $ocorrenciaService)
    {
        $this->ocorrenciaService = $ocorrenciaService;
    }

    /**
     * Listar ocorrências (com filtros)
     */
    public function index(Request $request)
    {
        $query = OcorrenciaAula::with(['aula', 'instrutor', 'quadra'])->withCount('inscricoes');

        // Filtros
        if ($request->filled('id_aula')) {
            $query->where('id_aula', $request->id_aula);
        }

        if ($request->filled('id_instrutor')) {
            $query->where('id_instrutor', $request->id_instrutor);
        }

        if ($request->filled('id_quadra')) {
            $query->where('id_quadra', $request->id_quadra);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        } else {
            // Padrão: excluir apenas canceladas
            $query->where('status', '!=', 'cancelada');
        }

        // Filtro por data (início)
        if ($request->filled('data_inicio')) {
            $query->whereDate('inicio', '>=', $request->data_inicio);
        }

        if ($request->filled('data_fim')) {
            $query->whereDate('inicio', '<=', $request->data_fim);
        }

        $query->orderBy('inicio', 'asc');

        $perPage = $request->input('per_page', 50);
        $ocorrencias = $query->paginate($perPage);

        return response()->json([
            'data' => $ocorrencias->items(),
            'meta' => [
                'current_page' => $ocorrencias->currentPage(),
                'last_page' => $ocorrencias->lastPage(),
                'per_page' => $ocorrencias->perPage(),
                'total' => $ocorrencias->total(),
            ],
        ], 200);
    }    /**
     * Gerar ocorrências de uma aula (admin)
     */
    public function gerar(Request $request)
    {
        $validated = $request->validate([
            'id_aula' => 'required|exists:aulas,id_aula',
            'data_inicio' => 'required|date|after_or_equal:today',
            'data_fim' => 'required|date|after:data_inicio',
        ]);

        try {
            $resultado = $this->ocorrenciaService->gerarOcorrencias(
                $validated['id_aula'],
                Carbon::parse($validated['data_inicio']),
                Carbon::parse($validated['data_fim'])
            );

            return response()->json([
                'message' => 'Ocorrências geradas com sucesso',
                'criadas' => $resultado['criadas'],
                'puladas' => $resultado['puladas'],
                'data' => $resultado['ocorrencias'],
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao gerar ocorrências',
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Cancelar uma ocorrência específica
     */
    public function cancelar(int $id)
    {
        $ocorrencia = OcorrenciaAula::findOrFail($id);

        if ($ocorrencia->status === 'cancelada') {
            return response()->json([
                'message' => 'Ocorrência já está cancelada',
            ], 400);
        }

        if ($ocorrencia->inicio < now()) {
            return response()->json([
                'message' => 'Não é possível cancelar ocorrências passadas',
            ], 400);
        }

        $ocorrencia->update(['status' => 'cancelada']);

        // Cancelar inscrições
        $ocorrencia->inscricoes()->where('status', 'inscrito')->update(['status' => 'cancelado']);

        return response()->json([
            'message' => 'Ocorrência cancelada com sucesso',
            'data' => $ocorrencia,
        ], 200);
    }

    /**
     * Obter detalhes de uma ocorrência
     */
    public function show(int $id)
    {
        $ocorrencia = OcorrenciaAula::with(['aula', 'instrutor', 'quadra', 'inscricoes.usuario'])
            ->findOrFail($id);

        return response()->json(['data' => $ocorrencia], 200);
    }
}

