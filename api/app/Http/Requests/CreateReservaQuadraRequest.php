<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class CreateReservaQuadraRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id_quadra' => 'required|integer|exists:quadras,id_quadra',
            'id_usuario' => 'nullable|integer|exists:usuarios,id_usuario', // ← Nullable para alunos
            'inicio' => 'required|date_format:Y-m-d\TH:i:s.000\Z|after_or_equal:today', // ← Aceita hoje
            'fim' => 'required|date_format:Y-m-d\TH:i:s.000\Z|after:inicio',
            'observacoes' => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'id_quadra.required' => 'A quadra é obrigatória',
            'id_quadra.exists' => 'Quadra não encontrada',
            'id_usuario.exists' => 'Usuário não encontrado',
            'inicio.required' => 'A data/hora de início é obrigatória',
            'inicio.date_format' => 'Formato de data/hora inválido',
            'inicio.after_or_equal' => 'A reserva deve ser para hoje ou futura',
            'fim.required' => 'A data/hora de término é obrigatória',
            'fim.date_format' => 'Formato de data/hora inválido',
            'fim.after' => 'O horário de término deve ser após o início',
            'observacoes.max' => 'As observações não podem ter mais de 500 caracteres',
        ];
    }

    /**
     * Handle a failed validation attempt.
     * 
     * Força retorno JSON em vez de redirect (para APIs)
     */
    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            response()->json([
                'message' => 'Dados inválidos',
                'errors' => $validator->errors()
            ], 422)
        );
    }
}
