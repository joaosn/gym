<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pagamento extends Model
{
    protected $table = 'pagamentos';
    protected $primaryKey = 'id_pagamento';

    const CREATED_AT = 'criado_em';
    const UPDATED_AT = 'atualizado_em';

    protected $fillable = [
        'id_parcela',
        'provedor',
        'metodo',
        'id_transacao_ext',
        'id_pagamento_ext',
        'valor',
        'status',
        'url_checkout',
        'qr_code',
        'payload_json',
        'erro_mensagem',
        'aprovado_em',
        'expirado_em',
    ];

    protected $casts = [
        'valor' => 'decimal:2',
        'payload_json' => 'array',
        'aprovado_em' => 'datetime',
        'expirado_em' => 'datetime',
        'criado_em' => 'datetime',
        'atualizado_em' => 'datetime',
    ];

    // Relacionamentos
    public function parcela()
    {
        return $this->belongsTo(CobrancaParcela::class, 'id_parcela', 'id_parcela');
    }

    public function webhooks()
    {
        return $this->hasMany(WebhookPagamento::class, 'id_pagamento', 'id_pagamento');
    }

    // Métodos auxiliares
    public function estaAprovado(): bool
    {
        return $this->status === 'aprovado';
    }

    public function estaExpirado(): bool
    {
        return $this->expirado_em && $this->expirado_em < now();
    }

    public function podeSerCancelado(): bool
    {
        return in_array($this->status, ['pendente', 'processando']);
    }
}
