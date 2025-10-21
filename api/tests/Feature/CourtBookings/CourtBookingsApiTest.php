<?php

namespace Tests\Feature\CourtBookings;

use App\Models\Usuario;
use App\Models\Quadra;
use App\Models\ReservaQuadra;
use App\Models\BloqueioQuadra;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class CourtBookingsApiTest extends CourtBookingsTestCase
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

    private function createQuadra(array $override = []): Quadra
    {
        return Quadra::create(array_merge([
            'nome' => 'Quadra Beach Tennis 1',
            'localizacao' => 'Área Externa',
            'esporte' => 'Beach Tennis',
            'preco_hora' => 80.00,
            'status' => 'ativa',
        ], $override));
    }

    /**
     * Teste: Aluno pode criar reserva em quadra disponível
     */
    public function test_student_can_create_booking_for_available_court(): void
    {
        $aluno = $this->createUsuario();
        $quadra = $this->createQuadra();

        $inicio = Carbon::now()->addDays(1)->setTime(10, 0);
        $fim = $inicio->copy()->addHours(2);

        $response = $this->actingAs($aluno, 'sanctum')
            ->postJson('/api/court-bookings', [
                'id_quadra' => $quadra->id_quadra,
                'inicio' => $inicio->toIso8601String(),
                'fim' => $fim->toIso8601String(),
            ]);

        $response->assertCreated()
            ->assertJsonStructure([
                'data' => [
                    'id_reserva_quadra',
                    'id_quadra',
                    'id_usuario',
                    'inicio',
                    'fim',
                    'preco_total',
                    'status',
                ]
            ]);

        // Preço: 2 horas * R$ 80 = R$ 160
        $this->assertDatabaseHas('reservas_quadra', [
            'id_quadra' => $quadra->id_quadra,
            'id_usuario' => $aluno->id_usuario,
            'preco_total' => 160.00,
            'status' => 'pendente',
        ]);
    }

    /**
     * Teste: Não permite sobreposição de reservas na mesma quadra
     */
    public function test_prevents_overlapping_bookings_for_same_court(): void
    {
        $aluno1 = $this->createUsuario(['email' => 'aluno1@fitway.com']);
        $aluno2 = $this->createUsuario(['email' => 'aluno2@fitway.com']);
        $quadra = $this->createQuadra();

        // Reserva existente: amanhã 10:00-12:00
        $inicio = Carbon::now()->addDays(1)->setTime(10, 0);
        $fim = $inicio->copy()->addHours(2);

        ReservaQuadra::create([
            'id_quadra' => $quadra->id_quadra,
            'id_usuario' => $aluno1->id_usuario,
            'inicio' => $inicio,
            'fim' => $fim,
            'preco_total' => 160.00,
            'status' => 'confirmada',
        ]);

        // Tentar reservar: amanhã 11:00-13:00 (sobrepõe)
        $inicioSobreposto = Carbon::now()->addDays(1)->setTime(11, 0);
        $fimSobreposto = $inicioSobreposto->copy()->addHours(2);

        $response = $this->actingAs($aluno2, 'sanctum')
            ->postJson('/api/court-bookings', [
                'id_quadra' => $quadra->id_quadra,
                'inicio' => $inicioSobreposto->toIso8601String(),
                'fim' => $fimSobreposto->toIso8601String(),
            ]);

        $response->assertStatus(409); // Conflict
    }

    /**
     * Teste: Admin pode bloquear quadra para manutenção
     */
    public function test_admin_can_block_court_for_maintenance(): void
    {
        $admin = $this->createUsuario(['email' => 'admin@fitway.com', 'papel' => 'admin']);
        $quadra = $this->createQuadra();

        $inicio = Carbon::now()->addDays(1)->setTime(8, 0);
        $fim = $inicio->copy()->addHours(4);

        $response = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/admin/court-blocks', [
                'id_quadra' => $quadra->id_quadra,
                'inicio' => $inicio->toIso8601String(),
                'fim' => $fim->toIso8601String(),
                'motivo' => 'Manutenção preventiva',
            ]);

        $response->assertCreated();

        $this->assertDatabaseHas('bloqueios_quadra', [
            'id_quadra' => $quadra->id_quadra,
            'motivo' => 'Manutenção preventiva',
        ]);
    }

    /**
     * Teste: Não permite reservar quadra em período bloqueado
     */
    public function test_cannot_book_court_during_blocked_period(): void
    {
        $aluno = $this->createUsuario();
        $quadra = $this->createQuadra();

        // Bloquear amanhã 10:00-14:00
        $inicioBloqueio = Carbon::now()->addDays(1)->setTime(10, 0);
        $fimBloqueio = $inicioBloqueio->copy()->addHours(4);

        BloqueioQuadra::create([
            'id_quadra' => $quadra->id_quadra,
            'inicio' => $inicioBloqueio,
            'fim' => $fimBloqueio,
            'motivo' => 'Manutenção',
        ]);

        // Tentar reservar amanhã 11:00-12:00 (dentro do bloqueio)
        $inicioReserva = Carbon::now()->addDays(1)->setTime(11, 0);
        $fimReserva = $inicioReserva->copy()->addHour();

        $response = $this->actingAs($aluno, 'sanctum')
            ->postJson('/api/court-bookings', [
                'id_quadra' => $quadra->id_quadra,
                'inicio' => $inicioReserva->toIso8601String(),
                'fim' => $fimReserva->toIso8601String(),
            ]);

        $response->assertStatus(409);
    }

    /**
     * Teste: Aluno pode cancelar sua própria reserva
     */
    public function test_student_can_cancel_own_booking(): void
    {
        $aluno = $this->createUsuario();
        $quadra = $this->createQuadra();

        $reserva = ReservaQuadra::create([
            'id_quadra' => $quadra->id_quadra,
            'id_usuario' => $aluno->id_usuario,
            'inicio' => Carbon::now()->addDays(1)->setTime(10, 0),
            'fim' => Carbon::now()->addDays(1)->setTime(12, 0),
            'preco_total' => 160.00,
            'status' => 'pendente',
        ]);

        $response = $this->actingAs($aluno, 'sanctum')
            ->patchJson("/api/court-bookings/{$reserva->id_reserva_quadra}/cancel");

        $response->assertOk();

        $this->assertDatabaseHas('reservas_quadra', [
            'id_reserva_quadra' => $reserva->id_reserva_quadra,
            'status' => 'cancelada',
        ]);
    }

    /**
     * Teste: Admin pode confirmar reserva pendente
     */
    public function test_admin_can_confirm_pending_booking(): void
    {
        $admin = $this->createUsuario(['email' => 'admin@fitway.com', 'papel' => 'admin']);
        $aluno = $this->createUsuario(['email' => 'aluno@fitway.com']);
        $quadra = $this->createQuadra();

        $reserva = ReservaQuadra::create([
            'id_quadra' => $quadra->id_quadra,
            'id_usuario' => $aluno->id_usuario,
            'inicio' => Carbon::now()->addDays(1)->setTime(10, 0),
            'fim' => Carbon::now()->addDays(1)->setTime(12, 0),
            'preco_total' => 160.00,
            'status' => 'pendente',
        ]);

        $response = $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/admin/court-bookings/{$reserva->id_reserva_quadra}/confirm");

        $response->assertOk();

        $this->assertDatabaseHas('reservas_quadra', [
            'id_reserva_quadra' => $reserva->id_reserva_quadra,
            'status' => 'confirmada',
        ]);
    }

    /**
     * Teste: Valida horário mínimo de reserva (não pode ser no passado)
     */
    public function test_validates_booking_must_be_in_future(): void
    {
        $aluno = $this->createUsuario();
        $quadra = $this->createQuadra();

        // Tentar reservar no passado
        $inicio = Carbon::now()->subHours(2);
        $fim = $inicio->copy()->addHour();

        $response = $this->actingAs($aluno, 'sanctum')
            ->postJson('/api/court-bookings', [
                'id_quadra' => $quadra->id_quadra,
                'inicio' => $inicio->toIso8601String(),
                'fim' => $fim->toIso8601String(),
            ]);

        $response->assertStatus(422); // Validation error
    }
}
