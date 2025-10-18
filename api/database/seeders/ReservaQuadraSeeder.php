<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReservaQuadraSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Buscar IDs necessários
        $quadra1 = DB::table('quadras')->where('nome', 'Quadra Beach Tennis 1')->first();
        $quadra2 = DB::table('quadras')->where('nome', 'Quadra Beach Tennis 2')->first();
        $aluno = DB::table('usuarios')->where('email', 'aluno@fitway.com')->first();
        
        if (!$quadra1 || !$quadra2 || !$aluno) {
            $this->command->error('❌ Quadras ou aluno não encontrados. Execute QuadraSeeder e UserSeeder primeiro.');
            return;
        }

        $reservas = [
            // Reservas futuras (próximos 7 dias)
            [
                'id_quadra' => $quadra1->id_quadra,
                'id_usuario' => $aluno->id_usuario,
                'inicio' => Carbon::now()->addDays(1)->setTime(10, 0),
                'fim' => Carbon::now()->addDays(1)->setTime(11, 0),
                'preco_total' => 80.00,
                'status' => 'confirmada',
                'observacoes' => 'Reserva para treino de saque',
            ],
            [
                'id_quadra' => $quadra1->id_quadra,
                'id_usuario' => $aluno->id_usuario,
                'inicio' => Carbon::now()->addDays(2)->setTime(15, 0),
                'fim' => Carbon::now()->addDays(2)->setTime(16, 30),
                'preco_total' => 120.00,
                'status' => 'pendente',
                'observacoes' => 'Aguardando confirmação',
            ],
            [
                'id_quadra' => $quadra2->id_quadra,
                'id_usuario' => $aluno->id_usuario,
                'inicio' => Carbon::now()->addDays(3)->setTime(9, 0),
                'fim' => Carbon::now()->addDays(3)->setTime(10, 0),
                'preco_total' => 70.00,
                'status' => 'confirmada',
                'observacoes' => null,
            ],
            [
                'id_quadra' => $quadra2->id_quadra,
                'id_usuario' => $aluno->id_usuario,
                'inicio' => Carbon::now()->addDays(5)->setTime(18, 0),
                'fim' => Carbon::now()->addDays(5)->setTime(19, 30),
                'preco_total' => 105.00,
                'status' => 'confirmada',
                'observacoes' => 'Reserva para jogo amistoso',
            ],
            [
                'id_quadra' => $quadra1->id_quadra,
                'id_usuario' => $aluno->id_usuario,
                'inicio' => Carbon::now()->addDays(7)->setTime(16, 0),
                'fim' => Carbon::now()->addDays(7)->setTime(18, 0),
                'preco_total' => 160.00,
                'status' => 'pendente',
                'observacoes' => 'Reserva de 2 horas para torneio interno',
            ],

            // Reservas passadas (últimos 30 dias)
            [
                'id_quadra' => $quadra1->id_quadra,
                'id_usuario' => $aluno->id_usuario,
                'inicio' => Carbon::now()->subDays(2)->setTime(10, 0),
                'fim' => Carbon::now()->subDays(2)->setTime(11, 0),
                'preco_total' => 80.00,
                'status' => 'concluida',
                'observacoes' => 'Treino realizado',
            ],
            [
                'id_quadra' => $quadra2->id_quadra,
                'id_usuario' => $aluno->id_usuario,
                'inicio' => Carbon::now()->subDays(5)->setTime(14, 0),
                'fim' => Carbon::now()->subDays(5)->setTime(15, 30),
                'preco_total' => 105.00,
                'status' => 'concluida',
                'observacoes' => null,
            ],
            [
                'id_quadra' => $quadra1->id_quadra,
                'id_usuario' => $aluno->id_usuario,
                'inicio' => Carbon::now()->subDays(10)->setTime(16, 0),
                'fim' => Carbon::now()->subDays(10)->setTime(17, 0),
                'preco_total' => 80.00,
                'status' => 'cancelada',
                'observacoes' => 'Cancelada pelo cliente',
            ],
            [
                'id_quadra' => $quadra2->id_quadra,
                'id_usuario' => $aluno->id_usuario,
                'inicio' => Carbon::now()->subDays(15)->setTime(11, 0),
                'fim' => Carbon::now()->subDays(15)->setTime(12, 0),
                'preco_total' => 70.00,
                'status' => 'no_show',
                'observacoes' => 'Cliente não compareceu',
            ],
            [
                'id_quadra' => $quadra1->id_quadra,
                'id_usuario' => $aluno->id_usuario,
                'inicio' => Carbon::now()->subDays(20)->setTime(9, 0),
                'fim' => Carbon::now()->subDays(20)->setTime(10, 30),
                'preco_total' => 120.00,
                'status' => 'concluida',
                'observacoes' => 'Ótima partida',
            ],
            [
                'id_quadra' => $quadra2->id_quadra,
                'id_usuario' => $aluno->id_usuario,
                'inicio' => Carbon::now()->subDays(25)->setTime(17, 0),
                'fim' => Carbon::now()->subDays(25)->setTime(18, 0),
                'preco_total' => 70.00,
                'status' => 'concluida',
                'observacoes' => null,
            ],
            [
                'id_quadra' => $quadra1->id_quadra,
                'id_usuario' => $aluno->id_usuario,
                'inicio' => Carbon::now()->subDays(30)->setTime(15, 0),
                'fim' => Carbon::now()->subDays(30)->setTime(16, 0),
                'preco_total' => 80.00,
                'status' => 'concluida',
                'observacoes' => 'Primeiro treino do mês',
            ],
        ];

        $agora = Carbon::now();
        foreach ($reservas as $reserva) {
            DB::table('reservas_quadra')->insert([
                'id_quadra' => $reserva['id_quadra'],
                'id_usuario' => $reserva['id_usuario'],
                'inicio' => $reserva['inicio'],
                'fim' => $reserva['fim'],
                'preco_total' => $reserva['preco_total'],
                'status' => $reserva['status'],
                'observacoes' => $reserva['observacoes'],
                'criado_em' => $agora,
                'atualizado_em' => $agora,
            ]);
        }

        $this->command->info('✅ 12 reservas de quadra criadas com sucesso!');
    }
}
