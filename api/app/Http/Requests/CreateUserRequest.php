<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nome' => 'required|string|max:255',
            'email' => 'required|email|unique:usuarios,email',
            'senha' => 'required|string|min:6',
            'telefone' => 'nullable|string|max:20',
            'documento' => 'nullable|string|max:14', // CPF: 11 dígitos + formatação
            'data_nascimento' => 'nullable|date',
            'papel' => 'required|in:admin,aluno,personal,instrutor',
            'status' => 'nullable|in:ativo,inativo',
        ];
    }

    public function messages(): array
    {
        return [
            'nome.required' => 'O nome é obrigatório',
            'nome.max' => 'O nome não pode ter mais de 255 caracteres',
            'email.required' => 'O email é obrigatório',
            'email.email' => 'Email inválido',
            'email.unique' => 'Este email já está cadastrado',
            'senha.required' => 'A senha é obrigatória',
            'senha.min' => 'A senha deve ter no mínimo 6 caracteres',
            'telefone.max' => 'O telefone não pode ter mais de 20 caracteres',
            'documento.max' => 'O documento não pode ter mais de 14 caracteres',
            'data_nascimento.date' => 'Data de nascimento inválida',
            'papel.required' => 'O papel do usuário é obrigatório',
            'papel.in' => 'Papel inválido. Opções: admin, aluno, personal, instrutor',
            'status.in' => 'Status inválido. Opções: ativo, inativo',
        ];
    }
}
