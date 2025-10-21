<?php

namespace Tests\Feature\PersonalSessions;

use App\Models\Usuario;
use App\Models\Instrutor;
use App\Models\SessaoPersonal;
use App\Models\DisponibilidadeInstrutor;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class PersonalSessionsApiTest extends PersonalSessionsTestCase
{
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

    private function createInstrutor(Usuario $usuario, array $override = []): Instrutor
    {
        return Instrutor::create(array_merge([
            'id_usuario' => $usuario->id_usuario,
            'nome' => $usuario->nome,
            'email' => $usuario->email,
            'telefone' => '11988887777',
            'cref' => '123456-G/SP',
            'valor_hora' => 150.00,
            'status' => 'ativo',
        ], $override));
    }

    /**
     * Teste: Aluno pode criar sessão personal em horário disponível
     */
    public function test_student_can_create_personal_session_in_available_slot(): void
    {
        $aluno = $this->createUsuario(['papel' => 'aluno']);
        $personal = $this->createUsuario(['email' => 'personal@fitway.com', 'papel' => 'instrutor']);
        $instrutor = $this->createInstrutor($personal);

        // Criar disponibilidade (segunda-feira 08:00-18:00)
        DisponibilidadeInstrutor::create([
            'id_instrutor' => $instrutor->id_instrutor,
            'dia_semana' => 1, // segunda
            'hora_inicio' => '08:00:00',
            'hora_fim' => '18:00:00',
        ]);

        // Agendar sessão para próxima segunda 10:00-11:00
        $proximaSegunda = Carbon::parse('next monday 10:00:00');
        $fimSessao = $proximaSegunda->copy()->addHour();

        $response = $this->actingAs($aluno, 'sanctum')
            ->postJson('/api/personal-sessions', [
                'id_instrutor' => $instrutor->id_instrutor,
                'inicio' => $proximaSegunda->toIso8601String(),
                'fim' => $fimSessao->toIso8601String(),
            ]);

        $response->assertCreated()
            ->assertJsonStructure([
                'data' => [
                    'id_sessao_personal',
                    'id_instrutor',
                    'id_usuario',
                    'inicio',
                    'fim',
                    'preco_total',
                    'status',
                ]
            ]);

        $this->assertDatabaseHas('sessoes_personal', [
            'id_instrutor' => $instrutor->id_instrutor,
            'id_usuario' => $aluno->id_usuario,
            'status' => 'pendente',
        ]);
    }

    /**
     * Teste: Não permite sobreposição de sessões do mesmo instrutor
     */
    public function test_prevents_overlapping_sessions_for_same_instructor(): void
    {
        $aluno1 = $this->createUsuario(['email' => 'aluno1@fitway.com', 'papel' => 'aluno']);
        $aluno2 = $this->createUsuario(['email' => 'aluno2@fitway.com', 'papel' => 'aluno']);
        $personal = $this->createUsuario(['email' => 'personal@fitway.com', 'papel' => 'instrutor']);
        $instrutor = $this->createInstrutor($personal);

        // Sessão existente: segunda 10:00-11:00
        $inicio = Carbon::parse('next monday 10:00:00');
        $fim = $inicio->copy()->addHour();

        SessaoPersonal::create([
            'id_instrutor' => $instrutor->id_instrutor,
            'id_usuario' => $aluno1->id_usuario,
            'inicio' => $inicio,
            'fim' => $fim,
            'preco_total' => 150.00,
            'status' => 'confirmada',
        ]);

        // Tentar agendar sessão sobreposta: segunda 10:30-11:30
        $inicioSobreposto = Carbon::parse('next monday 10:30:00');
        $fimSobreposto = $inicioSobreposto->copy()->addHour();

        $response = $this->actingAs($aluno2, 'sanctum')
            ->postJson('/api/personal-sessions', [
                'id_instrutor' => $instrutor->id_instrutor,
                'inicio' => $inicioSobreposto->toIso8601String(),
                'fim' => $fimSobreposto->toIso8601String(),
            ]);

        $response->assertStatus(409); // Conflict
    }

    /**
     * Teste: Instrutor pode visualizar suas sessões agendadas
     */
    public function test_instructor_can_view_scheduled_sessions(): void
    {
        $aluno = $this->createUsuario(['papel' => 'aluno']);
        $personal = $this->createUsuario(['email' => 'personal@fitway.com', 'papel' => 'instrutor']);
        $instrutor = $this->createInstrutor($personal);

        // Criar 3 sessões
        $inicio = Carbon::parse('next monday 10:00:00');
        for ($i = 0; $i < 3; $i++) {
            SessaoPersonal::create([
                'id_instrutor' => $instrutor->id_instrutor,
                'id_usuario' => $aluno->id_usuario,
                'inicio' => $inicio->copy()->addDays($i),
                'fim' => $inicio->copy()->addDays($i)->addHour(),
                'preco_total' => 150.00,
                'status' => 'confirmada',
            ]);
        }

        $response = $this->actingAs($personal, 'sanctum')
            ->getJson('/api/personal-sessions/my-sessions');

        $response->assertOk()
            ->assertJsonCount(3, 'data');
    }

    /**
     * Teste: Instrutor pode confirmar sessão pendente
     */
    public function test_instructor_can_confirm_pending_session(): void
    {
        $aluno = $this->createUsuario(['papel' => 'aluno']);
        $personal = $this->createUsuario(['email' => 'personal@fitway.com', 'papel' => 'instrutor']);
        $instrutor = $this->createInstrutor($personal);

        $sessao = SessaoPersonal::create([
            'id_instrutor' => $instrutor->id_instrutor,
            'id_usuario' => $aluno->id_usuario,
            'inicio' => Carbon::parse('next monday 10:00:00'),
            'fim' => Carbon::parse('next monday 11:00:00'),
            'preco_total' => 150.00,
            'status' => 'pendente',
        ]);

        $response = $this->actingAs($personal, 'sanctum')
            ->patchJson("/api/personal-sessions/{$sessao->id_sessao_personal}/confirm");

        $response->assertOk();

        $this->assertDatabaseHas('sessoes_personal', [
            'id_sessao_personal' => $sessao->id_sessao_personal,
            'status' => 'confirmada',
        ]);
    }

    /**
     * Teste: Calcula preço baseado na duração e valor_hora do instrutor
     */
    public function test_calculates_price_based_on_duration_and_hourly_rate(): void
    {
        $aluno = $this->createUsuario(['papel' => 'aluno']);
        $personal = $this->createUsuario(['email' => 'personal@fitway.com', 'papel' => 'instrutor']);
        $instrutor = $this->createInstrutor($personal, ['valor_hora' => 200.00]);

        // Sessão de 1.5 horas (90 minutos)
        $inicio = Carbon::parse('next monday 10:00:00');
        $fim = $inicio->copy()->addMinutes(90);

        $response = $this->actingAs($aluno, 'sanctum')
            ->postJson('/api/personal-sessions', [
                'id_instrutor' => $instrutor->id_instrutor,
                'inicio' => $inicio->toIso8601String(),
                'fim' => $fim->toIso8601String(),
            ]);

        $response->assertCreated();

        // 1.5 horas * R$ 200/hora = R$ 300
        $this->assertDatabaseHas('sessoes_personal', [
            'id_instrutor' => $instrutor->id_instrutor,
            'preco_total' => 300.00,
        ]);
    }
}
