<?php

namespace App\Http\Controllers\Instrutor;

use App\Http\Controllers\Controller;
use App\Models\Instrutor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class InstructorProfileController extends Controller
{
    /**
     * GET /instructor/profile
     * Buscar perfil do instrutor logado
     */
    public function show(Request $request)
    {
        $user = $request->user();
        
        // Buscar instrutor vinculado ao usuário logado
        $instrutor = Instrutor::where('id_usuario', $user->id_usuario)
            ->where('status', '!=', 'excluido')
            ->firstOrFail();
        
        return response()->json(['data' => $instrutor], 200);
    }
    
    /**
     * PUT /instructor/profile
     * Atualizar perfil do instrutor logado
     */
    public function update(Request $request)
    {
        $user = $request->user();
        
        // Buscar instrutor vinculado ao usuário logado
        $instrutor = Instrutor::where('id_usuario', $user->id_usuario)
            ->where('status', '!=', 'excluido')
            ->firstOrFail();
        
        // Validação
        $validator = Validator::make($request->all(), [
            'nome' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|max:255',
            'telefone' => 'nullable|string|max:20',
            'cref' => 'nullable|string|max:50',
            'valor_hora' => 'sometimes|numeric|min:0',
            'especialidades_json' => 'nullable|array',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Dados inválidos',
                'errors' => $validator->errors()
            ], 422);
        }
        
        // Atualizar campos
        $dados = $request->only(['nome', 'email', 'telefone', 'cref', 'valor_hora', 'especialidades_json']);
        $instrutor->update($dados);
        
        return response()->json(['data' => $instrutor], 200);
    }
}
