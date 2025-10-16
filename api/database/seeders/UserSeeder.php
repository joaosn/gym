<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserSeeder extends Seeder
{
    public function run()
    {
        // Criar usuário administrador
        User::updateOrCreate(
            ['email' => 'admin@fitway.com'],
            [
                'nome' => 'Admin Fitway',
                'email' => 'admin@fitway.com',
                'senha_hash' => Hash::make('admin123'),
                'telefone' => '11999999999',
                'documento' => '123.456.789-00',
                'papel' => 'admin',
                'status' => 'ativo',
            ]
        );

        // Criar usuário instrutor
        User::updateOrCreate(
            ['email' => 'instrutor@fitway.com'],
            [
                'nome' => 'Instrutor João Silva',
                'email' => 'instrutor@fitway.com',
                'senha_hash' => Hash::make('instrutor123'),
                'telefone' => '11988887777',
                'documento' => '987.654.321-00',
                'papel' => 'instrutor',
                'status' => 'ativo',
            ]
        );

        // Criar usuário aluno
        User::updateOrCreate(
            ['email' => 'aluno@fitway.com'],
            [
                'nome' => 'Aluno Maria Santos',
                'email' => 'aluno@fitway.com',
                'senha_hash' => Hash::make('aluno123'),
                'telefone' => '11977776666',
                'documento' => '111.222.333-44',
                'papel' => 'aluno',
                'status' => 'ativo',
            ]
        );

        // Criar usuário instrutor adicional
        User::updateOrCreate(
            ['email' => 'instrutor2@fitway.com'],
            [
                'nome' => 'Instrutor Carlos',
                'email' => 'instrutor2@fitway.com',
                'senha_hash' => Hash::make('instrutor123'),
                'telefone' => '11966665555',
                'documento' => '222.333.444-55',
                'papel' => 'instrutor',
                'status' => 'ativo',
            ]
        );

        // Criar usuário inativo para testes
        User::updateOrCreate(
            ['email' => 'inativo@fitway.com'],
            [
                'nome' => 'Teste Aluno Inativo',
                'email' => 'inativo@fitway.com',
                'senha_hash' => Hash::make('inativo123'),
                'telefone' => '11955554444',
                'documento' => '333.444.555-66',
                'papel' => 'aluno',
                'status' => 'inativo',
            ]
        );

        $this->command->info('✅ 5 usuários criados com sucesso!');
    }
}
