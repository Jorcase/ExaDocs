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
        Schema::table('notificaciones', function (Blueprint $table) {
            $table->foreignId('actor_id')->nullable()->after('user_id')->constrained('users')->nullOnDelete();
            $table->foreignId('archivo_id')->nullable()->after('actor_id')->constrained('archivos')->nullOnDelete();
            $table->string('titulo')->after('tipo');
            $table->text('mensaje')->nullable()->after('titulo');
            $table->json('data')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notificaciones', function (Blueprint $table) {
            $table->dropForeign(['actor_id']);
            $table->dropForeign(['archivo_id']);
            $table->dropColumn(['actor_id', 'archivo_id', 'titulo', 'mensaje']);
            $table->json('data')->change();
        });
    }
};
