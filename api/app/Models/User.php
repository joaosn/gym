<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    // Mapear para tabela usuarios do PostgreSQL
    protected $table = 'usuarios';
    protected $primaryKey = 'id_usuario';
    public $incrementing = true;
    protected $keyType = 'int';
    
    const CREATED_AT = 'criado_em';
    const UPDATED_AT = 'atualizado_em';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
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

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'senha_hash',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'data_nascimento' => 'date',
        'criado_em' => 'datetime',
        'atualizado_em' => 'datetime',
    ];
    
    /**
     * The attributes that should be ignored (não existem no banco)
     *
     * @var array<int, string>
     */
    protected $guarded = [];
    
    /**
     * Prevent Laravel from using email_verified_at
     */
    public function hasVerifiedEmail()
    {
        return true; // Sempre considerar verificado
    }
    
    /**
     * Override para Sanctum usar o campo correto de senha
     */
    public function getAuthPassword()
    {
        return $this->senha_hash;
    }
    
    /**
     * Mapear atributo 'name' para coluna 'nome'
     */
    public function getNameAttribute()
    {
        return $this->nome;
    }
    
    public function setNameAttribute($value)
    {
        $this->attributes['nome'] = $value;
    }
    
    /**
     * Mapear atributo 'password' para coluna 'senha_hash'
     */
    public function getPasswordAttribute()
    {
        return $this->senha_hash;
    }
    
    public function setPasswordAttribute($value)
    {
        $this->attributes['senha_hash'] = $value;
    }
    
    /**
     * Mapear atributo 'role' para coluna 'papel'
     */
    public function getRoleAttribute()
    {
        return $this->papel;
    }
    
    public function setRoleAttribute($value)
    {
        $this->attributes['papel'] = $value;
    }
    
    /**
     * Scopes
     */
    public function scopeAtivos($query)
    {
        return $query->where('status', 'ativo');
    }
    
    public function scopePapel($query, $papel)
    {
        return $query->where('papel', $papel);
    }
}
