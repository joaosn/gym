<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateInstrutorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nome' => 'required|string|max:255',
            'email' => 'nullable|email|unique:instrutores,email',
            'telefone' => 'nullable|string|max:20',
            'cref' => 'nullable|string|max:20',
            'valor_hora' => 'required|numeric|min:0',
            'especialidades' => 'nullable|array',
            'especialidades.*' => 'string|max:100',
            'bio' => 'nullable|string|max:1000',
            'status' => 'nullable|in:ativo,inativo',
            
            // Dados do usuário (opcional - se quiser criar usuário junto)
            'criar_usuario' => 'nullable|boolean',
            'id_usuario' => 'nullable|exists:usuarios,id_usuario',
            'senha' => 'required_if:criar_usuario,true|string|min:6',
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
            'cref.required' => 'O CREF é obrigatório para instrutores',
            'id_usuario.exists' => 'Usuário não encontrado',
            'senha.required_if' => 'A senha é obrigatória ao criar novo usuário',
            'senha.min' => 'A senha deve ter no mínimo 6 caracteres',
        ];
    }
}
