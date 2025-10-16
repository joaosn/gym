<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Usuario extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $table = 'usuarios';
    protected $primaryKey = 'id_usuario';
    
    const CREATED_AT = 'criado_em';
    const UPDATED_AT = 'atualizado_em';

    protected $fillable = [
        'nome',
        'email',
        'senha_hash',
        'telefone',
        'documento',
        'data_nascimento',
        'papel',
        'status',
    ];

    protected $hidden = [
        'senha_hash',
    ];

    protected $casts = [
        'data_nascimento' => 'date',
        'criado_em' => 'datetime',
        'atualizado_em' => 'datetime',
    ];

    /**
     * Override para Sanctum usar o campo correto de senha
     */
    public function getAuthPassword()
    {
        return $this->senha_hash;
    }

    /**
     * Override para Sanctum usar o campo correto de identificador
     */
    public function getAuthIdentifierName()
    {
        return 'id_usuario';
    }

    /**
     * Verificar se o usuário é admin
     */
    public function isAdmin(): bool
    {
        return $this->papel === 'admin';
    }

    /**
     * Verificar se o usuário é aluno
     */
    public function isAluno(): bool
    {
        return $this->papel === 'aluno';
    }

    /**
     * Verificar se o usuário é personal/instrutor
     */
    public function isPersonal(): bool
    {
        return in_array($this->papel, ['personal', 'instrutor']);
    }

    /**
     * Verificar se o usuário está ativo
     */
    public function isActive(): bool
    {
        return $this->status === 'ativo';
    }
}
