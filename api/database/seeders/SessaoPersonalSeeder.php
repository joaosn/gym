<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SessaoPersonalSeeder extends Seeder
{
    /**
     * Seed sessões personal de exemplo
     */
    public function run(): void
    {
        echo "🏋️ Criando sessões personal...\n";

        // Limpar tabela
        DB::table('sessoes_personal')->delete();

        // Buscar IDs necessários
        $instrutores = DB::table('instrutores')
            ->where('status', 'ativo')
            ->get();

        $alunos = DB::table('usuarios')
            ->where('papel', 'aluno')
            ->where('status', 'ativo')
            ->get();

        $quadras = DB::table('quadras')
            ->where('status', 'ativo')
            ->get();

        if ($instrutores->isEmpty() || $alunos->isEmpty()) {
            echo "⚠️  Nenhum instrutor ou aluno encontrado. Execute InstrutorSeeder e UserSeeder primeiro.\n";
            return;
        }

        $sessoes = [];
        $now = Carbon::now();

        // Função helper para criar sessão
        $criarSessao = function($idInstrutor, $idUsuario, $idQuadra, $diasOffset, $hora, $duracao, $status) use ($instrutores, $now) {
            $inicio = $now->copy()->addDays($diasOffset)->setTimeFromTimeString($hora);
            $fim = $inicio->copy()->addMinutes($duracao);
            
            // Buscar valor_hora do instrutor
            $instrutor = collect($instrutores)->firstWhere('id_instrutor', $idInstrutor);
            $valorHora = $instrutor ? (float)$instrutor->valor_hora : 100.00;
            
            // Calcular preço
            $duracaoHoras = ceil($duracao / 30) * 0.5; // Blocos de 30min
            $precoTotal = round($valorHora * $duracaoHoras, 2);

            return [
                'id_instrutor' => $idInstrutor,
                'id_usuario' => $idUsuario,
                'id_quadra' => $idQuadra,
                'inicio' => $inicio,
                'fim' => $fim,
                'preco_total' => $precoTotal,
                'status' => $status,
                'observacoes' => null,
                'criado_em' => $now,
                'atualizado_em' => $now,
            ];
        };

        $instrutor1 = $instrutores->first()->id_instrutor;
        $instrutor2 = $instrutores->count() > 1 ? $instrutores->skip(1)->first()->id_instrutor : $instrutor1;
        
        $aluno1 = $alunos->first()->id_usuario;
        $aluno2 = $alunos->count() > 1 ? $alunos->skip(1)->first()->id_usuario : $aluno1;
        $aluno3 = $alunos->count() > 2 ? $alunos->skip(2)->first()->id_usuario : $aluno1;

        $quadra1 = $quadras->isNotEmpty() ? $quadras->first()->id_quadra : null;
        $quadra2 = $quadras->count() > 1 ? $quadras->skip(1)->first()->id_quadra : $quadra1;

        // Sessões PASSADAS (concluídas)
        $sessoes[] = $criarSessao($instrutor1, $aluno1, $quadra1, -7, '08:00:00', 60, 'concluida');
        $sessoes[] = $criarSessao($instrutor1, $aluno2, $quadra1, -5, '10:00:00', 60, 'concluida');
        $sessoes[] = $criarSessao($instrutor2, $aluno3, $quadra2, -3, '14:00:00', 90, 'concluida');
        $sessoes[] = $criarSessao($instrutor1, $aluno1, $quadra1, -2, '09:00:00', 60, 'no_show'); // Aluno faltou
        $sessoes[] = $criarSessao($instrutor2, $aluno2, $quadra2, -1, '16:00:00', 60, 'cancelada');

        // Sessões FUTURAS (pendentes e confirmadas)
        $sessoes[] = $criarSessao($instrutor1, $aluno1, $quadra1, 1, '08:00:00', 60, 'confirmada');
        $sessoes[] = $criarSessao($instrutor1, $aluno2, $quadra1, 1, '10:00:00', 90, 'pendente');
        $sessoes[] = $criarSessao($instrutor2, $aluno3, $quadra2, 2, '14:00:00', 60, 'confirmada');
        $sessoes[] = $criarSessao($instrutor1, $aluno1, $quadra1, 3, '09:00:00', 60, 'pendente');
        $sessoes[] = $criarSessao($instrutor2, $aluno2, $quadra2, 4, '15:00:00', 90, 'pendente');
        $sessoes[] = $criarSessao($instrutor1, $aluno3, $quadra1, 5, '11:00:00', 60, 'confirmada');
        $sessoes[] = $criarSessao($instrutor2, $aluno1, $quadra2, 7, '16:00:00', 120, 'pendente');

        // Inserir no banco
        DB::table('sessoes_personal')->insert($sessoes);

        echo "✅ " . count($sessoes) . " sessões personal criadas com sucesso!\n";
        echo "   - " . count(array_filter($sessoes, fn($s) => in_array($s['status'], ['concluida', 'no_show', 'cancelada']))) . " sessões passadas\n";
        echo "   - " . count(array_filter($sessoes, fn($s) => in_array($s['status'], ['pendente', 'confirmada']))) . " sessões futuras\n";
    }
}
