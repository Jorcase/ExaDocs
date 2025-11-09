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
        Schema::create('plan_estudios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('carrera_id')->constrained('carreras')->cascadeOnDelete();
            $table->string('nombre', 150);
            $table->year('anio_plan');
            $table->enum('estado', ['vigente', 'no_vigente', 'discontinuado'])->default('vigente');
            $table->date('vigente_desde')->nullable();
            $table->date('vigente_hasta')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plan_estudios');
    }
};
