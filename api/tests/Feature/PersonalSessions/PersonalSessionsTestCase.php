<?php

namespace Tests\Feature\PersonalSessions;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;

abstract class PersonalSessionsTestCase extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        config(['database.default' => 'sqlite']);
        config(['database.connections.sqlite.database' => ':memory:']);
        
        $this->migratePersonalSessionsSchema();
    }

    protected function migratePersonalSessionsSchema(): void
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

        // Tabela instrutores
        Schema::create('instrutores', function ($table) {
            $table->id('id_instrutor');
            $table->foreignId('id_usuario')->constrained('usuarios', 'id_usuario')->onDelete('cascade');
            $table->string('nome');
            $table->string('email');
            $table->string('telefone')->nullable();
            $table->string('cref')->nullable();
            $table->decimal('valor_hora', 10, 2);
            $table->json('especialidades_json')->nullable();
            $table->enum('status', ['ativo', 'inativo', 'excluido'])->default('ativo');
            $table->timestampTz('criado_em')->useCurrent();
            $table->timestampTz('atualizado_em')->useCurrent();
        });

        // Tabela disponibilidade_instrutor
        Schema::create('disponibilidade_instrutor', function ($table) {
            $table->id('id_disponibilidade');
            $table->foreignId('id_instrutor')->constrained('instrutores', 'id_instrutor')->onDelete('cascade');
            $table->integer('dia_semana'); // 0=domingo, 6=sábado
            $table->time('hora_inicio');
            $table->time('hora_fim');
            $table->timestampTz('criado_em')->useCurrent();
            $table->timestampTz('atualizado_em')->useCurrent();
        });

        // Tabela sessoes_personal
        Schema::create('sessoes_personal', function ($table) {
            $table->id('id_sessao_personal');
            $table->foreignId('id_instrutor')->constrained('instrutores', 'id_instrutor')->onDelete('cascade');
            $table->foreignId('id_usuario')->constrained('usuarios', 'id_usuario')->onDelete('cascade');
            $table->timestampTz('inicio');
            $table->timestampTz('fim');
            $table->decimal('preco_total', 10, 2);
            $table->enum('status', ['pendente', 'confirmada', 'cancelada', 'concluida'])->default('pendente');
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

