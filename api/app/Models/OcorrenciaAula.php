<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OcorrenciaAula extends Model
{
    use HasFactory;

    protected $table = 'ocorrencias_aula';
    protected $primaryKey = 'id_ocorrencia_aula';
    public $timestamps = true;
    const CREATED_AT = 'criado_em';
    const UPDATED_AT = 'atualizado_em';

    protected $fillable = [
        'id_aula',
        'id_instrutor',
        'id_quadra',
        'inicio',
        'fim',
        'status',
    ];

    protected $casts = [
        'id_aula' => 'integer',
        'id_instrutor' => 'integer',
        'id_quadra' => 'integer',
        'inicio' => 'datetime',
        'fim' => 'datetime',
        'criado_em' => 'datetime',
        'atualizado_em' => 'datetime',
    ];

    // Relacionamentos
    public function aula()
    {
        return $this->belongsTo(Aula::class, 'id_aula', 'id_aula');
    }

    public function instrutor()
    {
        return $this->belongsTo(Instrutor::class, 'id_instrutor', 'id_instrutor');
    }

    public function quadra()
    {
        return $this->belongsTo(Quadra::class, 'id_quadra', 'id_quadra');
    }

    public function inscricoes()
    {
        return $this->hasMany(InscricaoAula::class, 'id_ocorrencia_aula', 'id_ocorrencia_aula');
    }

    /**
     * Conta inscritos confirmados nesta ocorrência
     */
    public function getNumeroInscritosAttribute(): int
    {
        return $this->inscricoes()->where('status', 'inscrito')->count();
    }

    /**
     * Verifica se a ocorrência está cheia
     */
    public function isCheiaAttribute(): bool
    {
        return $this->numero_inscritos >= $this->aula->capacidade_max;
    }
}
