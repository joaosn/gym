<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class UpdateReservaQuadraRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id_quadra' => 'sometimes|integer|exists:quadras,id_quadra',
            'id_usuario' => 'sometimes|integer|exists:usuarios,id_usuario',
            'inicio' => 'sometimes|date|after:now',
            'fim' => 'sometimes|date|after:inicio',
            'status' => 'sometimes|in:pendente,confirmada,cancelada,no_show,concluida',
            'observacoes' => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'id_quadra.exists' => 'Quadra não encontrada',
            'id_usuario.exists' => 'Usuário não encontrado',
            'inicio.after' => 'A reserva deve ser para uma data/hora futura',
            'fim.after' => 'O horário de término deve ser após o início',
            'status.in' => 'Status inválido',
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
