<?php

namespace App\Services;

use App\Models\Aula;
use App\Models\HorarioAula;
use App\Models\OcorrenciaAula;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class OcorrenciaAulaService
{
    /**
     * Gera ocorrências de aula baseadas nos horários semanais
     * 
     * @param int $idAula
     * @param Carbon $dataInicio
     * @param Carbon $dataFim
     * @return array ['criadas' => int, 'puladas' => int, 'ocorrencias' => Collection]
     */
    public function gerarOcorrencias(int $idAula, Carbon $dataInicio, Carbon $dataFim): array
    {
        $aula = Aula::with('horarios')->findOrFail($idAula);
        
        if ($aula->horarios->isEmpty()) {
            throw new \Exception('Aula não possui horários configurados');
        }

        $ocorrenciasCriadas = [];
        $ocorrenciasPuladas = 0;

        DB::beginTransaction();
        try {
            foreach ($aula->horarios as $horario) {
                $ocorrencias = $this->gerarOcorrenciasParaHorario($horario, $dataInicio, $dataFim);
                
                foreach ($ocorrencias as $ocorrencia) {
                    // Verificar conflitos antes de criar
                    if ($this->temConflito($ocorrencia)) {
                        $ocorrenciasPuladas++;
                        continue;
                    }

                    $ocorrenciaCriada = OcorrenciaAula::create($ocorrencia);
                    $ocorrenciasCriadas[] = $ocorrenciaCriada;
                }
            }

            DB::commit();

            return [
                'criadas' => count($ocorrenciasCriadas),
                'puladas' => $ocorrenciasPuladas,
                'ocorrencias' => collect($ocorrenciasCriadas),
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Gera ocorrências para um horário específico dentro do período
     */
    private function gerarOcorrenciasParaHorario(HorarioAula $horario, Carbon $dataInicio, Carbon $dataFim): array
    {
        $ocorrencias = [];
        $aula = $horario->aula;

        // Encontrar a primeira data do dia da semana correto
        $dataAtual = $dataInicio->copy()->startOfDay();
        
        // Ajustar para o dia da semana correto (1=Segunda, 7=Domingo)
        $diaSemanaHorario = $horario->dia_semana;
        $diaSemanaAtual = $dataAtual->dayOfWeekIso; // Carbon: 1=Monday, 7=Sunday
        
        if ($diaSemanaAtual < $diaSemanaHorario) {
            $dataAtual->addDays($diaSemanaHorario - $diaSemanaAtual);
        } elseif ($diaSemanaAtual > $diaSemanaHorario) {
            $dataAtual->addDays(7 - ($diaSemanaAtual - $diaSemanaHorario));
        }

        // Gerar ocorrências semanalmente
        while ($dataAtual->lte($dataFim)) {
            $inicio = $dataAtual->copy()->setTimeFromTimeString($horario->hora_inicio);
            $fim = $inicio->copy()->addMinutes($aula->duracao_min);

            $ocorrencias[] = [
                'id_aula' => $horario->id_aula,
                'id_instrutor' => $horario->id_instrutor,
                'id_quadra' => $horario->id_quadra,
                'inicio' => $inicio->toDateTimeString(),
                'fim' => $fim->toDateTimeString(),
                'status' => 'agendada',
            ];

            $dataAtual->addWeek();
        }

        return $ocorrencias;
    }

    /**
     * Verifica se há conflito de horário (anti-overlap)
     */
    private function temConflito(array $ocorrenciaData): bool
    {
        // Conflito com outras ocorrências na mesma quadra
        $conflitoQuadra = OcorrenciaAula::where('id_quadra', $ocorrenciaData['id_quadra'])
            ->where('status', '!=', 'cancelada')
            ->where(function ($query) use ($ocorrenciaData) {
                $query->where(function ($q) use ($ocorrenciaData) {
                    $q->where('inicio', '<=', $ocorrenciaData['inicio'])
                      ->where('fim', '>', $ocorrenciaData['inicio']);
                })->orWhere(function ($q) use ($ocorrenciaData) {
                    $q->where('inicio', '<', $ocorrenciaData['fim'])
                      ->where('fim', '>=', $ocorrenciaData['fim']);
                })->orWhere(function ($q) use ($ocorrenciaData) {
                    $q->where('inicio', '>=', $ocorrenciaData['inicio'])
                      ->where('fim', '<=', $ocorrenciaData['fim']);
                });
            })
            ->exists();

        // Conflito com instrutor (sessões personal ou outras aulas)
        $conflitoInstrutor = OcorrenciaAula::where('id_instrutor', $ocorrenciaData['id_instrutor'])
            ->where('status', '!=', 'cancelada')
            ->where(function ($query) use ($ocorrenciaData) {
                $query->where(function ($q) use ($ocorrenciaData) {
                    $q->where('inicio', '<=', $ocorrenciaData['inicio'])
                      ->where('fim', '>', $ocorrenciaData['inicio']);
                })->orWhere(function ($q) use ($ocorrenciaData) {
                    $q->where('inicio', '<', $ocorrenciaData['fim'])
                      ->where('fim', '>=', $ocorrenciaData['fim']);
                })->orWhere(function ($q) use ($ocorrenciaData) {
                    $q->where('inicio', '>=', $ocorrenciaData['inicio'])
                      ->where('fim', '<=', $ocorrenciaData['fim']);
                });
            })
            ->exists();

        return $conflitoQuadra || $conflitoInstrutor;
    }

    /**
     * Cancela todas as ocorrências futuras de uma aula
     */
    public function cancelarOcorrenciasFuturas(int $idAula): int
    {
        return OcorrenciaAula::where('id_aula', $idAula)
            ->where('inicio', '>', now())
            ->where('status', 'agendada')
            ->update(['status' => 'cancelada']);
    }
}
