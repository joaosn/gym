<?php

namespace App\Http\Controllers;

use App\Models\Quadra;
use App\Models\Plano;
use App\Models\Aula;
use App\Models\Instrutor;
use Illuminate\Http\Request;

class PublicController extends Controller
{
    /**
     * Listar quadras ativas para página pública
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function courts()
    {
        $quadras = Quadra::where('status', 'ativa')
            ->select('id_quadra', 'nome', 'localizacao', 'esporte', 'preco_hora', 'caracteristicas_json', 'status')
            ->orderBy('nome')
            ->get();

        return response()->json(['data' => $quadras], 200);
    }

    /**
     * Listar planos ativos para página pública
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function plans()
    {
        $planos = Plano::where('status', 'ativo')
            ->select('id_plano', 'nome', 'preco', 'ciclo_cobranca', 'max_reservas_futuras', 'beneficios_json', 'status')
            ->orderBy('preco')
            ->get();

        return response()->json(['data' => $planos], 200);
    }

    /**
     * Listar aulas ativas para página pública
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function classes()
    {
        $aulas = Aula::where('status', 'ativa')
            ->select('id_aula', 'nome', 'descricao', 'esporte', 'nivel', 'duracao_min', 'capacidade_max', 'preco_unitario', 'status')
            ->orderBy('nivel')
            ->orderBy('nome')
            ->get();

        return response()->json(['data' => $aulas], 200);
    }

    /**
     * Listar instrutores ativos para página pública
     * 
     * GET /api/public/instructors
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function instructors()
    {
        $instrutores = Instrutor::where('status', 'ativo')
            ->with('disponibilidades')
            ->select(
                'id_instrutor',
                'nome',
                'email',
                'telefone',
                'cref',
                'valor_hora',
                'especialidades_json',
                'bio',
                'status',
                'criado_em',
                'atualizado_em'
            )
            ->orderBy('nome')
            ->get();

        // Mapear para formato consistente com API admin
        $data = $instrutores->map(function ($instrutor) {
            return [
                'id_instrutor' => (string) $instrutor->id_instrutor,
                'nome' => $instrutor->nome,
                'email' => $instrutor->email,
                'telefone' => $instrutor->telefone,
                'cref' => $instrutor->cref,
                'valor_hora' => (float) $instrutor->valor_hora,
                'especialidades' => is_array($instrutor->especialidades_json) ? $instrutor->especialidades_json : json_decode($instrutor->especialidades_json, true) ?? [],
                'bio' => $instrutor->bio,
                'status' => $instrutor->status,
                'criado_em' => $instrutor->criado_em->toISOString(),
                'atualizado_em' => $instrutor->atualizado_em->toISOString(),
                'disponibilidades' => $instrutor->disponibilidades->map(function ($disp) {
                    return [
                        'id_disponibilidade' => (string) $disp->id_disponibilidade,
                        'dia_semana' => (int) $disp->dia_semana,
                        'hora_inicio' => $disp->hora_inicio,
                        'hora_fim' => $disp->hora_fim,
                    ];
                }),
            ];
        });

        return response()->json(['data' => $data, 'total' => $data->count()], 200);
    }
}
