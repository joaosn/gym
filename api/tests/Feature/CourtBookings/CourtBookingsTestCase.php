<?php

namespace Tests\Feature\CourtBookings;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;

abstract class CourtBookingsTestCase extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        config(['database.default' => 'sqlite']);
        config(['database.connections.sqlite.database' => ':memory:']);
        
        $this->migrateCourtBookingsSchema();
    }

    protected function migrateCourtBookingsSchema(): void
    {
        // Tabela usuarios
        Schema::create('usuarios', function ($table) {
            $table->id('id_usuario');
            $table->string('nome');
            $table->string('email')->unique();
            $table->string('senha_hash');
            $table->enum('papel', ['admin', 'aluno', 'personal', 'instrutor'])->default('aluno');
            $table->enum('status', ['ativo', 'inativo', 'excluido'])->default('ativo');
            $table->timestampTz('criado_em')->useCurrent();
            $table->timestampTz('atualizado_em')->useCurrent();
        });

        // Tabela quadras
        Schema::create('quadras', function ($table) {
            $table->id('id_quadra');
            $table->string('nome');
            $table->string('localizacao')->nullable();
            $table->string('esporte');
            $table->decimal('preco_hora', 10, 2);
            $table->json('caracteristicas_json')->nullable();
            $table->enum('status', ['ativa', 'manutencao', 'inativa'])->default('ativa');
            $table->timestampTz('criado_em')->useCurrent();
            $table->timestampTz('atualizado_em')->useCurrent();
        });

        // Tabela reservas_quadra
        Schema::create('reservas_quadra', function ($table) {
            $table->id('id_reserva_quadra');
            $table->foreignId('id_quadra')->constrained('quadras', 'id_quadra')->onDelete('cascade');
            $table->foreignId('id_usuario')->constrained('usuarios', 'id_usuario')->onDelete('cascade');
            $table->timestampTz('inicio');
            $table->timestampTz('fim');
            $table->decimal('preco_total', 10, 2);
            $table->enum('status', ['pendente', 'confirmada', 'cancelada'])->default('pendente');
            $table->timestampTz('criado_em')->useCurrent();
            $table->timestampTz('atualizado_em')->useCurrent();
        });

        // Tabela bloqueios_quadra
        Schema::create('bloqueios_quadra', function ($table) {
            $table->id('id_bloqueio_quadra');
            $table->foreignId('id_quadra')->constrained('quadras', 'id_quadra')->onDelete('cascade');
            $table->timestampTz('inicio');
            $table->timestampTz('fim');
            $table->string('motivo');
            $table->timestampTz('criado_em')->useCurrent();
            $table->timestampTz('atualizado_em')->useCurrent();
        });

        // Tabela personal_access_tokens
        Schema::create('personal_access_tokens', function ($table) {
            $table->id();
            $table->morphs('tokenable');
            $table->string('name');
            $table->string('token', 64)->unique();
            $table->text('abilities')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });
    }
}

