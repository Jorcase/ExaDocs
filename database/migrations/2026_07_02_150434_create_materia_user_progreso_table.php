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
        Schema::create('materia_user_progreso', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('carrera_id')->constrained('carreras')->cascadeOnDelete();
            $table->foreignId('materia_id')->constrained('materias')->cascadeOnDelete();
            $table->enum('estado', ['cursando', 'regular', 'aprobada', 'promocionada', 'pendiente_actualizar']);
            $table->unsignedTinyInteger('nota')->nullable();
            $table->date('fecha')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'carrera_id', 'materia_id'], 'materia_carrera_user_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('materia_user_progreso');
    }
};
