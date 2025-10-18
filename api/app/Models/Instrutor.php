<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id_instrutor
 * @property int|null $id_usuario
 * @property string $nome
 * @property string|null $email
 * @property string|null $telefone
 * @property string|null $cref
 * @property string|null $valor_hora
 * @property array|null $especialidades_json
 * @property string|null $bio
 * @property string $status
 * @property \Illuminate\Support\Carbon $criado_em
 * @property \Illuminate\Support\Carbon $atualizado_em
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\DisponibilidadeInstrutor> $disponibilidades
 * @property-read int|null $disponibilidades_count
 * @property-read \App\Models\User|null $usuario
 * @method static \Illuminate\Database\Eloquent\Builder|Instrutor ativos()
 * @method static \Illuminate\Database\Eloquent\Builder|Instrutor comEspecialidade(string $especialidade)
 * @method static \Illuminate\Database\Eloquent\Builder|Instrutor newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Instrutor newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Instrutor query()
 * @method static \Illuminate\Database\Eloquent\Builder|Instrutor whereAtualizadoEm($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Instrutor whereBio($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Instrutor whereCref($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Instrutor whereCriadoEm($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Instrutor whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Instrutor whereEspecialidadesJson($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Instrutor whereIdInstrutor($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Instrutor whereIdUsuario($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Instrutor whereNome($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Instrutor whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Instrutor whereTelefone($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Instrutor whereValorHora($value)
 * @mixin \Eloquent
 */
class Instrutor extends Model
{
    use HasFactory;

    protected $table = 'instrutores';
    protected $primaryKey = 'id_instrutor';
    public $incrementing = true;
    protected $keyType = 'int';
    
    const CREATED_AT = 'criado_em';
    const UPDATED_AT = 'atualizado_em';

    protected $fillable = [
        'id_usuario',
        'nome',
        'email',
        'telefone',
        'cref',
        'valor_hora',
        'especialidades_json',
        'bio',
        'status',
    ];

    protected $casts = [
        'valor_hora' => 'decimal:2',
        'especialidades_json' => 'array',
        'criado_em' => 'datetime',
        'atualizado_em' => 'datetime',
    ];

    /**
     * Relacionamento com Usuario (1:1)
     */
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_usuario', 'id_usuario');
    }

    /**
     * Relacionamento com DisponibilidadeInstrutor (1:N)
     */
    public function disponibilidades(): HasMany
    {
        return $this->hasMany(DisponibilidadeInstrutor::class, 'id_instrutor', 'id_instrutor');
    }

    /**
     * Scopes
     */
    public function scopeAtivos($query)
    {
        return $query->where('status', 'ativo');
    }

    public function scopeComEspecialidade($query, string $especialidade)
    {
        return $query->whereJsonContains('especialidades_json', $especialidade);
    }
}
