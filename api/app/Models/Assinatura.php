<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id_assinatura
 * @property int $id_usuario
 * @property int $id_plano
 * @property string $data_inicio
 * @property string|null $data_fim
 * @property bool $renova_automatico
 * @property string $status
 * @property string|null $proximo_vencimento
 * @property \Illuminate\Support\Carbon $criado_em
 * @property \Illuminate\Support\Carbon $atualizado_em
 * @method static \Illuminate\Database\Eloquent\Builder|Assinatura newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Assinatura newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Assinatura query()
 * @method static \Illuminate\Database\Eloquent\Builder|Assinatura whereAtualizadoEm($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Assinatura whereCriadoEm($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Assinatura whereDataFim($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Assinatura whereDataInicio($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Assinatura whereIdAssinatura($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Assinatura whereIdPlano($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Assinatura whereIdUsuario($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Assinatura whereProximoVencimento($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Assinatura whereRenovaAutomatico($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Assinatura whereStatus($value)
 * @mixin \Eloquent
 */
class Assinatura extends Model
{
    protected $table = 'assinaturas';
    protected $primaryKey = 'id_assinatura';
    public $incrementing = true;
    protected $keyType = 'int';

    const CREATED_AT = 'criado_em';
    const UPDATED_AT = 'atualizado_em';

    protected $fillable = [
        'id_usuario',
        'id_plano',
        'data_inicio',
        'data_fim',
        'renova_automatico',
        'status',
        'proximo_vencimento',
    ];
}
