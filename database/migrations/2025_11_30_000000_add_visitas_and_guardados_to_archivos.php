<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('archivos', function (Blueprint $table) {
            $table->unsignedBigInteger('visitas_count')->default(0)->after('publicado_en');
        });

        Schema::create('archivo_user_saved', function (Blueprint $table) {
            $table->id();
            $table->foreignId('archivo_id')->constrained('archivos')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['archivo_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('archivo_user_saved');

        Schema::table('archivos', function (Blueprint $table) {
            $table->dropColumn('visitas_count');
        });
    }
};
