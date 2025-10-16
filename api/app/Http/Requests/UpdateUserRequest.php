<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->route('id');
        
        return [
            'nome' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:usuarios,email,' . $userId . ',id_usuario',
            'senha' => 'sometimes|string|min:6',
            'telefone' => 'sometimes|nullable|string|max:20',
            'documento' => 'sometimes|nullable|string|max:14',
            'data_nascimento' => 'sometimes|nullable|date',
            'papel' => 'sometimes|in:admin,aluno,personal,instrutor',
            'status' => 'sometimes|in:ativo,inativo',
        ];
    }

    public function messages(): array
    {
        return [
            'nome.max' => 'O nome não pode ter mais de 255 caracteres',
            'email.email' => 'Email inválido',
            'email.unique' => 'Este email já está cadastrado',
            'senha.min' => 'A senha deve ter no mínimo 6 caracteres',
            'telefone.max' => 'O telefone não pode ter mais de 20 caracteres',
            'documento.max' => 'O documento não pode ter mais de 14 caracteres',
            'data_nascimento.date' => 'Data de nascimento inválida',
            'papel.in' => 'Papel inválido. Opções: admin, aluno, personal, instrutor',
            'status.in' => 'Status inválido. Opções: ativo, inativo',
        ];
    }
}
