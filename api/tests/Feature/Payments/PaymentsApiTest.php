<?php

namespace Tests\Feature\Payments;

use App\Models\Cobranca;
use App\Models\CobrancaParcela;
use App\Models\Pagamento;
use App\Models\Usuario;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;

class PaymentsApiTest extends PaymentsTestCase
{
    protected function createUsuario(string $role = 'aluno', array $overrides = []): Usuario
    {
        $defaults = [
            'nome' => Str::title($role) . ' User',
            'email' => Str::uuid() . '@example.test',
            'senha_hash' => Hash::make('password'),
            'papel' => $role,
            'status' => 'ativo',
        ];

        return Usuario::create(array_merge($defaults, $overrides));
    }

    public function test_admin_can_create_manual_charge(): void
    {
        $admin = $this->createUsuario('admin');
        $student = $this->createUsuario('aluno');

        Sanctum::actingAs($admin, ['*']);

        $payload = [
            'id_usuario' => $student->id_usuario,
            'referencia_tipo' => 'manual',
            'valor_total' => 150.75,
            'descricao' => 'Mensalidade Outubro',
            'vencimento' => now()->addDay()->toDateString(),
            'observacoes' => 'Cobrança criada para testes',
        ];

        $response = $this->postJson('/api/admin/payments', $payload);

        $response->assertCreated()
            ->assertJsonPath('data.id_usuario', $student->id_usuario)
            ->assertJsonPath('data.referencia_tipo', 'manual')
            ->assertJsonPath('data.valor_total', '150.75');

        $this->assertDatabaseHas('cobrancas', [
            'id_usuario' => $student->id_usuario,
            'referencia_tipo' => 'manual',
            'descricao' => 'Mensalidade Outubro',
            'valor_total' => '150.75',
        ]);

        $this->assertDatabaseHas('cobranca_parcelas', [
            'valor' => '150.75',
            'status' => 'pendente',
        ]);
    }

    public function test_admin_requires_reference_id_for_linked_charges(): void
    {
        $admin = $this->createUsuario('admin');
        $student = $this->createUsuario('aluno');

        Sanctum::actingAs($admin, ['*']);

        $response = $this->postJson('/api/admin/payments', [
            'id_usuario' => $student->id_usuario,
            'referencia_tipo' => 'assinatura',
            'valor_total' => 99.90,
            'descricao' => 'Plano mensal',
            'vencimento' => now()->addDay()->toDateString(),
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('errors.referencia_id.0', 'referencia_id é obrigatório para este tipo');
    }

    public function test_student_can_simulate_and_approve_payment(): void
    {
        $student = $this->createUsuario('aluno');

        Sanctum::actingAs($student, ['*']);

        $chargeResponse = $this->postJson('/api/payments/create-charge', [
            'descricao' => 'Aula experimental',
            'valor' => 120,
            'vencimento' => now()->addDay()->toDateString(),
            'observacoes' => 'Cobrança manual para simulação',
        ]);

        $chargeResponse->assertCreated();

        $parcelaId = $chargeResponse->json('data.parcelas.0.id_parcela');
        $this->assertNotNull($parcelaId);

        $checkoutResponse = $this->postJson("/api/payments/checkout/{$parcelaId}");
        $checkoutResponse->assertCreated()
            ->assertJsonPath('data.provedor', 'simulacao')
            ->assertJsonPath('data.status', 'pendente');

        $paymentId = $checkoutResponse->json('data.id_pagamento');

        $this->assertDatabaseHas('pagamentos', [
            'id_pagamento' => $paymentId,
            'status' => 'pendente',
            'provedor' => 'simulacao',
        ]);

        $approveResponse = $this->postJson("/api/payments/{$paymentId}/approve");

        $approveResponse->assertOk()
            ->assertJsonPath('data.status', 'aprovado');

        $this->assertDatabaseHas('pagamentos', [
            'id_pagamento' => $paymentId,
            'status' => 'aprovado',
        ]);

        $this->assertDatabaseHas('cobranca_parcelas', [
            'id_parcela' => $parcelaId,
            'status' => 'pago',
            'valor_pago' => '120.00',
        ]);

        $this->assertDatabaseHas('cobrancas', [
            'id_cobranca' => $chargeResponse->json('data.id_cobranca'),
            'status' => 'pago',
            'valor_pago' => '120.00',
        ]);
    }

    public function test_webhook_updates_payment_status(): void
    {
        $student = $this->createUsuario('aluno');

        $cobranca = Cobranca::create([
            'id_usuario' => $student->id_usuario,
            'referencia_tipo' => 'manual',
            'referencia_id' => null,
            'valor_total' => '200.00',
            'valor_pago' => '0.00',
            'moeda' => 'BRL',
            'status' => 'pendente',
            'descricao' => 'Cobrança com MP',
            'vencimento' => now()->toDateString(),
        ]);

        $parcela = CobrancaParcela::create([
            'id_cobranca' => $cobranca->id_cobranca,
            'numero_parcela' => 1,
            'total_parcelas' => 1,
            'valor' => '200.00',
            'valor_pago' => '0.00',
            'status' => 'pendente',
            'vencimento' => now()->toDateString(),
        ]);

        $pagamento = Pagamento::create([
            'id_parcela' => $parcela->id_parcela,
            'provedor' => 'mercadopago',
            'metodo' => 'pix',
            'valor' => '200.00',
            'status' => 'pendente',
            'url_checkout' => 'https://mp.test/checkout',
        ]);

        Sanctum::actingAs($student, ['*']); // webhook route is inside auth group

        $webhookPayload = [
            'type' => 'payment',
            'data' => [
                'id' => '123456',
                'external_reference' => (string) $parcela->id_parcela,
            ],
        ];

        $response = $this->postJson('/api/webhooks/mercadopago', $webhookPayload);

        $response->assertOk()->assertJson(['status' => 'ok']);

        $this->assertDatabaseHas('pagamentos', [
            'id_pagamento' => $pagamento->id_pagamento,
            'status' => 'aprovado',
        ]);

        $this->assertDatabaseHas('cobranca_parcelas', [
            'id_parcela' => $parcela->id_parcela,
            'status' => 'pago',
            'valor_pago' => '200.00',
        ]);

        $this->assertDatabaseHas('cobrancas', [
            'id_cobranca' => $cobranca->id_cobranca,
            'status' => 'pago',
            'valor_pago' => '200.00',
        ]);

        $this->assertDatabaseHas('webhooks_pagamento', [
            'id_evento_externo' => '123456',
            'processado' => true,
        ]);
    }
}
