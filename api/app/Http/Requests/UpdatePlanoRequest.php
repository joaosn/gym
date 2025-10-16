<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePlanoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nome' => 'sometimes|string|max:255',
            'preco' => 'sometimes|numeric|min:0',
            'ciclo_cobranca' => 'sometimes|in:mensal,trimestral,anual',
            'max_reservas_futuras' => 'nullable|integer|min:0',
            'beneficios_json' => 'nullable|array',
            'status' => 'sometimes|in:ativo,inativo',
        ];
    }

    public function messages(): array
    {
        return [
            'nome.max' => 'O nome não pode ter mais de 255 caracteres',
            'preco.numeric' => 'O preço deve ser um valor numérico',
            'preco.min' => 'O preço não pode ser negativo',
            'ciclo_cobranca.in' => 'Ciclo de cobrança inválido',
            'max_reservas_futuras.integer' => 'Máximo de reservas deve ser um número inteiro',
            'max_reservas_futuras.min' => 'Máximo de reservas não pode ser negativo',
            'status.in' => 'Status inválido',
        ];
    }
}
