<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Pagamento;
use App\Models\CobrancaParcela;
use App\Models\WebhookPagamento;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class MercadoPagoWebhookController extends Controller
{
    public function handle(Request $request)
    {
        // Salvar webhook cru para auditoria
        $webhook = WebhookPagamento::create([
            'provedor' => 'mercadopago',
            'tipo_evento' => $request->input('type') ?? 'unknown',
            'id_evento_externo' => (string) ($request->input('data.id') ?? ''),
            'payload_json' => $request->all(),
            'processado' => false,
        ]);

        // Mercado Pago envia notificações de topic="merchant_order" ou "payment"
        try {
            $topic = $request->input('type') ?? $request->input('topic');
            if ($topic === 'payment' || $topic === 'merchant_order') {
                // Buscar detalhes do pagamento externo, se necessário
                $externalRef = $request->input('data.id') ?? $request->input('resource');
                // Para simplificação, usar external_reference na preferência enviada (id_parcela)
                $externalReference = $request->input('external_reference')
                    ?? ($request->input('data.external_reference') ?? null);

                if ($externalReference) {
                    /** @var CobrancaParcela $parcela */
                    $parcela = CobrancaParcela::with('cobranca')->find($externalReference);
                    if ($parcela) {
                        // Marcar pagamento como aprovado e atualizar parcela/cobrança
                        DB::transaction(function () use ($parcela) {
                            // Último pagamento pendente da parcela
                            /** @var Pagamento|null $pg */
                            $pg = $parcela->pagamentos()->where('provedor', 'mercadopago')->orderByDesc('criado_em')->first();
                            if ($pg) {
                                $pg->update(['status' => 'aprovado', 'aprovado_em' => now()]);
                            }
                            $parcela->update(['status' => 'pago', 'valor_pago' => $parcela->valor, 'pago_em' => now()]);
                            $cobranca = $parcela->cobranca;
                            $cobranca->update(['status' => 'pago', 'valor_pago' => $cobranca->valor_total]);
                        });
                    }
                }
            }
            $webhook->update(['processado' => true, 'processado_em' => now()]);
        } catch (\Throwable $e) {
            Log::error('Erro ao processar webhook MP: ' . $e->getMessage(), ['e' => $e]);
        }

        return response()->json(['status' => 'ok']);
    }
}
