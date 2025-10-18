<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id_sessao_personal
 * @property int $id_instrutor
 * @property int $id_usuario
 * @property int|null $id_quadra
 * @property \Illuminate\Support\Carbon $inicio
 * @property \Illuminate\Support\Carbon $fim
 * @property string|null $periodo
 * @property string $preco_total
 * @property string $status
 * @property string|null $observacoes
 * @property \Illuminate\Support\Carbon $criado_em
 * @property \Illuminate\Support\Carbon $atualizado_em
 * @property-read \App\Models\Instrutor $instrutor
 * @property-read \App\Models\Quadra|null $quadra
 * @property-read \App\Models\Usuario $usuario
 * @method static \Illuminate\Database\Eloquent\Builder|SessaoPersonal confirmada()
 * @method static \Illuminate\Database\Eloquent\Builder|SessaoPersonal futuras()
 * @method static \Illuminate\Database\Eloquent\Builder|SessaoPersonal newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|SessaoPersonal newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|SessaoPersonal passadas()
 * @method static \Illuminate\Database\Eloquent\Builder|SessaoPersonal pendente()
 * @method static \Illuminate\Database\Eloquent\Builder|SessaoPersonal query()
 * @method static \Illuminate\Database\Eloquent\Builder|SessaoPersonal whereAtualizadoEm($value)
 * @method static \Illuminate\Database\Eloquent\Builder|SessaoPersonal whereCriadoEm($value)
 * @method static \Illuminate\Database\Eloquent\Builder|SessaoPersonal whereFim($value)
 * @method static \Illuminate\Database\Eloquent\Builder|SessaoPersonal whereIdInstrutor($value)
 * @method static \Illuminate\Database\Eloquent\Builder|SessaoPersonal whereIdQuadra($value)
 * @method static \Illuminate\Database\Eloquent\Builder|SessaoPersonal whereIdSessaoPersonal($value)
 * @method static \Illuminate\Database\Eloquent\Builder|SessaoPersonal whereIdUsuario($value)
 * @method static \Illuminate\Database\Eloquent\Builder|SessaoPersonal whereInicio($value)
 * @method static \Illuminate\Database\Eloquent\Builder|SessaoPersonal whereObservacoes($value)
 * @method static \Illuminate\Database\Eloquent\Builder|SessaoPersonal wherePeriodo($value)
 * @method static \Illuminate\Database\Eloquent\Builder|SessaoPersonal wherePrecoTotal($value)
 * @method static \Illuminate\Database\Eloquent\Builder|SessaoPersonal whereStatus($value)
 * @mixin \Eloquent
 */
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

    public function reservaQuadra()
    {
        return $this->hasOne(ReservaQuadra::class, 'id_sessao_personal', 'id_sessao_personal');
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
