<?php

namespace Database\Seeders;

use App\Models\TipoArchivo;
use Illuminate\Database\Seeder;

class TipoArchivoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tipos = [
            ['nombre' => 'Apunte / Resumen', 'descripcion' => 'Resúmenes de temas teóricos o apuntes de clase.'],
            ['nombre' => 'Parcial / Examen', 'descripcion' => 'Enunciados o resoluciones de exámenes parciales.'],
            ['nombre' => 'Final', 'descripcion' => 'Enunciados o resoluciones de exámenes finales.'],
            ['nombre' => 'Práctica / TP', 'descripcion' => 'Guías de trabajos prácticos o ejercicios resueltos.'],
            ['nombre' => 'Libro / Apunte de cátedra', 'descripcion' => 'Bibliografía recomendada o apuntes oficiales.'],
        ];

        foreach ($tipos as $tipo) {
            TipoArchivo::firstOrCreate(
                ['nombre' => $tipo['nombre']],
                $tipo
            );
        }
    }
}
