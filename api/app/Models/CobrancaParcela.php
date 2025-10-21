<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CobrancaParcela extends Model
{
    protected $table = 'cobranca_parcelas';
    protected $primaryKey = 'id_parcela';

    const CREATED_AT = 'criado_em';
    const UPDATED_AT = 'atualizado_em';

    protected $fillable = [
        'id_cobranca',
        'numero_parcela',
        'total_parcelas',
        'valor',
        'valor_pago',
        'status',
        'vencimento',
        'pago_em',
    ];

    protected $casts = [
        'numero_parcela' => 'integer',
        'total_parcelas' => 'integer',
        'valor' => 'decimal:2',
        'valor_pago' => 'decimal:2',
        'vencimento' => 'date',
        'pago_em' => 'datetime',
        'criado_em' => 'datetime',
        'atualizado_em' => 'datetime',
    ];

    // Relacionamentos
    public function cobranca()
    {
        return $this->belongsTo(Cobranca::class, 'id_cobranca', 'id_cobranca');
    }

    public function pagamentos()
    {
        return $this->hasMany(Pagamento::class, 'id_parcela', 'id_parcela');
    }

    // Método auxiliar
    public function estaPaga(): bool
    {
        return $this->status === 'pago';
    }

    public function estaVencida(): bool
    {
        return $this->status === 'pendente' && $this->vencimento < now();
    }
}
