<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HorarioAula extends Model
{
    use HasFactory;

    protected $table = 'horarios_aula';
    protected $primaryKey = 'id_horario_aula';
    public $timestamps = true;
    const CREATED_AT = 'criado_em';
    const UPDATED_AT = 'atualizado_em';

    protected $fillable = [
        'id_aula',
        'id_instrutor',
        'id_quadra',
        'dia_semana',
        'hora_inicio',
    ];

    protected $casts = [
        'id_aula' => 'integer',
        'id_instrutor' => 'integer',
        'id_quadra' => 'integer',
        'dia_semana' => 'integer',
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
}
