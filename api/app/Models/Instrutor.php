<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
