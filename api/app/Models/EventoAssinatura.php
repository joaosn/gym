<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id_evento_assinatura
 * @property int $id_assinatura
 * @property string $tipo
 * @property array|null $payload_json
 * @property \Illuminate\Support\Carbon $criado_em
 */
class EventoAssinatura extends Model
{
    protected $table = 'eventos_assinatura';
    protected $primaryKey = 'id_evento_assinatura';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false; // Apenas criado_em

    const CREATED_AT = 'criado_em';
    const UPDATED_AT = null;

    protected $fillable = [
        'id_assinatura',
        'tipo',
        'payload_json',
    ];

    protected $casts = [
        'payload_json' => 'array',
        'criado_em' => 'datetime',
    ];

    // Relacionamento
    public function assinatura()
    {
        return $this->belongsTo(Assinatura::class, 'id_assinatura', 'id_assinatura');
    }
}
