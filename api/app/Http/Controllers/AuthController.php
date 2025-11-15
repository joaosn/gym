<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\Usuario;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    /**
     * Login do usuário
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $usuario = Usuario::where('email', $request->email)->first();
        if (!$usuario || !Hash::check($request->password, $usuario->senha_hash)) {
            return response()->json([
                'message' => 'Email ou senha incorretos',
            ], 401);
        }

        if ($usuario->status !== 'ativo') {
            return response()->json([
                'message' => 'Usuário inativo. Entre em contato com o suporte.',
            ], 403);
        }

        // Se for instrutor, buscar dados do instrutor também
        $instrutor = null;
        if ($usuario->papel === 'instrutor') {
            $instrutor = \App\Models\Instrutor::where('id_usuario', $usuario->id_usuario)->first();
        }

        // Opcionalmente, revogar tokens anteriores (single-session)
        // $usuario->tokens()->delete();

        $token = $usuario->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => [
                'id' => (string) $usuario->id_usuario,
                'instructorId' => $instrutor ? (string) $instrutor->id_instrutor : null,
                'name' => $usuario->nome,
                'email' => $usuario->email,
                'phone' => $usuario->telefone,
                'role' => $usuario->papel,
                'createdAt' => $usuario->criado_em->toISOString(),
            ],
            'access_token' => $token,
        ], 200);
    }

    /**
     * Registro de novo usuário
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $usuario = Usuario::create([
            'nome' => $request->name,
            'email' => $request->email,
            'senha_hash' => Hash::make($request->password),
            'telefone' => $request->phone,
            'papel' => 'aluno', // Novos usuários sempre como aluno
            'status' => 'ativo',
        ]);

        $token = $usuario->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => [
                'id' => (string) $usuario->id_usuario,
                'name' => $usuario->nome,
                'email' => $usuario->email,
                'phone' => $usuario->telefone,
                'role' => $usuario->papel,
                'createdAt' => $usuario->criado_em->toISOString(),
            ],
            'access_token' => $token,
        ], 201);
    }

    /**
     * Obter dados do usuário autenticado
     */
    public function me(): JsonResponse
    {
        /** @var Usuario $usuario */
        $usuario = Auth::user();

        // Se for instrutor, buscar o ID do instrutor
        $idInstrutor = null;
        if ($usuario->papel === 'instrutor') {
            $instrutor = \App\Models\Instrutor::where('id_usuario', $usuario->id_usuario)->first();
            if ($instrutor) {
                $idInstrutor = (string) $instrutor->id_instrutor;
            }
        }

        return response()->json([
            'user' => [
                'id' => (string) $usuario->id_usuario,
                'instructorId' => $idInstrutor,
                'name' => $usuario->nome,
                'email' => $usuario->email,
                'phone' => $usuario->telefone,
                'role' => $usuario->papel,
                'createdAt' => $usuario->criado_em->toISOString(),
            ],
        ], 200);
    }

    /**
     * Logout do usuário
     */
    public function logout(): JsonResponse
    {
        /** @var Usuario $usuario */
        $usuario = Auth::user();
        $usuario->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout realizado com sucesso',
        ], 200);
    }
}
