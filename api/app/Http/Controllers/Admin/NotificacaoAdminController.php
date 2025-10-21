<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CreateNotificacaoRequest;
use App\Services\NotificacaoService;

class NotificacaoAdminController extends Controller
{
    public function __construct(private NotificacaoService $service)
    {
    }

    /**
     * POST /api/admin/notifications
     */
    public function store(CreateNotificacaoRequest $request)
    {
        $data = $request->validated();
        $notificacao = $this->service->criar(
            (int) $data['id_usuario'],
            $data['tipo'],
            $data['titulo'],
            $data['mensagem'],
            $data['link'] ?? null,
        );

        return response()->json(['data' => $notificacao], 201);
    }
}
