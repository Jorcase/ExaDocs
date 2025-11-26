<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_profiles', function (Blueprint $table) {
            $table->string('nombre_completo')->nullable()->after('user_id');
            $table->boolean('perfil_completo')->default(false)->after('bio');
            $table->timestamp('perfil_completado_en')->nullable()->after('perfil_completo');
        });
    }

    public function down(): void
    {
        Schema::table('user_profiles', function (Blueprint $table) {
            $table->dropColumn(['nombre_completo', 'perfil_completo', 'perfil_completado_en']);
        });
    }
};
