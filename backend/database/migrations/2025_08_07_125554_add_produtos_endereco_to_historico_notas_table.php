<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('historico_notas', function (Blueprint $table) {
            $table->json('produtos')->nullable()->after('valor_total');
            $table->text('endereco')->nullable()->after('produtos');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Não faz nada para evitar erros se as colunas não existirem
    }
};
