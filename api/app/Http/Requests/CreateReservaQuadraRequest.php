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
            'id_usuario' => 'required|integer|exists:usuarios,id_usuario',
            'inicio' => 'required|date|after:now', // ← Voltando a validação
            'fim' => 'required|date|after:inicio',
            'observacoes' => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'id_quadra.required' => 'A quadra é obrigatória',
            'id_quadra.exists' => 'Quadra não encontrada',
            'id_usuario.required' => 'O usuário é obrigatório',
            'id_usuario.exists' => 'Usuário não encontrado',
            'inicio.required' => 'A data/hora de início é obrigatória',
            'inicio.date' => 'Data/hora de início inválida',
            'inicio.after' => 'A reserva deve ser para uma data/hora futura', // ← Mensagem clara
            'fim.required' => 'A data/hora de término é obrigatória',
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
