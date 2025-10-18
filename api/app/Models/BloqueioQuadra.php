<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id_bloqueio_quadra
 * @property int $id_quadra
 * @property string $inicio
 * @property string $fim
 * @property string|null $motivo
 * @property \Illuminate\Support\Carbon $criado_em
 * @method static \Illuminate\Database\Eloquent\Builder|BloqueioQuadra newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|BloqueioQuadra newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|BloqueioQuadra query()
 * @method static \Illuminate\Database\Eloquent\Builder|BloqueioQuadra whereCriadoEm($value)
 * @method static \Illuminate\Database\Eloquent\Builder|BloqueioQuadra whereFim($value)
 * @method static \Illuminate\Database\Eloquent\Builder|BloqueioQuadra whereIdBloqueioQuadra($value)
 * @method static \Illuminate\Database\Eloquent\Builder|BloqueioQuadra whereIdQuadra($value)
 * @method static \Illuminate\Database\Eloquent\Builder|BloqueioQuadra whereInicio($value)
 * @method static \Illuminate\Database\Eloquent\Builder|BloqueioQuadra whereMotivo($value)
 * @mixin \Eloquent
 */
class BloqueioQuadra extends Model
{
    protected $table = 'bloqueios_quadra';
    protected $primaryKey = 'id_bloqueio_quadra';
    public $incrementing = true;
    protected $keyType = 'int';

    const CREATED_AT = 'criado_em';
    const UPDATED_AT = null; // tabela não tem atualizado_em

    protected $fillable = [
        'id_quadra',
        'inicio',
        'fim',
        'motivo',
    ];
}
