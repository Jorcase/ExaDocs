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
        Schema::create('notificaciones', function (Blueprint $table) {
            $table->id();
            // Destinatario de la notificación
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            // Quién generó la acción (opcional)
            $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            // Archivo asociado (opcional)
            $table->foreignId('archivo_id')->nullable()->constrained('archivos')->nullOnDelete();
            // Tipo de evento (aprobado, rechazado, comentario, valoracion, reporte, etc.)
            $table->string('tipo', 50);
            $table->string('titulo');
            $table->text('mensaje')->nullable();
            // Detalles adicionales flexibles (estado nuevo, comentario, puntaje, etc.)
            $table->json('data')->nullable();
            $table->timestamp('leido_en')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notificaciones');
    }
};
