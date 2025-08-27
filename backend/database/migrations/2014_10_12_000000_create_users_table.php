<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration para criar a tabela de usuários
 * Tabela padrão do Laravel para autenticação
 */
return new class extends Migration
{
    /**
     * Executa as migrações
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();
            $table->timestamps();
        });
    }

    /**
     * Reverte as migrações
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
}; 