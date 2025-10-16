<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateSessaoPersonalRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'id_instrutor' => 'required|exists:instrutores,id_instrutor',
            'id_usuario' => 'required|exists:usuarios,id_usuario',
            'id_quadra' => 'nullable|exists:quadras,id_quadra',
            'inicio' => 'required|date|after:now',
            'fim' => 'required|date|after:inicio',
            'observacoes' => 'nullable|string|max:1000',
        ];
    }

    public function messages()
    {
        return [
            'id_instrutor.required' => 'O instrutor é obrigatório',
            'id_instrutor.exists' => 'Instrutor não encontrado',
            'id_usuario.required' => 'O aluno é obrigatório',
            'id_usuario.exists' => 'Aluno não encontrado',
            'id_quadra.exists' => 'Quadra não encontrada',
            'inicio.required' => 'A data/hora de início é obrigatória',
            'inicio.after' => 'A sessão deve ser agendada para o futuro',
            'fim.required' => 'A data/hora de término é obrigatória',
            'fim.after' => 'A hora de término deve ser após a hora de início',
            'observacoes.max' => 'As observações não podem ter mais de 1000 caracteres',
        ];
    }
}
