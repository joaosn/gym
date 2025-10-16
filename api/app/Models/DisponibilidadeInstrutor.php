<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
