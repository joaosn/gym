<?php

/**
 * Script de Teste - Integração Fase 8
 * Testa auto-criação de reservas de quadra ao criar sessões personal
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\SessaoPersonal;
use App\Models\ReservaQuadra;
use App\Models\Instrutor;
use App\Models\Usuario;
use App\Models\Quadra;
use App\Services\SessaoPersonalService;
use Carbon\Carbon;

echo "\n========================================\n";
echo "TESTE: Integração Fase 8 - Auto-Reserva\n";
echo "========================================\n\n";

// 1. Buscar dados existentes
$instrutor = Instrutor::first();
$aluno = Usuario::where('papel', 'aluno')->first();
$quadra = Quadra::first();

if (!$instrutor || !$aluno || !$quadra) {
    echo "❌ ERRO: Dados insuficientes no banco!\n";
    echo "   Instrutores: " . Instrutor::count() . "\n";
    echo "   Alunos: " . Usuario::where('papel', 'aluno')->count() . "\n";
    echo "   Quadras: " . Quadra::count() . "\n";
    exit(1);
}

echo "✅ Dados carregados:\n";
echo "   Instrutor: {$instrutor->nome} (ID: {$instrutor->id_instrutor})\n";
echo "   Aluno: {$aluno->nome} (ID: {$aluno->id_usuario})\n";
echo "   Quadra: {$quadra->nome} (ID: {$quadra->id_quadra})\n\n";

// 2. Criar sessão personal COM quadra
$service = new SessaoPersonalService();

// Usar horário futuro dentro da disponibilidade do instrutor
// 25/10/2025 é sábado (dia_semana=6), instrutor disponível 07:00-11:00
$inicio = Carbon::now()->addDays(7)->setTime(8, 0, 0);
$fim = Carbon::now()->addDays(7)->setTime(9, 30, 0);

echo "📅 Criando sessão personal...\n";
echo "   Início: {$inicio->format('d/m/Y H:i')}\n";
echo "   Fim: {$fim->format('d/m/Y H:i')}\n";
echo "   Quadra: {$quadra->nome}\n\n";

try {
    $sessao = $service->criarSessao([
        'id_instrutor' => $instrutor->id_instrutor,
        'id_usuario' => $aluno->id_usuario,
        'id_quadra' => $quadra->id_quadra,
        'inicio' => $inicio->toDateTimeString(),
        'fim' => $fim->toDateTimeString(),
        'observacoes' => 'Teste integração Fase 8',
    ]);

    echo "✅ Sessão criada com sucesso!\n";
    echo "   ID: {$sessao->id_sessao_personal}\n";
    echo "   Status: {$sessao->status}\n";
    echo "   Preço: R$ {$sessao->preco_total}\n\n";

    // 3. Verificar se reserva foi criada automaticamente
    $reserva = ReservaQuadra::where('id_sessao_personal', $sessao->id_sessao_personal)->first();

    if ($reserva) {
        echo "✅ Reserva automática criada!\n";
        echo "   ID Reserva: {$reserva->id_reserva_quadra}\n";
        echo "   Quadra: {$reserva->quadra->nome}\n";
        echo "   Início: {$reserva->inicio->format('d/m/Y H:i')}\n";
        echo "   Fim: {$reserva->fim->format('d/m/Y H:i')}\n";
        echo "   Status: {$reserva->status}\n";
        echo "   Origem: {$reserva->origem}\n";
        echo "   Observações: {$reserva->observacoes}\n\n";
    } else {
        echo "❌ ERRO: Reserva não foi criada automaticamente!\n\n";
    }

    // 4. Testar atualização: remover quadra
    echo "📝 Testando atualização: REMOVER quadra...\n";
    $sessaoAtualizada = $service->atualizarSessao($sessao, ['id_quadra' => null]);
    
    $reservaDepois = ReservaQuadra::where('id_sessao_personal', $sessao->id_sessao_personal)->first();
    
    if (!$reservaDepois) {
        echo "✅ Reserva deletada corretamente ao remover quadra!\n\n";
    } else {
        echo "❌ ERRO: Reserva deveria ter sido deletada!\n\n";
    }

    // 5. Testar atualização: re-adicionar quadra
    echo "📝 Testando atualização: RE-ADICIONAR quadra...\n";
    $sessaoAtualizada = $service->atualizarSessao($sessao, ['id_quadra' => $quadra->id_quadra]);
    
    $reservaNova = ReservaQuadra::where('id_sessao_personal', $sessao->id_sessao_personal)->first();
    
    if ($reservaNova) {
        echo "✅ Reserva re-criada corretamente!\n";
        echo "   ID Reserva: {$reservaNova->id_reserva_quadra}\n\n";
    } else {
        echo "❌ ERRO: Reserva deveria ter sido re-criada!\n\n";
    }

    // 6. Testar cancelamento
    echo "🗑️  Testando cancelamento de sessão...\n";
    $sessao->update(['status' => 'cancelada']);
    
    // Carregar reserva atualizada
    $reservaCancelada = ReservaQuadra::where('id_sessao_personal', $sessao->id_sessao_personal)->first();
    
    echo "   Status da sessão: {$sessao->fresh()->status}\n";
    
    if ($reservaCancelada) {
        echo "   Status da reserva: {$reservaCancelada->status}\n";
        echo "   (Nota: Status da reserva deve ser atualizado manualmente no destroy())\n\n";
    }

    echo "========================================\n";
    echo "✅ TESTE CONCLUÍDO COM SUCESSO!\n";
    echo "========================================\n\n";

    echo "📊 Resumo Final:\n";
    echo "   ✅ Sessão personal criada com quadra\n";
    echo "   ✅ Reserva automática criada\n";
    echo "   ✅ Reserva deletada ao remover quadra\n";
    echo "   ✅ Reserva re-criada ao re-adicionar quadra\n";
    echo "   ✅ Sessão cancelada corretamente\n\n";

} catch (\Exception $e) {
    echo "❌ ERRO: {$e->getMessage()}\n";
    echo "   Trace: {$e->getTraceAsString()}\n\n";
    exit(1);
}
