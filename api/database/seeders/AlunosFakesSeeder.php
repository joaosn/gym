<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AlunosFakesSeeder extends Seeder
{
    /**
     * Seed 30 alunos fake para testes
     */
    public function run(): void
    {
        $nomesMasculinos = [
            'João', 'Pedro', 'Lucas', 'Matheus', 'Gabriel', 'Felipe', 'Bruno', 'Rafael', 'Thiago', 'Diego',
            'André', 'Gustavo', 'Rodrigo', 'Fernando', 'Marcelo', 'Leonardo', 'Vinicius', 'Ricardo', 'Daniel', 'Paulo'
        ];

        $nomesFemininos = [
            'Maria', 'Ana', 'Julia', 'Beatriz', 'Larissa', 'Camila', 'Fernanda', 'Amanda', 'Jessica', 'Mariana',
            'Carolina', 'Rafaela', 'Isabela', 'Patricia', 'Bruna', 'Leticia', 'Juliana', 'Bianca', 'Renata', 'Vanessa'
        ];

        $sobrenomes = [
            'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Costa',
            'Gomes', 'Martins', 'Araujo', 'Melo', 'Barbosa', 'Ribeiro', 'Carvalho', 'Rocha', 'Almeida', 'Nascimento',
            'Dias', 'Monteiro', 'Cardoso', 'Reis', 'Ramos', 'Castro', 'Correia', 'Campos', 'Pinto', 'Teixeira'
        ];

        $telefones = [
            '11987654321', '11976543210', '11965432109', '11954321098', '11943210987',
            '11932109876', '11921098765', '11910987654', '11999887766', '11988776655',
            '11977665544', '11966554433', '11955443322', '11944332211', '11933221100',
            '21987654321', '21976543210', '21965432109', '21954321098', '21943210987',
            '31987654321', '31976543210', '31965432109', '31954321098', '31943210987',
            '41987654321', '41976543210', '41965432109', '41954321098', '41943210987'
        ];

        $alunos = [];

        // Gerar 30 alunos
        for ($i = 1; $i <= 30; $i++) {
            // Alternar entre masculino e feminino
            $isMasculino = $i % 2 === 1;
            
            $primeiroNome = $isMasculino 
                ? $nomesMasculinos[array_rand($nomesMasculinos)]
                : $nomesFemininos[array_rand($nomesFemininos)];
            
            $sobrenome = $sobrenomes[array_rand($sobrenomes)];
            $nomeCompleto = "{$primeiroNome} {$sobrenome}";
            
            // Email único
            $emailSlug = strtolower(str_replace(' ', '.', $nomeCompleto));
            $email = "{$emailSlug}.{$i}@fitway.com";
            
            // CPF fake (não precisa ser válido para testes)
            $cpf = sprintf('%011d', rand(10000000000, 99999999999));
            
            // Telefone
            $telefone = $telefones[$i - 1];
            
            // Data de nascimento (entre 18 e 50 anos)
            $idade = rand(18, 50);
            $dataNascimento = now()->subYears($idade)->subDays(rand(0, 365))->format('Y-m-d');

            $alunos[] = [
                'nome' => $nomeCompleto,
                'email' => $email,
                'senha_hash' => Hash::make('password123'), // Senha padrão para todos
                'telefone' => $telefone,
                'documento' => $cpf,
                'data_nascimento' => $dataNascimento,
                'papel' => 'aluno',
                'status' => 'ativo',
                'criado_em' => now(),
                'atualizado_em' => now(),
            ];
        }

        // Inserir todos de uma vez
        DB::table('usuarios')->insert($alunos);

        $this->command->info('✅ 30 alunos fake criados com sucesso!');
        $this->command->info('📧 Email padrão: [nome.sobrenome.N]@fitway.com');
        $this->command->info('🔑 Senha padrão: password123');
    }
}
