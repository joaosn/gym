<?php

namespace Tests\Feature\Payments;

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

abstract class PaymentsTestCase extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Use isolated sqlite database for faster payment tests
        config()->set('database.default', 'sqlite');
        config()->set('database.connections.sqlite.database', ':memory:');

        DB::purge('sqlite');
        DB::reconnect('sqlite');

        $this->migratePaymentsSchema();
    }

    protected function migratePaymentsSchema(): void
    {
        Schema::dropIfExists('webhooks_pagamento');
        Schema::dropIfExists('pagamentos');
        Schema::dropIfExists('cobranca_parcelas');
        Schema::dropIfExists('cobrancas');
        Schema::dropIfExists('notificacoes');
        Schema::dropIfExists('usuarios');
        Schema::dropIfExists('personal_access_tokens');

        Schema::create('usuarios', function (Blueprint $table) {
            $table->bigIncrements('id_usuario');
            $table->string('nome');
            $table->string('email')->unique();
            $table->string('senha_hash');
            $table->string('telefone')->nullable();
            $table->string('documento')->nullable();
            $table->date('data_nascimento')->nullable();
            $table->string('papel');
            $table->string('status')->default('ativo');
            $table->timestamp('criado_em')->useCurrent();
            $table->timestamp('atualizado_em')->useCurrent()->useCurrentOnUpdate();
        });

        Schema::create('cobrancas', function (Blueprint $table) {
            $table->bigIncrements('id_cobranca');
            $table->unsignedBigInteger('id_usuario');
            $table->string('referencia_tipo');
            $table->unsignedBigInteger('referencia_id')->nullable();
            $table->decimal('valor_total', 12, 2);
            $table->decimal('valor_pago', 12, 2)->default(0);
            $table->string('moeda')->default('BRL');
            $table->string('status')->default('pendente');
            $table->string('descricao');
            $table->date('vencimento');
            $table->text('observacoes')->nullable();
            $table->timestamp('criado_em')->useCurrent();
            $table->timestamp('atualizado_em')->useCurrent()->useCurrentOnUpdate();

            $table->foreign('id_usuario')
                ->references('id_usuario')
                ->on('usuarios')
                ->onDelete('cascade');
        });

        Schema::create('cobranca_parcelas', function (Blueprint $table) {
            $table->bigIncrements('id_parcela');
            $table->unsignedBigInteger('id_cobranca');
            $table->integer('numero_parcela')->default(1);
            $table->integer('total_parcelas')->default(1);
            $table->decimal('valor', 12, 2);
            $table->decimal('valor_pago', 12, 2)->default(0);
            $table->string('status')->default('pendente');
            $table->date('vencimento');
            $table->timestamp('pago_em')->nullable();
            $table->timestamp('criado_em')->useCurrent();
            $table->timestamp('atualizado_em')->useCurrent()->useCurrentOnUpdate();

            $table->foreign('id_cobranca')
                ->references('id_cobranca')
                ->on('cobrancas')
                ->onDelete('cascade');
        });

        Schema::create('pagamentos', function (Blueprint $table) {
            $table->bigIncrements('id_pagamento');
            $table->unsignedBigInteger('id_parcela');
            $table->string('provedor');
            $table->string('metodo')->nullable();
            $table->string('id_transacao_ext')->nullable();
            $table->string('id_pagamento_ext')->nullable();
            $table->decimal('valor', 12, 2);
            $table->string('status')->default('pendente');
            $table->string('url_checkout')->nullable();
            $table->text('qr_code')->nullable();
            $table->json('payload_json')->nullable();
            $table->text('erro_mensagem')->nullable();
            $table->timestamp('aprovado_em')->nullable();
            $table->timestamp('expirado_em')->nullable();
            $table->timestamp('criado_em')->useCurrent();
            $table->timestamp('atualizado_em')->useCurrent()->useCurrentOnUpdate();

            $table->foreign('id_parcela')
                ->references('id_parcela')
                ->on('cobranca_parcelas')
                ->onDelete('cascade');
        });

        Schema::create('webhooks_pagamento', function (Blueprint $table) {
            $table->bigIncrements('id_webhook');
            $table->unsignedBigInteger('id_pagamento')->nullable();
            $table->string('provedor');
            $table->string('tipo_evento')->nullable();
            $table->string('id_evento_externo')->nullable();
            $table->json('payload_json')->nullable();
            $table->boolean('processado')->default(false);
            $table->timestamp('processado_em')->nullable();
            $table->timestamp('criado_em')->useCurrent();

            $table->foreign('id_pagamento')
                ->references('id_pagamento')
                ->on('pagamentos')
                ->onDelete('cascade');
        });

        Schema::create('notificacoes', function (Blueprint $table) {
            $table->bigIncrements('id_notificacao');
            $table->unsignedBigInteger('id_usuario');
            $table->string('tipo');
            $table->string('titulo');
            $table->text('mensagem');
            $table->boolean('lida')->default(false);
            $table->timestamp('data_leitura')->nullable();
            $table->string('link')->nullable();
            $table->timestamp('criado_em')->useCurrent();

            $table->foreign('id_usuario')
                ->references('id_usuario')
                ->on('usuarios')
                ->onDelete('cascade');
        });

        Schema::create('personal_access_tokens', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('tokenable_type');
            $table->unsignedBigInteger('tokenable_id');
            $table->string('name');
            $table->string('token', 64)->unique();
            $table->text('abilities')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });
    }
}

