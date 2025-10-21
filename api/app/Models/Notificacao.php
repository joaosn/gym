<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notificacao extends Model
{
    protected $table = 'notificacoes';
    protected $primaryKey = 'id_notificacao';

    const CREATED_AT = 'criado_em';
    const UPDATED_AT = null; // Tabela não tem updated_at

    protected $fillable = [
        'id_usuario',
        'tipo',
        'titulo',
        'mensagem',
        'lida',
        'data_leitura',
        'link',
    ];

    protected $casts = [
        'lida' => 'boolean',
        'data_leitura' => 'datetime',
        'criado_em' => 'datetime',
    ];

    /**
     * Relacionamento com Usuário
     */
    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario', 'id_usuario');
    }

    /**
     * Marcar como lida
     */
    public function marcarComoLida(): void
    {
        if (!$this->lida) {
            $this->update([
                'lida' => true,
                'data_leitura' => now(),
            ]);
        }
    }

    /**
     * Marcar como não lida
     */
    public function marcarComoNaoLida(): void
    {
        $this->update([
            'lida' => false,
            'data_leitura' => null,
        ]);
    }

    /**
     * Escopo: Não lidas
     */
    public function scopeNaoLidas($query)
    {
        return $query->where('lida', false);
    }

    /**
     * Escopo: Do usuário
     */
    public function scopeDoUsuario($query, int $idUsuario)
    {
        return $query->where('id_usuario', $idUsuario);
    }
}
