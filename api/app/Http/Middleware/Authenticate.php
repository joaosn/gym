<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     * 
     * Para APIs REST, sempre retorna null
     * Para web requests, redireciona se houver rota 'login'
     */
    protected function redirectTo(Request $request): ?string
    {
        // APIs sempre esperam JSON, nunca fazem redirect
        // Retorna null que resulta em erro 401
        return null;
    }

    /**
     * Handle an unauthenticated user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  array  $guards
     * @return void
     *
     * @throws \Illuminate\Auth\AuthenticationException
     */
    protected function unauthenticated($request, array $guards)
    {
        // Se a requisição espera JSON, não faz nada
        // O handler vai retornar 401 JSON
        if ($request->expectsJson()) {
            throw new \Illuminate\Auth\AuthenticationException('Unauthenticated', $guards);
        }

        parent::unauthenticated($request, $guards);
    }
}
