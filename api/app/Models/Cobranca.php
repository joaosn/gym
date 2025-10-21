<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cobranca extends Model
{
    protected $table = 'cobrancas';
    protected $primaryKey = 'id_cobranca';

    const CREATED_AT = 'criado_em';
    const UPDATED_AT = 'atualizado_em';

    protected $fillable = [
        'id_usuario',
        'referencia_tipo',
        'referencia_id',
        'valor_total',
        'valor_pago',
        'moeda',
        'status',
        'descricao',
        'vencimento',
        'observacoes',
    ];

    protected $casts = [
        'valor_total' => 'decimal:2',
        'valor_pago' => 'decimal:2',
        'vencimento' => 'date',
        'criado_em' => 'datetime',
        'atualizado_em' => 'datetime',
    ];

    // Relacionamentos
    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario', 'id_usuario');
    }

    public function parcelas()
    {
        return $this->hasMany(CobrancaParcela::class, 'id_cobranca', 'id_cobranca');
    }

    // Métodos auxiliares para pegar referência
    public function assinatura()
    {
        if ($this->referencia_tipo === 'assinatura') {
            return Assinatura::find($this->referencia_id);
        }
        return null;
    }

    public function reservaQuadra()
    {
        if ($this->referencia_tipo === 'reserva_quadra') {
            return ReservaQuadra::find($this->referencia_id);
        }
        return null;
    }

    public function sessaoPersonal()
    {
        if ($this->referencia_tipo === 'sessao_personal') {
            return SessaoPersonal::find($this->referencia_id);
        }
        return null;
    }

    public function inscricaoAula()
    {
        if ($this->referencia_tipo === 'inscricao_aula') {
            return InscricaoAula::find($this->referencia_id);
        }
        return null;
    }
}
