<?php

namespace App\Http\Controllers;

use App\Models\HorarioAula;
use Illuminate\Http\Request;

class HorarioAulaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = HorarioAula::with(['aula', 'instrutor', 'quadra']);

        // Filtro por aula
        if ($request->filled('id_aula')) {
            $query->where('id_aula', $request->id_aula);
        }

        // Filtro por instrutor
        if ($request->filled('id_instrutor')) {
            $query->where('id_instrutor', $request->id_instrutor);
        }

        // Filtro por dia da semana
        if ($request->filled('dia_semana')) {
            $query->where('dia_semana', $request->dia_semana);
        }

        // Ordenação
        $query->orderBy('dia_semana', 'asc')
              ->orderBy('hora_inicio', 'asc');

        $horarios = $query->get();

        return response()->json(['data' => $horarios], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_aula' => 'required|exists:aulas,id_aula',
            'id_instrutor' => 'required|exists:instrutores,id_instrutor',
            'id_quadra' => 'required|exists:quadras,id_quadra',
            'dia_semana' => 'required|integer|between:1,7',
            'hora_inicio' => 'required|date_format:H:i',
        ]);

        // Verificar se já existe horário idêntico para esta aula
        $existente = HorarioAula::where('id_aula', $validated['id_aula'])
            ->where('dia_semana', $validated['dia_semana'])
            ->where('hora_inicio', $validated['hora_inicio'])
            ->first();

        if ($existente) {
            return response()->json([
                'message' => 'Já existe um horário configurado para esta aula neste dia/hora',
            ], 409);
        }

        $horario = HorarioAula::create($validated);
        $horario->load(['aula', 'instrutor', 'quadra']);

        return response()->json(['data' => $horario], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(int $id)
    {
        $horario = HorarioAula::with(['aula', 'instrutor', 'quadra'])->findOrFail($id);
        return response()->json(['data' => $horario], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, int $id)
    {
        $horario = HorarioAula::findOrFail($id);

        $validated = $request->validate([
            'id_instrutor' => 'sometimes|required|exists:instrutores,id_instrutor',
            'id_quadra' => 'sometimes|required|exists:quadras,id_quadra',
            'dia_semana' => 'sometimes|required|integer|between:1,7',
            'hora_inicio' => 'sometimes|required|date_format:H:i',
        ]);

        $horario->update($validated);
        $horario->load(['aula', 'instrutor', 'quadra']);

        return response()->json(['data' => $horario], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(int $id)
    {
        $horario = HorarioAula::findOrFail($id);
        $horario->delete();

        return response()->json(null, 204);
    }
}

