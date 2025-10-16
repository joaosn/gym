<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SessaoPersonal extends Model
{
    use HasFactory;

    protected $table = 'sessoes_personal';
    protected $primaryKey = 'id_sessao_personal';
    
    const CREATED_AT = 'criado_em';
    const UPDATED_AT = 'atualizado_em';

    protected $fillable = [
        'id_instrutor',
        'id_usuario',
        'id_quadra',
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

    // Relacionamentos
    public function instrutor()
    {
        return $this->belongsTo(Instrutor::class, 'id_instrutor', 'id_instrutor');
    }

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario', 'id_usuario');
    }

    public function quadra()
    {
        return $this->belongsTo(Quadra::class, 'id_quadra', 'id_quadra');
    }

    // Scopes
    public function scopePendente($query)
    {
        return $query->where('status', 'pendente');
    }

    public function scopeConfirmada($query)
    {
        return $query->where('status', 'confirmada');
    }

    public function scopeFuturas($query)
    {
        return $query->where('inicio', '>', \Carbon\Carbon::now());
    }

    public function scopePassadas($query)
    {
        return $query->where('fim', '<', \Carbon\Carbon::now());
    }
}
