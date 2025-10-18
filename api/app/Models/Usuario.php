<?php

namespace App\Models;

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
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection<int, \Illuminate\Notifications\DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Laravel\Sanctum\PersonalAccessToken> $tokens
 * @property-read int|null $tokens_count
 * @method static \Illuminate\Database\Eloquent\Builder|Usuario newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Usuario newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Usuario query()
 * @method static \Illuminate\Database\Eloquent\Builder|Usuario whereAtualizadoEm($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Usuario whereCriadoEm($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Usuario whereDataNascimento($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Usuario whereDocumento($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Usuario whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Usuario whereIdUsuario($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Usuario whereNome($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Usuario wherePapel($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Usuario whereSenhaHash($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Usuario whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Usuario whereTelefone($value)
 * @mixin \Eloquent
 */
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
