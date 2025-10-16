<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class InstrutoresSeeder extends Seeder
{
    /**
     * Seed 3 instrutores com disponibilidades
     */
    public function run(): void
    {
        // Limpar dados existentes
        DB::table('disponibilidade_instrutor')->delete();
        DB::table('instrutores')->delete();
        
        // Instrutor 1: Personal de Musculação (vinculado ao user 'personal')
        $instrutor1 = DB::table('instrutores')->insertGetId([
            'id_usuario' => DB::table('usuarios')->where('email', 'personal@fitway.com')->value('id_usuario'),
            'nome' => 'Carlos Silva',
            'email' => 'personal@fitway.com',
            'telefone' => '11987654321',
            'cref' => '123456-G/SP',
            'valor_hora' => 150.00,
            'especialidades_json' => json_encode(['Musculação', 'Hipertrofia', 'Emagrecimento']),
            'bio' => 'Personal trainer especializado em treino de força e hipertrofia. 10 anos de experiência.',
            'status' => 'ativo',
            'criado_em' => now(),
            'atualizado_em' => now(),
        ], 'id_instrutor');
        
        // Disponibilidade Instrutor 1 (Segunda a Sexta, 6h-12h)
        foreach ([1, 2, 3, 4, 5] as $dia) {
            DB::table('disponibilidade_instrutor')->insert([
                'id_instrutor' => $instrutor1,
                'dia_semana' => $dia,
                'hora_inicio' => '06:00:00',
                'hora_fim' => '12:00:00',
                'disponivel' => true,
            ]);
        }
        
        // Instrutor 2: Instrutora de Yoga (sem usuário vinculado)
        $instrutor2 = DB::table('instrutores')->insertGetId([
            'id_usuario' => null,
            'nome' => 'Ana Paula Santos',
            'email' => 'ana.yoga@fitway.com',
            'telefone' => '11976543210',
            'cref' => '654321-G/SP',
            'valor_hora' => 120.00,
            'especialidades_json' => json_encode(['Yoga', 'Pilates', 'Alongamento']),
            'bio' => 'Instrutora de yoga e pilates certificada. Especialista em bem-estar e flexibilidade.',
            'status' => 'ativo',
            'criado_em' => now(),
            'atualizado_em' => now(),
        ], 'id_instrutor');
        
        // Disponibilidade Instrutor 2 (Terça, Quinta, Sábado - 7h-11h)
        foreach ([2, 4, 6] as $dia) {
            DB::table('disponibilidade_instrutor')->insert([
                'id_instrutor' => $instrutor2,
                'dia_semana' => $dia,
                'hora_inicio' => '07:00:00',
                'hora_fim' => '11:00:00',
                'disponivel' => true,
            ]);
        }
        
        // Instrutor 3: Personal de CrossFit (vinculado ao user 'instrutor')
        $instrutor3 = DB::table('instrutores')->insertGetId([
            'id_usuario' => DB::table('usuarios')->where('email', 'instrutor@fitway.com')->value('id_usuario'),
            'nome' => 'João Oliveira',
            'email' => 'instrutor@fitway.com',
            'telefone' => '11965432109',
            'cref' => '789012-G/SP',
            'valor_hora' => 180.00,
            'especialidades_json' => json_encode(['CrossFit', 'Funcional', 'HIIT']),
            'bio' => 'Coach de CrossFit certificado. Treinos de alta intensidade para atletas de alto desempenho.',
            'status' => 'ativo',
            'criado_em' => now(),
            'atualizado_em' => now(),
        ], 'id_instrutor');
        
        // Disponibilidade Instrutor 3 (Segunda, Quarta, Sexta - 14h-20h)
        foreach ([1, 3, 5] as $dia) {
            DB::table('disponibilidade_instrutor')->insert([
                'id_instrutor' => $instrutor3,
                'dia_semana' => $dia,
                'hora_inicio' => '14:00:00',
                'hora_fim' => '20:00:00',
                'disponivel' => true,
            ]);
        }
        
        // Instrutor 4: Inativo (para testes de filtro)
        $instrutor4 = DB::table('instrutores')->insertGetId([
            'id_usuario' => null,
            'nome' => 'Maria Costa',
            'email' => 'maria.natacao@fitway.com',
            'telefone' => '11954321098',
            'cref' => '456789-G/SP',
            'valor_hora' => 100.00,
            'especialidades_json' => json_encode(['Natação', 'Hidroginástica']),
            'bio' => 'Instrutora de natação. Atualmente inativa.',
            'status' => 'inativo',
            'criado_em' => now(),
            'atualizado_em' => now(),
        ], 'id_instrutor');
        
        $this->command->info('✅ 4 instrutores criados com disponibilidades!');
    }
}
