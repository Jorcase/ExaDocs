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
            if (!Schema::hasColumn('notificaciones', 'actor_id')) {
                $table->foreignId('actor_id')->nullable()->after('user_id')->constrained('users')->nullOnDelete();
            }
            if (!Schema::hasColumn('notificaciones', 'archivo_id')) {
                $table->foreignId('archivo_id')->nullable()->after('actor_id')->constrained('archivos')->nullOnDelete();
            }
            if (!Schema::hasColumn('notificaciones', 'titulo')) {
                $table->string('titulo')->after('tipo');
            }
            if (!Schema::hasColumn('notificaciones', 'mensaje')) {
                $table->text('mensaje')->nullable()->after('titulo');
            }
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
