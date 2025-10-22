<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class TestUsersSeeder extends Seeder
{
    /**
     * Criar usuários de teste simples para desenvolvimento
     */
    public function run(): void
    {
        // 1. ADMIN
        DB::table('usuarios')->updateOrInsert(
            ['email' => 'admin@fitway.com'],
            [
                'nome' => 'Admin Fitway',
                'email' => 'admin@fitway.com',
                'senha_hash' => Hash::make('123456'),
                'telefone' => '44999999999',
                'documento' => '11111111111',
                'data_nascimento' => '1990-01-01',
                'papel' => 'admin',
                'status' => 'ativo',
                'criado_em' => now(),
                'atualizado_em' => now(),
            ]
        );

        // 2. ALUNO
        DB::table('usuarios')->updateOrInsert(
            ['email' => 'aluno@fitway.com'],
            [
                'nome' => 'Aluno Teste',
                'email' => 'aluno@fitway.com',
                'senha_hash' => Hash::make('123456'),
                'telefone' => '44988888888',
                'documento' => '22222222222',
                'data_nascimento' => '1995-05-15',
                'papel' => 'aluno',
                'status' => 'ativo',
                'criado_em' => now(),
                'atualizado_em' => now(),
            ]
        );

        // 3. INSTRUTOR
        $instrutor = DB::table('usuarios')->updateOrInsert(
            ['email' => 'personal@fitway.com'],
            [
                'nome' => 'Personal Teste',
                'email' => 'personal@fitway.com',
                'senha_hash' => Hash::make('123456'),
                'telefone' => '44977777777',
                'documento' => '33333333333',
                'data_nascimento' => '1988-03-20',
                'papel' => 'instrutor',
                'status' => 'ativo',
                'criado_em' => now(),
                'atualizado_em' => now(),
            ]
        );

        // Buscar ID do instrutor
        $instrutorUserId = DB::table('usuarios')->where('email', 'personal@fitway.com')->value('id_usuario');

        // Criar registro de instrutor vinculado
        DB::table('instrutores')->updateOrInsert(
            ['email' => 'personal@fitway.com'],
            [
                'id_usuario' => $instrutorUserId,
                'nome' => 'Personal Teste',
                'email' => 'personal@fitway.com',
                'telefone' => '44977777777',
                'cref' => '012345-G/PR',
                'valor_hora' => 100.00,
                'especialidades_json' => json_encode(['Beach Tennis', 'Funcional', 'Musculação']),
                'status' => 'ativo',
                'criado_em' => now(),
                'atualizado_em' => now(),
            ]
        );

        $this->command->info('✅ Usuários de teste criados com sucesso!');
        $this->command->info('');
        $this->command->info('📧 Login como ADMIN:');
        $this->command->info('   Email: admin@fitway.com');
        $this->command->info('   Senha: 123456');
        $this->command->info('');
        $this->command->info('📧 Login como ALUNO:');
        $this->command->info('   Email: aluno@fitway.com');
        $this->command->info('   Senha: 123456');
        $this->command->info('');
        $this->command->info('📧 Login como PERSONAL:');
        $this->command->info('   Email: personal@fitway.com');
        $this->command->info('   Senha: 123456');
        $this->command->info('');
    }
}
