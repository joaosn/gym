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

        // Opcionalmente, revogar tokens anteriores (single-session)
        // $usuario->tokens()->delete();

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

        return response()->json([
            'user' => [
                'id' => (string) $usuario->id_usuario,
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
