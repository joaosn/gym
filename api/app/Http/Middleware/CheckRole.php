<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        if (!$request->user()) {
            return response()->json([
                'message' => 'Não autenticado',
            ], 401);
        }

        if (!in_array($request->user()->papel, $roles)) {
            return response()->json([
                'message' => 'Acesso negado. Você não tem permissão para acessar este recurso.',
                'required_roles' => $roles,
                'your_role' => $request->user()->papel,
            ], 403);
        }

        return $next($request);
    }
}
