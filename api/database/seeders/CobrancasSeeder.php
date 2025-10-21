<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Cobranca;
use App\Models\CobrancaParcela;
use App\Models\Pagamento;
use App\Models\SessaoPersonal;
use App\Models\ReservaQuadra;
use App\Models\Assinatura;
use Carbon\Carbon;

class CobrancasSeeder extends Seeder
{
    public function run(): void
    {
        // Criar cobranças para sessões personal existentes
        $sessoes = SessaoPersonal::whereIn('status', ['pendente', 'confirmada'])
            ->take(5)
            ->get();

        foreach ($sessoes as $sessao) {
            $cobranca = Cobranca::create([
                'id_usuario' => $sessao->id_usuario,
                'referencia_tipo' => 'sessao_personal',
                'referencia_id' => $sessao->id_sessao_personal,
                'valor_total' => $sessao->preco_total,
                'valor_pago' => $sessao->status === 'confirmada' ? $sessao->preco_total : 0,
                'moeda' => 'BRL',
                'status' => $sessao->status === 'confirmada' ? 'pago' : 'pendente',
                'descricao' => "Sessão Personal - {$sessao->inicio->format('d/m/Y H:i')}",
                'vencimento' => $sessao->inicio->subDay(),
            ]);

            $parcela = CobrancaParcela::create([
                'id_cobranca' => $cobranca->id_cobranca,
                'numero_parcela' => 1,
                'total_parcelas' => 1,
                'valor' => $cobranca->valor_total,
                'valor_pago' => $cobranca->valor_pago,
                'status' => $sessao->status === 'confirmada' ? 'pago' : 'pendente',
                'vencimento' => $cobranca->vencimento,
                'pago_em' => $sessao->status === 'confirmada' ? now() : null,
            ]);

            // Se já pago, criar pagamento aprovado
            if ($sessao->status === 'confirmada') {
                Pagamento::create([
                    'id_parcela' => $parcela->id_parcela,
                    'provedor' => 'simulacao',
                    'metodo' => 'pix',
                    'valor' => $parcela->valor,
                    'status' => 'aprovado',
                    'aprovado_em' => now(),
                    'payload_json' => ['tipo' => 'simulacao', 'aprovado_automaticamente' => true],
                ]);
            }
        }

        // Criar cobranças para reservas de quadra
        $reservas = ReservaQuadra::whereIn('status', ['pendente', 'confirmada'])
            ->take(5)
            ->get();

        foreach ($reservas as $reserva) {
            $cobranca = Cobranca::create([
                'id_usuario' => $reserva->id_usuario,
                'referencia_tipo' => 'reserva_quadra',
                'referencia_id' => $reserva->id_reserva_quadra,
                'valor_total' => $reserva->preco_total,
                'valor_pago' => $reserva->status === 'confirmada' ? $reserva->preco_total : 0,
                'moeda' => 'BRL',
                'status' => $reserva->status === 'confirmada' ? 'pago' : 'pendente',
                'descricao' => "Reserva de Quadra - {$reserva->inicio->format('d/m/Y H:i')}",
                'vencimento' => $reserva->inicio->subDay(),
            ]);

            $parcela = CobrancaParcela::create([
                'id_cobranca' => $cobranca->id_cobranca,
                'numero_parcela' => 1,
                'total_parcelas' => 1,
                'valor' => $cobranca->valor_total,
                'valor_pago' => $cobranca->valor_pago,
                'status' => $reserva->status === 'confirmada' ? 'pago' : 'pendente',
                'vencimento' => $cobranca->vencimento,
                'pago_em' => $reserva->status === 'confirmada' ? now() : null,
            ]);

            if ($reserva->status === 'confirmada') {
                Pagamento::create([
                    'id_parcela' => $parcela->id_parcela,
                    'provedor' => 'simulacao',
                    'metodo' => 'pix',
                    'valor' => $parcela->valor,
                    'status' => 'aprovado',
                    'aprovado_em' => now(),
                    'payload_json' => ['tipo' => 'simulacao', 'aprovado_automaticamente' => true],
                ]);
            }
        }

        // Criar cobranças para assinaturas
        $assinaturas = Assinatura::whereIn('status', ['ativa', 'pendente'])
            ->with('plano')
            ->take(3)
            ->get();

        foreach ($assinaturas as $assinatura) {
            $cobranca = Cobranca::create([
                'id_usuario' => $assinatura->id_usuario,
                'referencia_tipo' => 'assinatura',
                'referencia_id' => $assinatura->id_assinatura,
                'valor_total' => $assinatura->plano->preco,
                'valor_pago' => $assinatura->status === 'ativa' ? $assinatura->plano->preco : 0,
                'moeda' => 'BRL',
                'status' => $assinatura->status === 'ativa' ? 'pago' : 'pendente',
                'descricao' => "Assinatura {$assinatura->plano->nome}",
                'vencimento' => $assinatura->proximo_vencimento ?? now()->addMonth(),
            ]);

            $parcela = CobrancaParcela::create([
                'id_cobranca' => $cobranca->id_cobranca,
                'numero_parcela' => 1,
                'total_parcelas' => 1,
                'valor' => $cobranca->valor_total,
                'valor_pago' => $cobranca->valor_pago,
                'status' => $assinatura->status === 'ativa' ? 'pago' : 'pendente',
                'vencimento' => $cobranca->vencimento,
                'pago_em' => $assinatura->status === 'ativa' ? now() : null,
            ]);

            if ($assinatura->status === 'ativa') {
                Pagamento::create([
                    'id_parcela' => $parcela->id_parcela,
                    'provedor' => 'simulacao',
                    'metodo' => 'pix',
                    'valor' => $parcela->valor,
                    'status' => 'aprovado',
                    'aprovado_em' => now(),
                    'payload_json' => ['tipo' => 'simulacao', 'aprovado_automaticamente' => true],
                ]);
            }
        }

        $this->command->info('✅ Cobranças criadas com sucesso!');
        $this->command->info('📊 Total de cobranças: ' . Cobranca::count());
        $this->command->info('💰 Cobranças pendentes: ' . Cobranca::where('status', 'pendente')->count());
        $this->command->info('✅ Cobranças pagas: ' . Cobranca::where('status', 'pago')->count());
    }
}
