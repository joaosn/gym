<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReservaQuadra extends Model
{
    protected $table = 'reservas_quadra';
    protected $primaryKey = 'id_reserva_quadra';
    public $timestamps = true;

    const CREATED_AT = 'criado_em';
    const UPDATED_AT = 'atualizado_em';

    protected $fillable = [
        'id_quadra',
        'id_usuario',
        'inicio',
        'fim',
        'preco_total',
        'status',
        'observacoes',
    ];

    protected $casts = [
        'inicio' => 'datetime',
        'fim' => 'datetime',
        'preco_total' => 'decimal:2',
        'criado_em' => 'datetime',
        'atualizado_em' => 'datetime',
    ];

    // Relationships
    public function quadra()
    {
        return $this->belongsTo(Quadra::class, 'id_quadra', 'id_quadra');
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'id_usuario', 'id_usuario');
    }

    // Scopes
    public function scopeAtivas($query)
    {
        return $query->whereIn('status', ['pendente', 'confirmada']);
    }

    public function scopeFuturas($query)
    {
        return $query->where('inicio', '>=', \Carbon\Carbon::now());
    }

    public function scopePassadas($query)
    {
        return $query->where('fim', '<', \Carbon\Carbon::now());
    }
}
