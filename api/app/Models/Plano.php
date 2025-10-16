<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Plano extends Model
{
    use HasFactory;

    protected $table = 'planos';
    protected $primaryKey = 'id_plano';
    
    const CREATED_AT = 'criado_em';
    const UPDATED_AT = 'atualizado_em';

    protected $fillable = [
        'nome',
        'preco',
        'ciclo_cobranca',
        'max_reservas_futuras',
        'beneficios_json',
        'status',
    ];

    protected $casts = [
        'preco' => 'decimal:2',
        'max_reservas_futuras' => 'integer',
        'beneficios_json' => 'array',
        'criado_em' => 'datetime',
        'atualizado_em' => 'datetime',
    ];

    protected $attributes = [
        'status' => 'ativo',
        'max_reservas_futuras' => 2,
    ];

    // Scopes
    public function scopeAtivos($query)
    {
        return $query->where('status', 'ativo');
    }

    public function scopeCiclo($query, $ciclo)
    {
        return $query->where('ciclo_cobranca', $ciclo);
    }

    // Relationships
    public function assinaturas()
    {
        return $this->hasMany(Assinatura::class, 'id_plano', 'id_plano');
    }

    // Accessors
    public function getPrecoFormatadoAttribute()
    {
        return 'R$ ' . number_format($this->preco, 2, ',', '.');
    }

    public function getCicloFormatadoAttribute()
    {
        $ciclos = [
            'mensal' => 'Mensal',
            'trimestral' => 'Trimestral',
            'semestral' => 'Semestral',
            'anual' => 'Anual',
        ];
        return $ciclos[$this->ciclo_cobranca] ?? $this->ciclo_cobranca;
    }
}
