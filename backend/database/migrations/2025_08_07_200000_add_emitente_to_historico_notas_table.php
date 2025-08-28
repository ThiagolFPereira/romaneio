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
            $table->string('emitente')->nullable()->after('chave_acesso')->comment('Nome do emitente da nota fiscal');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('historico_notas', function (Blueprint $table) {
            $table->dropColumn('emitente');
        });
    }
};
