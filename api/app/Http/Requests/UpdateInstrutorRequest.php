<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateInstrutorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $instrutorId = $this->route('id');

        return [
            'nome' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|nullable|email|unique:instrutores,email,' . $instrutorId . ',id_instrutor',
            'telefone' => 'sometimes|nullable|string|max:20',
            'cref' => 'sometimes|nullable|string|max:20',
            'valor_hora' => 'sometimes|required|numeric|min:0',
            'especialidades' => 'sometimes|nullable|array',
            'especialidades.*' => 'string|max:100',
            'bio' => 'sometimes|nullable|string|max:1000',
            'status' => 'sometimes|nullable|in:ativo,inativo',
        ];
    }

    public function messages(): array
    {
        return [
            'nome.required' => 'O nome é obrigatório',
            'email.email' => 'Email inválido',
            'email.unique' => 'Este email já está cadastrado',
            'valor_hora.required' => 'O valor/hora é obrigatório',
            'valor_hora.numeric' => 'O valor/hora deve ser um número',
            'valor_hora.min' => 'O valor/hora deve ser maior ou igual a zero',
        ];
    }
}
