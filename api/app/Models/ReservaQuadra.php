<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id_reserva_quadra
 * @property int $id_quadra
 * @property int $id_usuario
 * @property \Illuminate\Support\Carbon $inicio
 * @property \Illuminate\Support\Carbon $fim
 * @property string|null $periodo
 * @property string $preco_total
 * @property string $origem
 * @property string $status
 * @property string|null $observacoes
 * @property \Illuminate\Support\Carbon $criado_em
 * @property \Illuminate\Support\Carbon $atualizado_em
 * @property-read \App\Models\Quadra $quadra
 * @property-read \App\Models\User $usuario
 * @method static \Illuminate\Database\Eloquent\Builder|ReservaQuadra ativas()
 * @method static \Illuminate\Database\Eloquent\Builder|ReservaQuadra futuras()
 * @method static \Illuminate\Database\Eloquent\Builder|ReservaQuadra newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|ReservaQuadra newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|ReservaQuadra passadas()
 * @method static \Illuminate\Database\Eloquent\Builder|ReservaQuadra query()
 * @method static \Illuminate\Database\Eloquent\Builder|ReservaQuadra whereAtualizadoEm($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ReservaQuadra whereCriadoEm($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ReservaQuadra whereFim($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ReservaQuadra whereIdQuadra($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ReservaQuadra whereIdReservaQuadra($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ReservaQuadra whereIdUsuario($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ReservaQuadra whereInicio($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ReservaQuadra whereObservacoes($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ReservaQuadra whereOrigem($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ReservaQuadra wherePeriodo($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ReservaQuadra wherePrecoTotal($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ReservaQuadra whereStatus($value)
 * @mixin \Eloquent
 */
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
        'id_sessao_personal', // ← NOVO: FK para sessão personal
        'inicio',
        'fim',
        'preco_total',
        'origem',
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

    public function sessaoPersonal()
    {
        return $this->belongsTo(SessaoPersonal::class, 'id_sessao_personal', 'id_sessao_personal');
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
