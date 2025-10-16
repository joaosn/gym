<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateQuadraRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Apenas admin pode criar quadras
        return $this->user() && $this->user()->papel === 'admin';
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'nome' => 'required|string|max:100|unique:quadras,nome',
            'localizacao' => 'nullable|string|max:255',
            'esporte' => 'required|string|in:beach_tennis,tenis,futsal,volei,basquete,outros',
            'preco_hora' => 'required|numeric|min:0|max:9999.99',
            'caracteristicas_json' => 'nullable|array',
            'status' => 'nullable|string|in:ativa,inativa',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'nome.required' => 'O nome da quadra é obrigatório',
            'nome.unique' => 'Já existe uma quadra com este nome',
            'esporte.required' => 'O esporte é obrigatório',
            'esporte.in' => 'Esporte inválido',
            'preco_hora.required' => 'O preço por hora é obrigatório',
            'preco_hora.numeric' => 'O preço deve ser um número válido',
            'preco_hora.min' => 'O preço não pode ser negativo',
            'status.in' => 'Status inválido',
        ];
    }
}
