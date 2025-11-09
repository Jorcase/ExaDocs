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
        Schema::create('plan_materia', function (Blueprint $table) {
            $table->id();
            $table->foreignId('plan_id')->constrained('plan_estudios')->cascadeOnDelete();
            $table->foreignId('materia_id')->constrained('materias')->cascadeOnDelete();
            $table->enum('tipo_asignatura', ['obligatoria', 'optativa', 'taller'])->default('obligatoria');
            $table->json('correlativas')->nullable();
            $table->timestamps();
            $table->unique(['plan_id', 'materia_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plan_materia');
    }
};
