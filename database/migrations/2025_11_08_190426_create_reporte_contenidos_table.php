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
        Schema::create('reporte_contenidos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('archivo_id')->constrained('archivos')->cascadeOnDelete();
            $table->foreignId('reportante_id')->constrained('users')->cascadeOnDelete();
            $table->enum('motivo', ['spam', 'contenido_incorrecto', 'copyright', 'otro']);
            $table->text('detalle')->nullable();
            $table->enum('estado', ['pendiente', 'en_revision', 'resuelto'])->default('pendiente');
            $table->foreignId('resuelto_por')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('resuelto_en')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reporte_contenidos');
    }
};
