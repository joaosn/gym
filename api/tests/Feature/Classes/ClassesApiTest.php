<?php

namespace Tests\Feature\Classes;

use App\Models\Usuario;
use App\Models\Instrutor;
use App\Models\Quadra;
use App\Models\Aula;
use App\Models\HorarioAula;
use App\Models\OcorrenciaAula;
use App\Models\InscricaoAula;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class ClassesApiTest extends ClassesTestCase
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

    private function createInstrutor(Usuario $usuario): Instrutor
    {
        return Instrutor::create([
            'id_usuario' => $usuario->id_usuario,
            'nome' => $usuario->nome,
            'email' => $usuario->email,
            'valor_hora' => 150.00,
            'status' => 'ativo',
        ]);
    }

    private function createQuadra(): Quadra
    {
        return Quadra::create([
            'nome' => 'Quadra Beach Tennis 1',
            'esporte' => 'Beach Tennis',
            'status' => 'ativa',
        ]);
    }

    private function createAula(array $override = []): Aula
    {
        return Aula::create(array_merge([
            'nome' => 'Beach Tennis Iniciante',
            'descricao' => 'Aula para iniciantes',
            'esporte' => 'Beach Tennis',
            'nivel' => 'iniciante',
            'duracao_min' => 60,
            'capacidade_max' => 10,
            'preco_unitario' => 50.00,
            'status' => 'ativa',
        ], $override));
    }

    /**
     * Teste: Admin pode criar aula em grupo
     */
    public function test_admin_can_create_group_class(): void
    {
        $admin = $this->createUsuario(['email' => 'admin@fitway.com', 'papel' => 'admin']);

        $response = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/admin/classes', [
                'nome' => 'Beach Tennis Avançado',
                'descricao' => 'Aula para jogadores experientes',
                'esporte' => 'Beach Tennis',
                'nivel' => 'avancado',
                'duracao_min' => 90,
                'capacidade_max' => 8,
                'preco_unitario' => 75.00,
            ]);

        $response->assertCreated()
            ->assertJsonStructure([
                'data' => [
                    'id_aula',
                    'nome',
                    'nivel',
                    'capacidade_max',
                ]
            ]);

        $this->assertDatabaseHas('aulas', [
            'nome' => 'Beach Tennis Avançado',
            'nivel' => 'avancado',
            'capacidade_max' => 8,
        ]);
    }

    /**
     * Teste: Admin pode criar horário semanal para aula
     */
    public function test_admin_can_create_weekly_schedule_for_class(): void
    {
        $admin = $this->createUsuario(['email' => 'admin@fitway.com', 'papel' => 'admin']);
        $instrutor = $this->createInstrutor($this->createUsuario(['email' => 'inst@fitway.com', 'papel' => 'instrutor']));
        $quadra = $this->createQuadra();
        $aula = $this->createAula();

        $response = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/admin/class-schedules', [
                'id_aula' => $aula->id_aula,
                'id_instrutor' => $instrutor->id_instrutor,
                'id_quadra' => $quadra->id_quadra,
                'dia_semana' => 1, // Segunda
                'hora_inicio' => '10:00:00',
            ]);

        $response->assertCreated();

        $this->assertDatabaseHas('horarios_aula', [
            'id_aula' => $aula->id_aula,
            'dia_semana' => 1,
            'hora_inicio' => '10:00:00',
        ]);
    }

    /**
     * Teste: Sistema gera ocorrências baseadas nos horários semanais
     */
    public function test_system_generates_occurrences_from_weekly_schedule(): void
    {
        $admin = $this->createUsuario(['email' => 'admin@fitway.com', 'papel' => 'admin']);
        $instrutor = $this->createInstrutor($this->createUsuario(['email' => 'inst@fitway.com', 'papel' => 'instrutor']));
        $quadra = $this->createQuadra();
        $aula = $this->createAula(['duracao_min' => 60]);

        // Criar horário semanal
        HorarioAula::create([
            'id_aula' => $aula->id_aula,
            'id_instrutor' => $instrutor->id_instrutor,
            'id_quadra' => $quadra->id_quadra,
            'dia_semana' => 1, // Segunda
            'hora_inicio' => '10:00:00',
        ]);

        // Comando para gerar ocorrências das próximas 4 semanas
        $response = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/admin/class-occurrences/generate', [
                'id_aula' => $aula->id_aula,
                'weeks' => 4,
            ]);

        $response->assertCreated();

        // Deve ter criado 4 ocorrências (uma por semana)
        $this->assertEquals(4, OcorrenciaAula::where('id_aula', $aula->id_aula)->count());
    }

    /**
     * Teste: Aluno pode se inscrever em ocorrência com vagas disponíveis
     */
    public function test_student_can_enroll_in_occurrence_with_available_slots(): void
    {
        $aluno = $this->createUsuario(['papel' => 'aluno']);
        $instrutor = $this->createInstrutor($this->createUsuario(['email' => 'inst@fitway.com', 'papel' => 'instrutor']));
        $quadra = $this->createQuadra();
        $aula = $this->createAula(['capacidade_max' => 10]);

        // Criar ocorrência futura
        $inicio = Carbon::parse('next monday 10:00:00');
        $ocorrencia = OcorrenciaAula::create([
            'id_aula' => $aula->id_aula,
            'id_instrutor' => $instrutor->id_instrutor,
            'id_quadra' => $quadra->id_quadra,
            'inicio' => $inicio,
            'fim' => $inicio->copy()->addMinutes($aula->duracao_min),
            'status' => 'agendada',
            'vagas_disponiveis' => 10,
        ]);

        $response = $this->actingAs($aluno, 'sanctum')
            ->postJson('/api/class-enrollments', [
                'id_ocorrencia_aula' => $ocorrencia->id_ocorrencia_aula,
            ]);

        $response->assertCreated();

        $this->assertDatabaseHas('inscricoes_aula', [
            'id_ocorrencia_aula' => $ocorrencia->id_ocorrencia_aula,
            'id_usuario' => $aluno->id_usuario,
            'status' => 'confirmada',
        ]);

        // Vagas devem diminuir
        $ocorrencia->refresh();
        $this->assertEquals(9, $ocorrencia->vagas_disponiveis);
    }

    /**
     * Teste: Não permite inscrição quando não há vagas
     */
    public function test_prevents_enrollment_when_no_slots_available(): void
    {
        $aluno = $this->createUsuario(['papel' => 'aluno']);
        $instrutor = $this->createInstrutor($this->createUsuario(['email' => 'inst@fitway.com', 'papel' => 'instrutor']));
        $quadra = $this->createQuadra();
        $aula = $this->createAula();

        $inicio = Carbon::parse('next monday 10:00:00');
        $ocorrencia = OcorrenciaAula::create([
            'id_aula' => $aula->id_aula,
            'id_instrutor' => $instrutor->id_instrutor,
            'id_quadra' => $quadra->id_quadra,
            'inicio' => $inicio,
            'fim' => $inicio->copy()->addMinutes($aula->duracao_min),
            'status' => 'agendada',
            'vagas_disponiveis' => 0, // SEM VAGAS
        ]);

        $response = $this->actingAs($aluno, 'sanctum')
            ->postJson('/api/class-enrollments', [
                'id_ocorrencia_aula' => $ocorrencia->id_ocorrencia_aula,
            ]);

        $response->assertStatus(409); // Conflict
    }

    /**
     * Teste: Aluno pode cancelar inscrição
     */
    public function test_student_can_cancel_enrollment(): void
    {
        $aluno = $this->createUsuario(['papel' => 'aluno']);
        $instrutor = $this->createInstrutor($this->createUsuario(['email' => 'inst@fitway.com', 'papel' => 'instrutor']));
        $quadra = $this->createQuadra();
        $aula = $this->createAula();

        $inicio = Carbon::parse('next monday 10:00:00');
        $ocorrencia = OcorrenciaAula::create([
            'id_aula' => $aula->id_aula,
            'id_instrutor' => $instrutor->id_instrutor,
            'id_quadra' => $quadra->id_quadra,
            'inicio' => $inicio,
            'fim' => $inicio->copy()->addMinutes($aula->duracao_min),
            'status' => 'agendada',
            'vagas_disponiveis' => 9,
        ]);

        $inscricao = InscricaoAula::create([
            'id_ocorrencia_aula' => $ocorrencia->id_ocorrencia_aula,
            'id_aula' => $aula->id_aula,
            'id_usuario' => $aluno->id_usuario,
            'status' => 'confirmada',
        ]);

        $response = $this->actingAs($aluno, 'sanctum')
            ->patchJson("/api/class-enrollments/{$inscricao->id_inscricao_aula}/cancel");

        $response->assertOk();

        $this->assertDatabaseHas('inscricoes_aula', [
            'id_inscricao_aula' => $inscricao->id_inscricao_aula,
            'status' => 'cancelada',
        ]);

        // Vagas devem voltar
        $ocorrencia->refresh();
        $this->assertEquals(10, $ocorrencia->vagas_disponiveis);
    }

    /**
     * Teste: Instrutor pode visualizar suas aulas agendadas
     */
    public function test_instructor_can_view_scheduled_classes(): void
    {
        $instrutor_usuario = $this->createUsuario(['email' => 'inst@fitway.com', 'papel' => 'instrutor']);
        $instrutor = $this->createInstrutor($instrutor_usuario);
        $quadra = $this->createQuadra();
        $aula = $this->createAula();

        // Criar 3 ocorrências
        $inicio = Carbon::parse('next monday 10:00:00');
        for ($i = 0; $i < 3; $i++) {
            OcorrenciaAula::create([
                'id_aula' => $aula->id_aula,
                'id_instrutor' => $instrutor->id_instrutor,
                'id_quadra' => $quadra->id_quadra,
                'inicio' => $inicio->copy()->addWeeks($i),
                'fim' => $inicio->copy()->addWeeks($i)->addHour(),
                'status' => 'agendada',
                'vagas_disponiveis' => 10,
            ]);
        }

        $response = $this->actingAs($instrutor_usuario, 'sanctum')
            ->getJson('/api/instructor/my-classes');

        $response->assertOk()
            ->assertJsonCount(3, 'data');
    }
}
