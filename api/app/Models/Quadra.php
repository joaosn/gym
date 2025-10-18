<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id_quadra
 * @property string $nome
 * @property string $localizacao
 * @property string $esporte
 * @property string $preco_hora
 * @property array|null $caracteristicas_json
 * @property string $status
 * @property \Illuminate\Support\Carbon $criado_em
 * @property \Illuminate\Support\Carbon $atualizado_em
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\BloqueioQuadra> $bloqueios
 * @property-read int|null $bloqueios_count
 * @property-read mixed $caracteristicas
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\ReservaQuadra> $reservas
 * @property-read int|null $reservas_count
 * @method static \Illuminate\Database\Eloquent\Builder|Quadra disponiveis()
 * @method static \Illuminate\Database\Eloquent\Builder|Quadra newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Quadra newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Quadra porEsporte($esporte)
 * @method static \Illuminate\Database\Eloquent\Builder|Quadra query()
 * @method static \Illuminate\Database\Eloquent\Builder|Quadra whereAtualizadoEm($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Quadra whereCaracteristicasJson($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Quadra whereCriadoEm($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Quadra whereEsporte($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Quadra whereIdQuadra($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Quadra whereLocalizacao($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Quadra whereNome($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Quadra wherePrecoHora($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Quadra whereStatus($value)
 * @mixin \Eloquent
 */
class Quadra extends Model
{
    /**
     * Nome da tabela no banco de dados
     */
    protected $table = 'quadras';

    /**
     * Chave primária da tabela
     */
    protected $primaryKey = 'id_quadra';

    /**
     * Configuração de timestamps
     */
    const CREATED_AT = 'criado_em';
    const UPDATED_AT = 'atualizado_em';

    /**
     * Campos que podem ser preenchidos em massa
     */
    protected $fillable = [
        'nome',
        'localizacao',
        'esporte',
        'preco_hora',
        'caracteristicas_json',
        'status',
    ];

    /**
     * Campos que devem ser tratados como JSON
     */
    protected $casts = [
        'caracteristicas_json' => 'array',
        'preco_hora' => 'decimal:2',
        'criado_em' => 'datetime',
        'atualizado_em' => 'datetime',
    ];

    /**
     * Valores padrão para atributos
     */
    protected $attributes = [
        'status' => 'ativa',
        'caracteristicas_json' => '{}',
    ];

    /**
     * Relacionamento: Quadra tem muitas Reservas
     */
    public function reservas()
    {
        return $this->hasMany(ReservaQuadra::class, 'id_quadra', 'id_quadra');
    }

    /**
     * Relacionamento: Quadra tem muitos Bloqueios
     */
    public function bloqueios()
    {
        return $this->hasMany(BloqueioQuadra::class, 'id_quadra', 'id_quadra');
    }

    /**
     * Scope: Apenas quadras disponíveis
     */
    public function scopeDisponiveis($query)
    {
        return $query->where('status', 'ativa');
    }

    /**
     * Scope: Filtrar por esporte
     */
    public function scopePorEsporte($query, $esporte)
    {
        return $query->where('esporte', $esporte);
    }

    /**
     * Accessor: Retornar características como array (para garantir)
     */
    public function getCaracteristicasAttribute()
    {
        return $this->caracteristicas_json ?? [];
    }

    /**
     * Mutator: Garantir que características seja sempre um array válido
     */
    public function setCaracteristicasJsonAttribute($value)
    {
        $this->attributes['caracteristicas_json'] = is_string($value) 
            ? $value 
            : json_encode($value ?? []);
    }
}
