<?php

namespace Database\Seeders;

use App\Models\TipoCarrera;
use Illuminate\Database\Seeder;

class TipoCarreraSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tipos = [
            ['nombre' => 'Pregrado', 'descripcion' => 'Carreras de pregrado (ej. tecnicaturas).'],
            ['nombre' => 'Grado', 'descripcion' => 'Carreras de grado (ej. licenciaturas, profesorados, ingenierías).'],
            ['nombre' => 'Postgrado', 'descripcion' => 'Carreras y especializaciones de postgrado.'],
        ];

        foreach ($tipos as $tipo) {
            TipoCarrera::firstOrCreate(
                ['nombre' => $tipo['nombre']],
                $tipo
            );
        }
    }
}
