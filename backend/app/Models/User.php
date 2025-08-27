<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * Model para gerenciar usuários do sistema
 * Utiliza Laravel Sanctum para autenticação via API
 */
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Os atributos que são atribuíveis em massa
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * Os atributos que devem ser escondidos para arrays
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Os atributos que devem ser convertidos para tipos nativos
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * Relacionamento com histórico de notas
     * Um usuário pode ter várias notas no histórico
     */
    public function historicoNotas()
    {
        return $this->hasMany(HistoricoNota::class);
    }
} 