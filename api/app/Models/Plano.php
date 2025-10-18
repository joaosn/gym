<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id_plano
 * @property string $nome
 * @property string $preco
 * @property string $ciclo_cobranca
 * @property int $max_reservas_futuras
 * @property array|null $beneficios_json
 * @property string $status
 * @property \Illuminate\Support\Carbon $criado_em
 * @property \Illuminate\Support\Carbon $atualizado_em
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Assinatura> $assinaturas
 * @property-read int|null $assinaturas_count
 * @property-read mixed $ciclo_formatado
 * @property-read mixed $preco_formatado
 * @method static \Illuminate\Database\Eloquent\Builder|Plano ativos()
 * @method static \Illuminate\Database\Eloquent\Builder|Plano ciclo($ciclo)
 * @method static \Illuminate\Database\Eloquent\Builder|Plano newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Plano newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Plano query()
 * @method static \Illuminate\Database\Eloquent\Builder|Plano whereAtualizadoEm($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Plano whereBeneficiosJson($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Plano whereCicloCobranca($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Plano whereCriadoEm($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Plano whereIdPlano($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Plano whereMaxReservasFuturas($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Plano whereNome($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Plano wherePreco($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Plano whereStatus($value)
 * @mixin \Eloquent
 */
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
