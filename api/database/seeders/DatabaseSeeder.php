<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            // Usuários primeiro (dependência de outros seeders)
            UserSeeder::class,
            
            // Cadastros básicos
            PlanosSeeder::class,
            QuadrasSeeder::class,
            InstrutoresSeeder::class,
            
            // Dados relacionados (dependem dos cadastros acima)
            AulaSeeder::class,
            AssinaturasSeeder::class,
            ReservaQuadraSeeder::class,
            SessaoPersonalSeeder::class,
            CobrancasSeeder::class,
        ]);
    }
}
