<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PlanosSeeder extends Seeder
{
    public function run(): void
    {
        $planos = [
            [
                'nome' => 'Plano Básico',
                'preco' => 99.90,
                'ciclo_cobranca' => 'mensal',
                'max_reservas_futuras' => 2,
                'beneficios_json' => json_encode([
                    'Acesso a todas as quadras',
                    'Até 2 reservas futuras',
                    'Desconto de 10% em aulas',
                    'Suporte via WhatsApp',
                ]),
                'status' => 'ativo',
                'criado_em' => now(),
                'atualizado_em' => now(),
            ],
            [
                'nome' => 'Plano Premium',
                'preco' => 149.90,
                'ciclo_cobranca' => 'mensal',
                'max_reservas_futuras' => 5,
                'beneficios_json' => json_encode([
                    'Acesso ilimitado a todas as quadras',
                    'Até 5 reservas futuras',
                    'Desconto de 20% em aulas',
                    '1 aula gratuita por mês',
                    'Prioridade no agendamento',
                    'Suporte via WhatsApp e telefone',
                ]),
                'status' => 'ativo',
                'criado_em' => now(),
                'atualizado_em' => now(),
            ],
            [
                'nome' => 'Plano VIP',
                'preco' => 249.90,
                'ciclo_cobranca' => 'mensal',
                'max_reservas_futuras' => 10,
                'beneficios_json' => json_encode([
                    'Acesso VIP a todas as quadras',
                    'Até 10 reservas futuras',
                    '50% de desconto em todas as aulas',
                    '2 sessões de personal trainer por mês',
                    'Acesso a quadras premium',
                    'Prioridade máxima no agendamento',
                    'Suporte 24/7',
                    'Armário exclusivo',
                ]),
                'status' => 'ativo',
                'criado_em' => now(),
                'atualizado_em' => now(),
            ],
            [
                'nome' => 'Plano Trimestral Premium',
                'preco' => 399.90,
                'ciclo_cobranca' => 'trimestral',
                'max_reservas_futuras' => 5,
                'beneficios_json' => json_encode([
                    'Todos os benefícios do Plano Premium',
                    'Economia de R$ 49,80 em 3 meses',
                    '1 mês grátis de estacionamento',
                    'Desconto de 20% em aulas',
                ]),
                'status' => 'ativo',
                'criado_em' => now(),
                'atualizado_em' => now(),
            ],
            [
                'nome' => 'Plano Anual VIP',
                'preco' => 2499.90,
                'ciclo_cobranca' => 'anual',
                'max_reservas_futuras' => 15,
                'beneficios_json' => json_encode([
                    'Todos os benefícios do Plano VIP',
                    'Economia de R$ 499,00 no ano',
                    '2 meses grátis de estacionamento',
                    '1 raquete profissional de brinde',
                    'Assessoria nutricional trimestral',
                    'Acesso a eventos exclusivos',
                ]),
                'status' => 'ativo',
                'criado_em' => now(),
                'atualizado_em' => now(),
            ],
        ];

        foreach ($planos as $plano) {
            DB::table('planos')->insert($plano);
            echo "✅ Plano criado: {$plano['nome']}\n";
        }

        echo "\n✅ Total de planos criados: " . count($planos) . "\n";
    }
}
