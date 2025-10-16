<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class QuadrasSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $quadras = [
            [
                'nome' => 'Quadra Beach Tennis 1',
                'localizacao' => 'Área Externa - Setor A',
                'esporte' => 'beach_tennis',
                'preco_hora' => 80.00,
                'caracteristicas_json' => json_encode([
                    'cobertura' => true,
                    'iluminacao' => true,
                    'vestiario' => true,
                    'bebedouro' => true,
                    'capacidade_espectadores' => 20,
                ]),
                'status' => 'ativa',
            ],
            [
                'nome' => 'Quadra Beach Tennis 2',
                'localizacao' => 'Área Externa - Setor A',
                'esporte' => 'beach_tennis',
                'preco_hora' => 80.00,
                'caracteristicas_json' => json_encode([
                    'cobertura' => true,
                    'iluminacao' => true,
                    'vestiario' => true,
                    'bebedouro' => true,
                    'capacidade_espectadores' => 20,
                ]),
                'status' => 'ativa',
            ],
            [
                'nome' => 'Quadra Beach Tennis 3',
                'localizacao' => 'Área Externa - Setor B',
                'esporte' => 'beach_tennis',
                'preco_hora' => 75.00,
                'caracteristicas_json' => json_encode([
                    'cobertura' => false,
                    'iluminacao' => true,
                    'vestiario' => true,
                    'bebedouro' => true,
                    'capacidade_espectadores' => 15,
                ]),
                'status' => 'ativa',
            ],
            [
                'nome' => 'Quadra de Tênis',
                'localizacao' => 'Área Interna',
                'esporte' => 'tenis',
                'preco_hora' => 90.00,
                'caracteristicas_json' => json_encode([
                    'cobertura' => true,
                    'iluminacao' => true,
                    'vestiario' => true,
                    'bebedouro' => true,
                    'tipo_piso' => 'saibro',
                    'capacidade_espectadores' => 30,
                ]),
                'status' => 'ativa',
            ],
            [
                'nome' => 'Quadra Poliesportiva',
                'localizacao' => 'Ginásio Principal',
                'esporte' => 'futsal',
                'preco_hora' => 120.00,
                'caracteristicas_json' => json_encode([
                    'cobertura' => true,
                    'iluminacao' => true,
                    'vestiario' => true,
                    'bebedouro' => true,
                    'tipo_piso' => 'madeira',
                    'marcacoes' => ['futsal', 'volei', 'basquete'],
                    'capacidade_espectadores' => 100,
                ]),
                'status' => 'ativa',
            ],
            [
                'nome' => 'Quadra Beach Tennis VIP',
                'localizacao' => 'Área Premium',
                'esporte' => 'beach_tennis',
                'preco_hora' => 150.00,
                'caracteristicas_json' => json_encode([
                    'cobertura' => true,
                    'iluminacao' => 'LED profissional',
                    'vestiario' => true,
                    'bebedouro' => true,
                    'ar_condicionado_vestiario' => true,
                    'som_ambiente' => true,
                    'wifi' => true,
                    'capacidade_espectadores' => 50,
                ]),
                'status' => 'ativa',
            ],
            [
                'nome' => 'Quadra de Manutenção',
                'localizacao' => 'Área Externa - Setor C',
                'esporte' => 'beach_tennis',
                'preco_hora' => 80.00,
                'caracteristicas_json' => json_encode([
                    'cobertura' => true,
                    'iluminacao' => false,
                    'vestiario' => true,
                    'bebedouro' => true,
                ]),
                'status' => 'inativa',
            ],
        ];

        foreach ($quadras as $quadra) {
            // Verificar se já existe
            $exists = DB::table('quadras')->where('nome', $quadra['nome'])->exists();
            
            if (!$exists) {
                DB::table('quadras')->insert(array_merge($quadra, [
                    'criado_em' => now(),
                    'atualizado_em' => now(),
                ]));
                
                echo "✅ Quadra criada: {$quadra['nome']}\n";
            } else {
                echo "⚠️ Quadra já existe: {$quadra['nome']}\n";
            }
        }

        echo "\n✅ Seeder de Quadras concluído!\n";
    }
}
