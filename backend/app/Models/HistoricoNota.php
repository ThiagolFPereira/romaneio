<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Model para gerenciar o histórico de notas fiscais
 * Armazena os dados das notas consultadas para fins de histórico
 */
class HistoricoNota extends Model
{
    use HasFactory;

    /**
     * A tabela associada ao model
     */
    protected $table = 'historico_notas';

    /**
     * Os atributos que são atribuíveis em massa
     */
    protected $fillable = [
        'user_id',
        'chave_acesso',
        'emitente',
        'destinatario',
        'valor_total',
        'produtos',
        'endereco',
        'numero_nota',
        'status',
        'data_emissao'
    ];

    /**
     * Os atributos que devem ser convertidos para tipos nativos
     */
    protected $casts = [
        'valor_total' => 'decimal:2',
        'produtos' => 'array',
    ];

    /**
     * Relacionamento com usuário
     * Uma nota pertence a um usuário
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
} 