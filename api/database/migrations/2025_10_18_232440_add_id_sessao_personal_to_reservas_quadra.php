<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('reservas_quadra', function (Blueprint $table) {
            // Adicionar FK opcional para sessões personal
            // Quando uma sessão personal usa uma quadra, deve criar uma reserva automaticamente
            $table->unsignedBigInteger('id_sessao_personal')->nullable()->after('id_usuario');
            
            $table->foreign('id_sessao_personal')
                  ->references('id_sessao_personal')
                  ->on('sessoes_personal')
                  ->onDelete('cascade'); // Se sessão for deletada, reserva também é
            
            $table->index('id_sessao_personal');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reservas_quadra', function (Blueprint $table) {
            $table->dropForeign(['id_sessao_personal']);
            $table->dropIndex(['id_sessao_personal']);
            $table->dropColumn('id_sessao_personal');
        });
    }
};
