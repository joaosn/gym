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
                'name' => 'Administrador Fitway',
                'email' => 'admin@fitway.com',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );

        // Criar usuário personal trainer
        User::updateOrCreate(
            ['email' => 'personal@fitway.com'],
            [
                'name' => 'Personal Trainer',
                'email' => 'personal@fitway.com',
                'password' => Hash::make('password'),
                'role' => 'personal',
                'email_verified_at' => now(),
            ]
        );

        // Criar usuário aluno
        User::updateOrCreate(
            ['email' => 'aluno@fitway.com'],
            [
                'name' => 'Aluno Teste',
                'email' => 'aluno@fitway.com',
                'password' => Hash::make('password'),
                'role' => 'aluno',
                'email_verified_at' => now(),
            ]
        );

        $this->command->info('Usuários de teste criados com sucesso!');
    }
}
