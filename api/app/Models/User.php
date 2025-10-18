<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * @property int $id_usuario
 * @property string $nome
 * @property string $email
 * @property string $senha_hash
 * @property string|null $telefone
 * @property string|null $documento
 * @property \Illuminate\Support\Carbon|null $data_nascimento
 * @property string $papel
 * @property string $status
 * @property \Illuminate\Support\Carbon $criado_em
 * @property \Illuminate\Support\Carbon $atualizado_em
 * @property mixed $name
 * @property mixed $password
 * @property mixed $role
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection<int, \Illuminate\Notifications\DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Laravel\Sanctum\PersonalAccessToken> $tokens
 * @property-read int|null $tokens_count
 * @method static \Illuminate\Database\Eloquent\Builder|User ativos()
 * @method static \Database\Factories\UserFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder|User newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|User newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|User papel($papel)
 * @method static \Illuminate\Database\Eloquent\Builder|User query()
 * @method static \Illuminate\Database\Eloquent\Builder|User whereAtualizadoEm($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereCriadoEm($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereDataNascimento($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereDocumento($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereIdUsuario($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereNome($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User wherePapel($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereSenhaHash($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereTelefone($value)
 * @mixin \Eloquent
 */
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
