<?php

namespace App\Http\Controllers;

use App\Models\Notificacao;
use Illuminate\Http\Request;

class NotificacaoController extends Controller
{
    /**
     * ALUNO/INSTRUTOR: Listar minhas notificações
     * GET /api/notifications
     */
    public function index(Request $request)
    {
        $lida = $request->input('lida'); // 'true', 'false', ou null (todas)

        $query = Notificacao::doUsuario(auth()->id())
            ->orderBy('criado_em', 'desc');

        if ($lida === 'false') {
            $query->naoLidas();
        } elseif ($lida === 'true') {
            $query->where('lida', true);
        }

        $notificacoes = $query->paginate(20);

        return response()->json($notificacoes, 200);
    }

    /**
     * ALUNO/INSTRUTOR: Contar não lidas
     * GET /api/notifications/unread-count
     */
    public function unreadCount()
    {
        $count = Notificacao::doUsuario(auth()->id())
            ->naoLidas()
            ->count();

        return response()->json(['count' => $count], 200);
    }

    /**
     * ALUNO/INSTRUTOR: Marcar como lida
     * PATCH /api/notifications/{id}/read
     */
    public function markAsRead($id)
    {
        $notificacao = Notificacao::doUsuario(auth()->id())
            ->findOrFail($id);

        $notificacao->marcarComoLida();

        return response()->json(['data' => $notificacao], 200);
    }

    /**
     * ALUNO/INSTRUTOR: Marcar todas como lidas
     * POST /api/notifications/mark-all-read
     */
    public function markAllAsRead()
    {
        Notificacao::doUsuario(auth()->id())
            ->naoLidas()
            ->update([
                'lida' => true,
                'data_leitura' => now(),
            ]);

        return response()->json(['message' => 'Todas as notificações foram marcadas como lidas'], 200);
    }

    /**
     * ALUNO/INSTRUTOR: Deletar notificação
     * DELETE /api/notifications/{id}
     */
    public function destroy($id)
    {
        $notificacao = Notificacao::doUsuario(auth()->id())
            ->findOrFail($id);

        $notificacao->delete();

        return response()->json(null, 204);
    }
}
