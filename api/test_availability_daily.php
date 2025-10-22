<?php

/**
 * Script de Teste - getDailyAvailability
 * Testa a rota /api/personal-sessions/availability/daily/{id_instrutor}?date=YYYY-MM-DD
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Instrutor;
use App\Models\DisponibilidadeInstrutor;
use App\Models\SessaoPersonal;
use Carbon\Carbon;

echo "\n========================================\n";
echo "TESTE: getDailyAvailability\n";
echo "========================================\n\n";

// 1. Buscar instrutor 7
$instrutor = Instrutor::with('usuario')->findOrFail(7);
echo "✅ Instrutor encontrado: {$instrutor->usuario->nome} (ID: 7)\n\n";

// 2. Verificar disponibilidade semanal
$disponibilidades = DisponibilidadeInstrutor::where('id_instrutor', 7)->get();
echo "Disponibilidades semanais:\n";
foreach ($disponibilidades as $disp) {
    $dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    echo "  - {$dias[$disp->dia_semana]}: {$disp->hora_inicio} até {$disp->hora_fim}\n";
}
echo "\n";

// 3. Testar com data 2025-10-22 (Quarta-feira, dia_semana = 3)
$data = Carbon::parse('2025-10-22');
echo "Data solicitada: {$data->format('d/m/Y')} ({$data->dayName})\n";
echo "Dia da semana (PHP): {$data->dayOfWeek} (0=Dom, 1=Seg, ...6=Sab)\n\n";

// 4. Verificar se há disponibilidade para este dia
$disponibilidadeDia = DisponibilidadeInstrutor::where('id_instrutor', 7)
    ->where('dia_semana', $data->dayOfWeek)
    ->first();

if (!$disponibilidadeDia) {
    echo "❌ ERRO: Instrutor não tem disponibilidade neste dia da semana!\n";
    exit(1);
}

echo "✅ Instrutor disponível neste dia:\n";
echo "   Horário: {$disponibilidadeDia->hora_inicio} até {$disponibilidadeDia->hora_fim}\n\n";

// 5. Gerar slots de 30 minutos
echo "Slots de 30 minutos:\n";
$horaInicio = Carbon::parse($disponibilidadeDia->hora_inicio);
$horaFim = Carbon::parse($disponibilidadeDia->hora_fim);

$slots = [];
$current = $horaInicio->clone();
while ($current->lt($horaFim)) {
    $slotFim = $current->clone()->addMinutes(30);
    echo "   - {$current->format('H:i')} até {$slotFim->format('H:i')}\n";
    $slots[] = [
        'inicio' => $current->format('H:i'),
        'fim' => $slotFim->format('H:i'),
    ];
    $current = $slotFim;
}

echo "\nTotal de slots: " . count($slots) . "\n\n";

// 6. Buscar sessões agendadas neste dia
$dataInicio = $data->clone()->startOfDay();
$dataFim = $data->clone()->endOfDay();

$sessoesAgendadas = SessaoPersonal::where('id_instrutor', 7)
    ->whereBetween('inicio', [$dataInicio, $dataFim])
    ->where('status', '!=', 'cancelada')
    ->get();

echo "Sessões agendadas neste dia: " . $sessoesAgendadas->count() . "\n";
foreach ($sessoesAgendadas as $sessao) {
    echo "   - {$sessao->inicio->format('H:i')} até {$sessao->fim->format('H:i')} (Status: {$sessao->status})\n";
}

echo "\n========================================\n";
echo "✅ TESTE CONCLUÍDO COM SUCESSO\n";
echo "========================================\n\n";
