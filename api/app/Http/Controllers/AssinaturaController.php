<?php

namespace App\Http\Controllers;

use App\Models\Assinatura;
use App\Models\EventoAssinatura;
use App\Models\Plano;
use App\Services\PagamentoService;
use App\Services\NotificacaoService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AssinaturaController extends Controller
{
    protected $pagamentoService;
    protected $notificacaoService;

    public function __construct(
        PagamentoService $pagamentoService,
        NotificacaoService $notificacaoService
    ) {
        $this->pagamentoService = $pagamentoService;
        $this->notificacaoService = $notificacaoService;
    }
    /**
     * ADMIN: Listar todas as assinaturas
     * GET /api/admin/subscriptions
     */
    public function index(Request $request)
    {
        $query = Assinatura::with(['usuario', 'plano']);

        // Filtros
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('id_usuario')) {
            $query->where('id_usuario', $request->id_usuario);
        }

        if ($request->has('id_plano')) {
            $query->where('id_plano', $request->id_plano);
        }

        // Busca por nome de usuário
        if ($request->has('search') && $request->search) {
            $query->whereHas('usuario', function ($q) use ($request) {
                $q->where('nome', 'ILIKE', '%' . $request->search . '%')
                  ->orWhere('email', 'ILIKE', '%' . $request->search . '%');
            });
        }

        $assinaturas = $query->orderBy('criado_em', 'desc')->paginate(50);

        return response()->json($assinaturas, 200);
    }

    /**
     * ADMIN: Criar assinatura para qualquer usuário
     * POST /api/admin/subscriptions
     */
    public function adminAssinar(Request $request)
    {
        $request->validate([
            'id_usuario' => 'required|exists:usuarios,id_usuario',
            'id_plano' => 'required|exists:planos,id_plano',
            'renova_automatico' => 'boolean',
        ]);

        // Validar: Apenas 1 assinatura ativa por usuário
        $assinaturaExistente = Assinatura::where('id_usuario', $request->id_usuario)
            ->where('status', 'ativa')
            ->first();

        if ($assinaturaExistente) {
            return response()->json([
                'message' => 'Este usuário já possui uma assinatura ativa. Cancele-a antes de criar uma nova.',
            ], 400);
        }

        // Buscar plano
        $plano = Plano::findOrFail($request->id_plano);

        if ($plano->status !== 'ativo') {
            return response()->json(['message' => 'Plano não está ativo'], 400);
        }

        // Calcular próximo vencimento
        $dataInicio = Carbon::now();
        $proximoVencimento = $this->calcularProximoVencimento($dataInicio, $plano->ciclo_cobranca);

        // Criar assinatura
        $assinatura = Assinatura::create([
            'id_usuario' => $request->id_usuario,
            'id_plano' => $plano->id_plano,
            'data_inicio' => $dataInicio->toDateString(),
            'renova_automatico' => $request->renova_automatico ?? true,
            'status' => 'ativa',
            'proximo_vencimento' => $proximoVencimento->toDateString(),
        ]);

        // Registrar evento
        EventoAssinatura::create([
            'id_assinatura' => $assinatura->id_assinatura,
            'tipo' => 'criada',
            'payload_json' => [
                'id_plano' => $plano->id_plano,
                'nome_plano' => $plano->nome,
                'preco' => $plano->preco,
                'ciclo' => $plano->ciclo_cobranca,
                'criado_por' => 'admin',
            ],
        ]);

        return response()->json([
            'data' => $assinatura->load('plano', 'usuario'),
            'message' => 'Assinatura criada com sucesso!',
        ], 201);
    }

    /**
     * ALUNO: Ver minha assinatura ativa
     * GET /api/subscriptions/me
     */
    public function minhaAssinatura()
    {
        $usuario = Auth::user();
        
        $assinatura = Assinatura::with(['plano', 'eventos'])
            ->where('id_usuario', $usuario->id_usuario)
            ->where('status', 'ativa')
            ->first();

        if (!$assinatura) {
            return response()->json([
                'message' => 'Você não possui assinatura ativa',
                'data' => null
            ], 200);
        }

        return response()->json(['data' => $assinatura], 200);
    }

    /**
     * ALUNO: Assinar um plano
     * POST /api/subscriptions
     */
    public function assinar(Request $request)
    {
        $usuario = Auth::user();

        $request->validate([
            'id_plano' => 'required|exists:planos,id_plano',
        ]);

        // Validar: Apenas 1 assinatura ativa por usuário
        $assinaturaExistente = Assinatura::where('id_usuario', $usuario->id_usuario)
            ->where('status', 'ativa')
            ->first();

        if ($assinaturaExistente) {
            return response()->json([
                'message' => 'Você já possui uma assinatura ativa. Cancele-a antes de assinar um novo plano.',
            ], 400);
        }

        // Buscar plano
        $plano = Plano::findOrFail($request->id_plano);

        if ($plano->status !== 'ativo') {
            return response()->json(['message' => 'Plano não está ativo'], 400);
        }

        // Calcular próximo vencimento
        $dataInicio = Carbon::now();
        $proximoVencimento = $this->calcularProximoVencimento($dataInicio, $plano->ciclo_cobranca);

        // Usar transação para garantir atomicidade
        DB::beginTransaction();
        try {
            // 1. Criar assinatura com status 'pendente' (aguardando pagamento)
            $assinatura = Assinatura::create([
                'id_usuario' => $usuario->id_usuario,
                'id_plano' => $plano->id_plano,
                'data_inicio' => $dataInicio->toDateString(),
                'renova_automatico' => $request->renova_automatico ?? true,
                'status' => 'pendente', // Aguardando pagamento
                'proximo_vencimento' => $proximoVencimento->toDateString(),
            ]);

            // 2. Criar cobrança
            $cobranca = $this->pagamentoService->criarCobranca(
                $usuario->id_usuario,
                'assinatura',
                $assinatura->id_assinatura,
                $plano->preco,
                "Assinatura {$plano->nome}",
                Carbon::parse($proximoVencimento)
            );

            // 3. Criar notificação de nova cobrança
            $parcela = $cobranca->parcelas->first();
            $this->notificacaoService->notificarNovaCobranca(
                $usuario->id_usuario,
                "Assinatura {$plano->nome}",
                $plano->preco,
                "/aluno/checkout/{$parcela->id_parcela}"
            );

            // 4. Registrar evento
            EventoAssinatura::create([
                'id_assinatura' => $assinatura->id_assinatura,
                'tipo' => 'criada',
                'payload_json' => [
                    'id_plano' => $plano->id_plano,
                    'nome_plano' => $plano->nome,
                    'preco' => $plano->preco,
                    'ciclo' => $plano->ciclo_cobranca,
                    'id_cobranca' => $cobranca->id_cobranca,
                ],
            ]);

            DB::commit();

            return response()->json([
                'data' => $assinatura->load('plano'),
                'cobranca' => $cobranca->load('parcelas'),
                'message' => 'Assinatura criada! Realize o pagamento para ativá-la.',
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * ALUNO: Cancelar minha assinatura
     * DELETE /api/subscriptions/me
     */
    public function cancelar()
    {
        $usuario = Auth::user();

        $assinatura = Assinatura::where('id_usuario', $usuario->id_usuario)
            ->where('status', 'ativa')
            ->first();

        if (!$assinatura) {
            return response()->json(['message' => 'Assinatura ativa não encontrada'], 404);
        }

        // Atualizar status
        $assinatura->update([
            'status' => 'cancelada',
            'data_fim' => Carbon::now()->toDateString(),
        ]);

        // Registrar evento
        EventoAssinatura::create([
            'id_assinatura' => $assinatura->id_assinatura,
            'tipo' => 'cancelada',
            'payload_json' => [
                'motivo' => 'Cancelamento solicitado pelo usuário',
                'data_cancelamento' => Carbon::now()->toDateTimeString(),
            ],
        ]);

        return response()->json([
            'message' => 'Assinatura cancelada com sucesso',
        ], 200);
    }

    /**
     * ADMIN: Atualizar assinatura (ex: renovar, mudar status)
     * PUT /api/admin/subscriptions/{id}
     */
    public function update(Request $request, int $id)
    {
        $assinatura = Assinatura::findOrFail($id);

        $request->validate([
            'status' => 'sometimes|in:ativa,pendente,cancelada,expirada',
            'data_fim' => 'sometimes|date',
            'proximo_vencimento' => 'sometimes|date',
            'renova_automatico' => 'sometimes|boolean',
        ]);

        $dadosAnteriores = $assinatura->only(['status', 'data_fim', 'proximo_vencimento']);

        $assinatura->update($request->all());

        // Registrar evento de atualização
        EventoAssinatura::create([
            'id_assinatura' => $assinatura->id_assinatura,
            'tipo' => 'renovada',
            'payload_json' => [
                'dados_anteriores' => $dadosAnteriores,
                'dados_novos' => $request->all(),
                'atualizado_por' => 'admin',
            ],
        ]);

        return response()->json([
            'data' => $assinatura->load('plano', 'usuario'),
            'message' => 'Assinatura atualizada com sucesso',
        ], 200);
    }

    /**
     * Calcular próximo vencimento baseado no ciclo
     */
    private function calcularProximoVencimento(Carbon $dataInicio, string $ciclo): Carbon
    {
        switch ($ciclo) {
            case 'mensal':
                return $dataInicio->copy()->addMonth();
            case 'trimestral':
                return $dataInicio->copy()->addMonths(3);
            case 'semestral':
                return $dataInicio->copy()->addMonths(6);
            case 'anual':
                return $dataInicio->copy()->addYear();
            default:
                return $dataInicio->copy()->addMonth(); // Default: mensal
        }
    }
}
