<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSessaoPersonalRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'id_quadra' => 'nullable|exists:quadras,id_quadra',
            'inicio' => 'sometimes|required|date',
            'fim' => 'sometimes|required|date|after:inicio',
            'status' => 'sometimes|required|in:pendente,confirmada,cancelada,concluida,no_show',
            'observacoes' => 'nullable|string|max:1000',
        ];
    }

    public function messages()
    {
        return [
            'id_quadra.exists' => 'Quadra não encontrada',
            'inicio.required' => 'A data/hora de início é obrigatória',
            'fim.required' => 'A data/hora de término é obrigatória',
            'fim.after' => 'A hora de término deve ser após a hora de início',
            'status.in' => 'Status inválido',
            'observacoes.max' => 'As observações não podem ter mais de 1000 caracteres',
        ];
    }
}
