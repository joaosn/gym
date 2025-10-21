<?php

namespace Tests\Feature\Classes;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;

abstract class ClassesTestCase extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        config(['database.default' => 'sqlite']);
        config(['database.connections.sqlite.database' => ':memory:']);
        
        $this->migrateClassesSchema();
    }

    protected function migrateClassesSchema(): void
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
            $table->decimal('valor_hora', 10, 2);
            $table->enum('status', ['ativo', 'inativo', 'excluido'])->default('ativo');
            $table->timestampTz('criado_em')->useCurrent();
            $table->timestampTz('atualizado_em')->useCurrent();
        });

        // Tabela quadras
        Schema::create('quadras', function ($table) {
            $table->id('id_quadra');
            $table->string('nome');
            $table->string('esporte');
            $table->json('caracteristicas_json')->nullable();
            $table->enum('status', ['ativa', 'manutencao', 'inativa'])->default('ativa');
            $table->timestampTz('criado_em')->useCurrent();
            $table->timestampTz('atualizado_em')->useCurrent();
        });

        // Tabela aulas
        Schema::create('aulas', function ($table) {
            $table->id('id_aula');
            $table->string('nome');
            $table->text('descricao')->nullable();
            $table->string('esporte');
            $table->enum('nivel', ['iniciante', 'intermediario', 'avancado'])->default('iniciante');
            $table->integer('duracao_min');
            $table->integer('capacidade_max');
            $table->decimal('preco_unitario', 10, 2);
            $table->enum('status', ['ativa', 'inativa', 'excluida'])->default('ativa');
            $table->timestampTz('criado_em')->useCurrent();
            $table->timestampTz('atualizado_em')->useCurrent();
        });

        // Tabela horarios_aula
        Schema::create('horarios_aula', function ($table) {
            $table->id('id_horario_aula');
            $table->foreignId('id_aula')->constrained('aulas', 'id_aula')->onDelete('cascade');
            $table->foreignId('id_instrutor')->constrained('instrutores', 'id_instrutor')->onDelete('cascade');
            $table->foreignId('id_quadra')->nullable()->constrained('quadras', 'id_quadra')->onDelete('set null');
            $table->integer('dia_semana'); // 0=domingo, 6=sábado
            $table->time('hora_inicio');
            $table->timestampTz('criado_em')->useCurrent();
            $table->timestampTz('atualizado_em')->useCurrent();
        });

        // Tabela ocorrencias_aula
        Schema::create('ocorrencias_aula', function ($table) {
            $table->id('id_ocorrencia_aula');
            $table->foreignId('id_aula')->constrained('aulas', 'id_aula')->onDelete('cascade');
            $table->foreignId('id_instrutor')->constrained('instrutores', 'id_instrutor')->onDelete('cascade');
            $table->foreignId('id_quadra')->nullable()->constrained('quadras', 'id_quadra')->onDelete('set null');
            $table->timestampTz('inicio');
            $table->timestampTz('fim');
            $table->enum('status', ['agendada', 'cancelada', 'concluida'])->default('agendada');
            $table->integer('vagas_disponiveis');
            $table->timestampTz('criado_em')->useCurrent();
            $table->timestampTz('atualizado_em')->useCurrent();
        });

        // Tabela inscricoes_aula
        Schema::create('inscricoes_aula', function ($table) {
            $table->id('id_inscricao_aula');
            $table->foreignId('id_ocorrencia_aula')->constrained('ocorrencias_aula', 'id_ocorrencia_aula')->onDelete('cascade');
            $table->foreignId('id_aula')->constrained('aulas', 'id_aula')->onDelete('cascade');
            $table->foreignId('id_usuario')->constrained('usuarios', 'id_usuario')->onDelete('cascade');
            $table->enum('status', ['confirmada', 'cancelada', 'concluida'])->default('confirmada');
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

