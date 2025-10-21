<?php

namespace Tests\Feature\Subscriptions;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

abstract class SubscriptionsTestCase extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Configurar SQLite in-memory
        config(['database.default' => 'sqlite']);
        config(['database.connections.sqlite.database' => ':memory:']);
        
        // Criar schema
        $this->migrateSubscriptionsSchema();
    }

    /**
     * Criar schema completo para testes de assinaturas
     */
    protected function migrateSubscriptionsSchema(): void
    {
        // Tabela usuarios
        Schema::create('usuarios', function ($table) {
            $table->id('id_usuario');
            $table->string('nome');
            $table->string('email')->unique();
            $table->string('senha_hash');
            $table->string('telefone')->nullable();
            $table->string('documento')->nullable();
            $table->date('data_nascimento')->nullable();
            $table->enum('papel', ['admin', 'aluno', 'personal', 'instrutor'])->default('aluno');
            $table->enum('status', ['ativo', 'inativo', 'excluido'])->default('ativo');
            $table->timestampTz('criado_em')->useCurrent();
            $table->timestampTz('atualizado_em')->useCurrent();
        });

        // Tabela planos
        Schema::create('planos', function ($table) {
            $table->id('id_plano');
            $table->string('nome');
            $table->text('descricao')->nullable();
            $table->decimal('preco', 10, 2);
            $table->enum('ciclo_cobranca', ['mensal', 'trimestral', 'semestral', 'anual'])->default('mensal');
            $table->integer('max_reservas_futuras')->default(4);
            $table->json('beneficios_json')->nullable();
            $table->enum('status', ['ativo', 'inativo', 'excluido'])->default('ativo');
            $table->timestampTz('criado_em')->useCurrent();
            $table->timestampTz('atualizado_em')->useCurrent();
        });

        // Tabela assinaturas
        Schema::create('assinaturas', function ($table) {
            $table->id('id_assinatura');
            $table->foreignId('id_usuario')->constrained('usuarios', 'id_usuario')->onDelete('cascade');
            $table->foreignId('id_plano')->constrained('planos', 'id_plano')->onDelete('cascade');
            $table->date('data_inicio');
            $table->date('data_fim')->nullable();
            $table->enum('status', ['ativa', 'cancelada', 'suspensa', 'expirada'])->default('ativa');
            $table->date('proximo_vencimento')->nullable();
            $table->timestampTz('criado_em')->useCurrent();
            $table->timestampTz('atualizado_em')->useCurrent();
        });

        // Tabela eventos_assinatura
        Schema::create('eventos_assinatura', function ($table) {
            $table->id('id_evento_assinatura');
            $table->foreignId('id_assinatura')->constrained('assinaturas', 'id_assinatura')->onDelete('cascade');
            $table->enum('tipo', ['criacao', 'renovacao', 'cancelamento', 'suspensao', 'reativacao']);
            $table->json('payload_json')->nullable();
            $table->timestampTz('criado_em')->useCurrent();
            $table->timestampTz('atualizado_em')->useCurrent();
        });

        // Tabela personal_access_tokens (Sanctum)
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

