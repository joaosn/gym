<?php

namespace Database\Seeders;

use App\Models\Assinatura;
use App\Models\EventoAssinatura;
use App\Models\Usuario;
use App\Models\Plano;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class AssinaturasSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Buscar alunos e planos existentes
        $alunos = Usuario::where('papel', 'aluno')
            ->where('status', 'ativo')
            ->limit(15) // Vamos criar 15 assinaturas
            ->get();

        $planos = Plano::where('status', 'ativo')->get();

        if ($alunos->isEmpty()) {
            $this->command->warn('⚠️  Nenhum aluno encontrado. Execute AlunosFakesSeeder primeiro!');
            return;
        }

        if ($planos->isEmpty()) {
            $this->command->warn('⚠️  Nenhum plano encontrado. Execute PlanosSeeder primeiro!');
            return;
        }

        $this->command->info('🔄 Criando assinaturas...');

        $assinaturasCriadas = 0;

        foreach ($alunos as $aluno) {
            // Escolher plano aleatório
            $plano = $planos->random();

            // Definir status (80% ativas, 10% canceladas, 10% expiradas)
            $rand = rand(1, 10);
            if ($rand <= 8) {
                $status = 'ativa';
                $dataInicio = Carbon::now()->subMonths(rand(0, 3));
                $dataFim = null;
            } elseif ($rand == 9) {
                $status = 'cancelada';
                $dataInicio = Carbon::now()->subMonths(rand(3, 6));
                $dataFim = Carbon::now()->subDays(rand(1, 30));
            } else {
                $status = 'expirada';
                $dataInicio = Carbon::now()->subMonths(rand(6, 12));
                $dataFim = Carbon::now()->subDays(rand(30, 90));
            }

            // Calcular próximo vencimento
            $proximoVencimento = $this->calcularProximoVencimento($dataInicio, $plano->ciclo_cobranca);

            // Criar assinatura
            $assinatura = Assinatura::create([
                'id_usuario' => $aluno->id_usuario,
                'id_plano' => $plano->id_plano,
                'data_inicio' => $dataInicio->toDateString(),
                'data_fim' => $dataFim?->toDateString(),
                'renova_automatico' => rand(0, 1) == 1,
                'status' => $status,
                'proximo_vencimento' => $status === 'ativa' ? $proximoVencimento->toDateString() : null,
            ]);

            // Criar evento de criação
            EventoAssinatura::create([
                'id_assinatura' => $assinatura->id_assinatura,
                'tipo' => 'criada',
                'payload_json' => [
                    'id_plano' => $plano->id_plano,
                    'nome_plano' => $plano->nome,
                    'preco' => $plano->preco,
                    'ciclo' => $plano->ciclo_cobranca,
                ],
            ]);

            // Se cancelada ou expirada, criar evento correspondente
            if ($status === 'cancelada') {
                EventoAssinatura::create([
                    'id_assinatura' => $assinatura->id_assinatura,
                    'tipo' => 'cancelada',
                    'payload_json' => [
                        'motivo' => 'Teste de seed',
                        'data_cancelamento' => $dataFim->toDateTimeString(),
                    ],
                ]);
            }

            $assinaturasCriadas++;
        }

        $this->command->info("✅ {$assinaturasCriadas} assinaturas criadas com sucesso!");
    }

    /**
     * Calcular próximo vencimento baseado no ciclo
     */
    private function calcularProximoVencimento(Carbon $dataInicio, string $ciclo): Carbon
    {
        switch ($ciclo) {
            case 'mensal':
                return $dataInicio->copy()->addMonth();
            case 'trimestral':
                return $dataInicio->copy()->addMonths(3);
            case 'semestral':
                return $dataInicio->copy()->addMonths(6);
            case 'anual':
                return $dataInicio->copy()->addYear();
            default:
                return $dataInicio->copy()->addMonth();
        }
    }
}
