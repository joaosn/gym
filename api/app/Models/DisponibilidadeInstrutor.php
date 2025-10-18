<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id_disponibilidade
 * @property int $id_instrutor
 * @property int $dia_semana
 * @property string $hora_inicio
 * @property string $hora_fim
 * @property bool $disponivel
 * @property-read string $dia_semana_texto
 * @property-read \App\Models\Instrutor $instrutor
 * @method static \Illuminate\Database\Eloquent\Builder|DisponibilidadeInstrutor newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|DisponibilidadeInstrutor newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|DisponibilidadeInstrutor query()
 * @method static \Illuminate\Database\Eloquent\Builder|DisponibilidadeInstrutor whereDiaSemana($value)
 * @method static \Illuminate\Database\Eloquent\Builder|DisponibilidadeInstrutor whereDisponivel($value)
 * @method static \Illuminate\Database\Eloquent\Builder|DisponibilidadeInstrutor whereHoraFim($value)
 * @method static \Illuminate\Database\Eloquent\Builder|DisponibilidadeInstrutor whereHoraInicio($value)
 * @method static \Illuminate\Database\Eloquent\Builder|DisponibilidadeInstrutor whereIdDisponibilidade($value)
 * @method static \Illuminate\Database\Eloquent\Builder|DisponibilidadeInstrutor whereIdInstrutor($value)
 * @mixin \Eloquent
 */
class DisponibilidadeInstrutor extends Model
{
    use HasFactory;

    protected $table = 'disponibilidade_instrutor';
    protected $primaryKey = 'id_disponibilidade';
    public $incrementing = true;
    protected $keyType = 'int';
    
    // Não tem timestamps nesta tabela
    public $timestamps = false;

    protected $fillable = [
        'id_instrutor',
        'dia_semana',
        'hora_inicio',
        'hora_fim',
        'disponivel',
    ];

    protected $casts = [
        'dia_semana' => 'integer',
        'disponivel' => 'boolean',
    ];

    /**
     * Relacionamento com Instrutor (N:1)
     */
    public function instrutor(): BelongsTo
    {
        return $this->belongsTo(Instrutor::class, 'id_instrutor', 'id_instrutor');
    }

    /**
     * Accessor para retornar nome do dia da semana
     */
    public function getDiaSemanaTextoAttribute(): string
    {
        $dias = [
            1 => 'Segunda',
            2 => 'Terça',
            3 => 'Quarta',
            4 => 'Quinta',
            5 => 'Sexta',
            6 => 'Sábado',
            7 => 'Domingo',
        ];

        return $dias[$this->dia_semana] ?? 'Desconhecido';
    }
}
