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
        Schema::create('archivos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('materia_id')->constrained('materias')->cascadeOnDelete();
            $table->foreignId('tipo_archivo_id')->constrained('tipos_archivos')->cascadeOnDelete();
            $table->foreignId('plan_estudio_id')->nullable()->constrained('plan_estudios')->nullOnDelete();
            $table->foreignId('estado_archivo_id')->constrained('estados_archivo')->cascadeOnDelete();
            $table->string('titulo', 150);
            $table->text('descripcion')->nullable();
            $table->string('file_path', 255);
            $table->unsignedBigInteger('peso_bytes')->nullable();
            $table->json('metadata')->nullable();
            $table->text('observaciones_admin')->nullable();
            $table->timestamp('publicado_en')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('archivos');
    }
};
