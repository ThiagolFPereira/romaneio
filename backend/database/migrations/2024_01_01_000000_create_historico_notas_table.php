<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration para criar a tabela de histórico de notas fiscais
 * Armazena os dados das notas consultadas para fins de histórico
 */
return new class extends Migration
{
    /**
     * Executa as migrações
     */
    public function up(): void
    {
        Schema::create('historico_notas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade')->comment('ID do usuário que salvou a nota');
            $table->string('chave_acesso', 44)->unique()->comment('Chave de acesso da nota fiscal (44 dígitos)');
            $table->string('destinatario')->comment('Nome do destinatário da nota fiscal');
            $table->decimal('valor_total', 10, 2)->comment('Valor total da nota fiscal');
            $table->timestamps();
        });
    }

    /**
     * Reverte as migrações
     */
    public function down(): void
    {
        Schema::dropIfExists('historico_notas');
    }
}; 