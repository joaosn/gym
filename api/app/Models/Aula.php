<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Aula extends Model
{
    use HasFactory;

    protected $table = 'aulas';
    protected $primaryKey = 'id_aula';
    public $timestamps = true;
    const CREATED_AT = 'criado_em';
    const UPDATED_AT = 'atualizado_em';

    protected $fillable = [
        'nome',
        'esporte',
        'nivel',
        'duracao_min',
        'capacidade_max',
        'preco_unitario',
        'descricao',
        'requisitos',
        'status',
    ];

    protected $casts = [
        'duracao_min' => 'integer',
        'capacidade_max' => 'integer',
        'preco_unitario' => 'decimal:2',
        'criado_em' => 'datetime',
        'atualizado_em' => 'datetime',
    ];

    // Relacionamentos
    public function horarios()
    {
        return $this->hasMany(HorarioAula::class, 'id_aula', 'id_aula');
    }

    public function ocorrencias()
    {
        return $this->hasMany(OcorrenciaAula::class, 'id_aula', 'id_aula');
    }

    public function inscricoes()
    {
        return $this->hasMany(InscricaoAula::class, 'id_aula', 'id_aula');
    }
}
