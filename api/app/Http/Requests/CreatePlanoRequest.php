<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreatePlanoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nome' => 'required|string|max:255',
            'preco' => 'required|numeric|min:0',
            'ciclo_cobranca' => 'required|in:mensal,trimestral,anual',
            'max_reservas_futuras' => 'nullable|integer|min:0',
            'beneficios_json' => 'nullable|array',
            'status' => 'nullable|in:ativo,inativo',
        ];
    }

    public function messages(): array
    {
        return [
            'nome.required' => 'O nome do plano é obrigatório',
            'nome.max' => 'O nome não pode ter mais de 255 caracteres',
            'preco.required' => 'O preço é obrigatório',
            'preco.numeric' => 'O preço deve ser um valor numérico',
            'preco.min' => 'O preço não pode ser negativo',
            'ciclo_cobranca.required' => 'O ciclo de cobrança é obrigatório',
            'ciclo_cobranca.in' => 'Ciclo de cobrança inválido',
            'max_reservas_futuras.integer' => 'Máximo de reservas deve ser um número inteiro',
            'max_reservas_futuras.min' => 'Máximo de reservas não pode ser negativo',
            'status.in' => 'Status inválido',
        ];
    }
}
