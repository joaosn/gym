<?php

namespace Tests\Feature\Subscriptions;

use App\Models\Usuario;
use App\Models\Plano;
use App\Models\Assinatura;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class SubscriptionsApiTest extends SubscriptionsTestCase
{
    /**
     * Helper: Criar usuário de teste
     */
    private function createUsuario(array $override = []): Usuario
    {
        return Usuario::create(array_merge([
            'nome' => 'Test User',
            'email' => 'test@example.com',
            'senha_hash' => Hash::make('password'),
            'papel' => 'aluno',
            'status' => 'ativo',
        ], $override));
    }

    /**
     * Helper: Criar plano de teste
     */
    private function createPlano(array $override = []): Plano
    {
        return Plano::create(array_merge([
            'nome' => 'Plano Básico',
            'descricao' => 'Plano básico de testes',
            'preco' => 99.90,
            'ciclo_cobranca' => 'mensal',
            'max_reservas_futuras' => 4,
            'status' => 'ativo',
        ], $override));
    }

    /**
     * Teste: Admin pode criar assinatura para usuário
     */
    public function test_admin_can_create_subscription_for_user(): void
    {
        $admin = $this->createUsuario(['email' => 'admin@fitway.com', 'papel' => 'admin']);
        $aluno = $this->createUsuario(['email' => 'aluno@fitway.com', 'papel' => 'aluno']);
        $plano = $this->createPlano();

        $response = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/admin/subscriptions', [
                'id_usuario' => $aluno->id_usuario,
                'id_plano' => $plano->id_plano,
                'data_inicio' => Carbon::now()->format('Y-m-d'),
            ]);

        $response->assertCreated()
            ->assertJsonStructure([
                'data' => [
                    'id_assinatura',
                    'id_usuario',
                    'id_plano',
                    'status',
                    'data_inicio',
                ]
            ]);

        $this->assertDatabaseHas('assinaturas', [
            'id_usuario' => $aluno->id_usuario,
            'id_plano' => $plano->id_plano,
            'status' => 'ativa',
        ]);
    }

    /**
     * Teste: Aluno pode visualizar sua assinatura ativa
     */
    public function test_student_can_view_active_subscription(): void
    {
        $aluno = $this->createUsuario(['papel' => 'aluno']);
        $plano = $this->createPlano();
        
        $assinatura = Assinatura::create([
            'id_usuario' => $aluno->id_usuario,
            'id_plano' => $plano->id_plano,
            'data_inicio' => Carbon::now(),
            'proximo_vencimento' => Carbon::now()->addMonth(),
            'status' => 'ativa',
        ]);

        $response = $this->actingAs($aluno, 'sanctum')
            ->getJson('/api/subscriptions/active');

        $response->assertOk()
            ->assertJson([
                'data' => [
                    'id_assinatura' => $assinatura->id_assinatura,
                    'status' => 'ativa',
                ]
            ]);
    }

    /**
     * Teste: Não permite criar assinatura com plano inativo
     */
    public function test_cannot_create_subscription_with_inactive_plan(): void
    {
        $admin = $this->createUsuario(['email' => 'admin@fitway.com', 'papel' => 'admin']);
        $aluno = $this->createUsuario(['email' => 'aluno@fitway.com', 'papel' => 'aluno']);
        $plano = $this->createPlano(['status' => 'inativo']);

        $response = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/admin/subscriptions', [
                'id_usuario' => $aluno->id_usuario,
                'id_plano' => $plano->id_plano,
                'data_inicio' => Carbon::now()->format('Y-m-d'),
            ]);

        $response->assertStatus(422);
    }

    /**
     * Teste: Admin pode cancelar assinatura
     */
    public function test_admin_can_cancel_subscription(): void
    {
        $admin = $this->createUsuario(['email' => 'admin@fitway.com', 'papel' => 'admin']);
        $aluno = $this->createUsuario(['email' => 'aluno@fitway.com', 'papel' => 'aluno']);
        $plano = $this->createPlano();
        
        $assinatura = Assinatura::create([
            'id_usuario' => $aluno->id_usuario,
            'id_plano' => $plano->id_plano,
            'data_inicio' => Carbon::now(),
            'status' => 'ativa',
        ]);

        $response = $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/admin/subscriptions/{$assinatura->id_assinatura}/cancel");

        $response->assertOk();

        $this->assertDatabaseHas('assinaturas', [
            'id_assinatura' => $assinatura->id_assinatura,
            'status' => 'cancelada',
        ]);
    }

    /**
     * Teste: Sistema registra eventos de assinatura
     */
    public function test_system_logs_subscription_events(): void
    {
        $admin = $this->createUsuario(['email' => 'admin@fitway.com', 'papel' => 'admin']);
        $aluno = $this->createUsuario(['email' => 'aluno@fitway.com', 'papel' => 'aluno']);
        $plano = $this->createPlano();

        $response = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/admin/subscriptions', [
                'id_usuario' => $aluno->id_usuario,
                'id_plano' => $plano->id_plano,
                'data_inicio' => Carbon::now()->format('Y-m-d'),
            ]);

        $response->assertCreated();

        $this->assertDatabaseHas('eventos_assinatura', [
            'tipo' => 'criacao',
        ]);
    }
}
