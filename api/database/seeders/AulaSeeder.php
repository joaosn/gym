<?php

namespace Database\Seeders;

use App\Models\Aula;
use App\Models\HorarioAula;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AulaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Buscar IDs de instrutores e quadras existentes
        $instrutor1 = DB::table('instrutores')->where('nome', 'Carlos Silva')->first();
        $instrutor2 = DB::table('instrutores')->where('nome', 'Ana Paula Santos')->first();
        $quadra1 = DB::table('quadras')->where('nome', 'Quadra Beach Tennis 1')->first();
        $quadra2 = DB::table('quadras')->where('nome', 'Quadra Beach Tennis 2')->first();

        if (!$instrutor1 || !$quadra1) {
            $this->command->warn('⚠️ Instrutores ou Quadras não encontrados. Execute InstrutoresSeeder e QuadrasSeeder primeiro!');
            return;
        }

        // 1. Beach Tennis Iniciante
        $aula1 = Aula::create([
            'nome' => 'Beach Tennis - Iniciante',
            'esporte' => 'beach_tennis',
            'nivel' => 'iniciante',
            'duracao_min' => 60,
            'capacidade_max' => 8,
            'preco_unitario' => 80.00,
            'descricao' => 'Aula de Beach Tennis para iniciantes. Foco em fundamentos, empunhadura, posicionamento e primeiros golpes.',
            'requisitos' => 'Nenhum conhecimento prévio necessário. Traga raquete própria ou alugue na academia.',
            'status' => 'ativa',
        ]);

        // Horários: Segunda e Quarta às 18h
        HorarioAula::create([
            'id_aula' => $aula1->id_aula,
            'id_instrutor' => $instrutor1->id_instrutor,
            'id_quadra' => $quadra1->id_quadra,
            'dia_semana' => 1, // Segunda
            'hora_inicio' => '18:00',
        ]);

        HorarioAula::create([
            'id_aula' => $aula1->id_aula,
            'id_instrutor' => $instrutor1->id_instrutor,
            'id_quadra' => $quadra1->id_quadra,
            'dia_semana' => 3, // Quarta
            'hora_inicio' => '18:00',
        ]);

        // 2. Beach Tennis Intermediário
        $aula2 = Aula::create([
            'nome' => 'Beach Tennis - Intermediário',
            'esporte' => 'beach_tennis',
            'nivel' => 'intermediario',
            'duracao_min' => 90,
            'capacidade_max' => 6,
            'preco_unitario' => 120.00,
            'descricao' => 'Aula de Beach Tennis para alunos com experiência. Aprimoramento de técnicas, táticas de jogo e jogos competitivos.',
            'requisitos' => 'Mínimo 3 meses de prática. Domínio de golpes básicos (forehand, backhand, saque).',
            'status' => 'ativa',
        ]);

        // Horários: Terça e Quinta às 19h30
        HorarioAula::create([
            'id_aula' => $aula2->id_aula,
            'id_instrutor' => $instrutor2 ? $instrutor2->id_instrutor : $instrutor1->id_instrutor,
            'id_quadra' => $quadra2 ? $quadra2->id_quadra : $quadra1->id_quadra,
            'dia_semana' => 2, // Terça
            'hora_inicio' => '19:30',
        ]);

        HorarioAula::create([
            'id_aula' => $aula2->id_aula,
            'id_instrutor' => $instrutor2 ? $instrutor2->id_instrutor : $instrutor1->id_instrutor,
            'id_quadra' => $quadra2 ? $quadra2->id_quadra : $quadra1->id_quadra,
            'dia_semana' => 4, // Quinta
            'hora_inicio' => '19:30',
        ]);

        // 3. Beach Tennis Kids
        $aula3 = Aula::create([
            'nome' => 'Beach Tennis Kids (6-12 anos)',
            'esporte' => 'beach_tennis',
            'nivel' => 'iniciante',
            'duracao_min' => 45,
            'capacidade_max' => 10,
            'preco_unitario' => 60.00,
            'descricao' => 'Aula de Beach Tennis para crianças de 6 a 12 anos. Metodologia lúdica com foco em coordenação motora e diversão.',
            'requisitos' => 'Idade entre 6 e 12 anos. Autorização dos pais/responsáveis.',
            'status' => 'ativa',
        ]);

        // Horários: Sábado às 10h
        HorarioAula::create([
            'id_aula' => $aula3->id_aula,
            'id_instrutor' => $instrutor1->id_instrutor,
            'id_quadra' => $quadra1->id_quadra,
            'dia_semana' => 6, // Sábado
            'hora_inicio' => '10:00',
        ]);

        // 4. Aula de Funcional (exemplo de outro esporte)
        $aula4 = Aula::create([
            'nome' => 'Funcional Express',
            'esporte' => 'funcional',
            'nivel' => null,
            'duracao_min' => 30,
            'capacidade_max' => 15,
            'preco_unitario' => null, // Incluso no plano
            'descricao' => 'Treino funcional de alta intensidade. Trabalha força, resistência e condicionamento.',
            'requisitos' => 'Avaliação física prévia recomendada.',
            'status' => 'ativa',
        ]);

        // Horários: Segunda a Sexta às 7h (para quem quer treinar antes do trabalho)
        foreach ([1, 2, 3, 4, 5] as $dia) {
            HorarioAula::create([
                'id_aula' => $aula4->id_aula,
                'id_instrutor' => $instrutor1->id_instrutor,
                'id_quadra' => $quadra1->id_quadra, // Pode ser área externa
                'dia_semana' => $dia,
                'hora_inicio' => '07:00',
            ]);
        }

        $this->command->info('✅ Aulas e horários criados com sucesso!');
        $this->command->table(
            ['Aula', 'Esporte', 'Nível', 'Duração', 'Capacidade', 'Preço', 'Horários'],
            [
                [$aula1->nome, $aula1->esporte, $aula1->nivel, $aula1->duracao_min . ' min', $aula1->capacidade_max, 'R$ ' . number_format($aula1->preco_unitario, 2, ',', '.'), '2x/semana'],
                [$aula2->nome, $aula2->esporte, $aula2->nivel, $aula2->duracao_min . ' min', $aula2->capacidade_max, 'R$ ' . number_format($aula2->preco_unitario, 2, ',', '.'), '2x/semana'],
                [$aula3->nome, $aula3->esporte, $aula3->nivel, $aula3->duracao_min . ' min', $aula3->capacidade_max, 'R$ ' . number_format($aula3->preco_unitario, 2, ',', '.'), '1x/semana'],
                [$aula4->nome, $aula4->esporte, $aula4->nivel ?? 'Todos', $aula4->duracao_min . ' min', $aula4->capacidade_max, 'Incluso', '5x/semana'],
            ]
        );
    }
}

