<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WebhookPagamento extends Model
{
    protected $table = 'webhooks_pagamento';
    protected $primaryKey = 'id_webhook';

    const CREATED_AT = 'criado_em';
    const UPDATED_AT = null; // Não tem updated_at

    public $timestamps = false;

    protected $fillable = [
        'id_pagamento',
        'provedor',
        'tipo_evento',
        'id_evento_externo',
        'payload_json',
        'processado',
        'processado_em',
    ];

    protected $casts = [
        'payload_json' => 'array',
        'processado' => 'boolean',
        'processado_em' => 'datetime',
        'criado_em' => 'datetime',
    ];

    // Relacionamento
    public function pagamento()
    {
        return $this->belongsTo(Pagamento::class, 'id_pagamento', 'id_pagamento');
    }

    // Método auxiliar
    public function marcarProcessado()
    {
        $this->update([
            'processado' => true,
            'processado_em' => now(),
        ]);
    }
}
