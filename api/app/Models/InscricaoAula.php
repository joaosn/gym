<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InscricaoAula extends Model
{
    use HasFactory;

    protected $table = 'inscricoes_aula';
    protected $primaryKey = 'id_inscricao_aula';
    public $timestamps = true;
    const CREATED_AT = 'criado_em';
    const UPDATED_AT = 'atualizado_em';

    protected $fillable = [
        'id_ocorrencia_aula',
        'id_aula',
        'id_usuario',
        'status',
    ];

    protected $casts = [
        'id_ocorrencia_aula' => 'integer',
        'id_aula' => 'integer',
        'id_usuario' => 'integer',
        'criado_em' => 'datetime',
        'atualizado_em' => 'datetime',
    ];

    // Relacionamentos
    public function ocorrencia()
    {
        return $this->belongsTo(OcorrenciaAula::class, 'id_ocorrencia_aula', 'id_ocorrencia_aula');
    }

    public function aula()
    {
        return $this->belongsTo(Aula::class, 'id_aula', 'id_aula');
    }

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario', 'id_usuario');
    }
}
