<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Usuario;
use Illuminate\Support\Facades\Hash;

class UsuariosSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Limpar usuários existentes (apenas para desenvolvimento)
        Usuario::truncate();

        $usuarios = [
            [
                'nome' => 'Admin Fitway',
                'email' => 'admin@fitway.com',
                'senha_hash' => Hash::make('admin123'),
                'telefone' => '11999999999',
                'documento' => '123.456.789-00',
                'papel' => 'admin',
                'status' => 'ativo',
            ],
            [
                'nome' => 'Personal João Silva',
                'email' => 'personal@fitway.com',
                'senha_hash' => Hash::make('personal123'),
                'telefone' => '11988888888',
                'documento' => '987.654.321-00',
                'papel' => 'personal',
                'status' => 'ativo',
            ],
            [
                'nome' => 'Aluno Maria Santos',
                'email' => 'aluno@fitway.com',
                'senha_hash' => Hash::make('aluno123'),
                'telefone' => '11977777777',
                'documento' => '456.789.123-00',
                'papel' => 'aluno',
                'status' => 'ativo',
            ],
            [
                'nome' => 'Instrutor Carlos',
                'email' => 'instrutor@fitway.com',
                'senha_hash' => Hash::make('instrutor123'),
                'telefone' => '11966666666',
                'documento' => '789.123.456-00',
                'papel' => 'instrutor',
                'status' => 'ativo',
            ],
            [
                'nome' => 'Teste Aluno Inativo',
                'email' => 'inativo@fitway.com',
                'senha_hash' => Hash::make('inativo123'),
                'telefone' => '11955555555',
                'papel' => 'aluno',
                'status' => 'inativo',
            ],
        ];

        foreach ($usuarios as $usuario) {
            Usuario::create($usuario);
            $this->command->info("✅ Usuário criado: {$usuario['email']} ({$usuario['papel']})");
        }

        $this->command->info('');
        $this->command->info('🎉 Seeders de usuários executados com sucesso!');
        $this->command->info('');
        $this->command->info('📝 Credenciais de teste:');
        $this->command->info('   Admin:      admin@fitway.com / admin123');
        $this->command->info('   Personal:   personal@fitway.com / personal123');
        $this->command->info('   Aluno:      aluno@fitway.com / aluno123');
        $this->command->info('   Instrutor:  instrutor@fitway.com / instrutor123');
    }
}
