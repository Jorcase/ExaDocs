<?php

namespace Database\Seeders;

use App\Models\EstadoArchivo;
use Illuminate\Database\Seeder;

class EstadoArchivoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $estados = [
            [
                'nombre' => 'Pendiente',
                'descripcion' => 'Archivo recibido, en espera de moderación.',
                'es_final' => false,
            ],
            [
                'nombre' => 'Aprobado',
                'descripcion' => 'Archivo verificado y publicado oficialmente.',
                'es_final' => true,
            ],
            [
                'nombre' => 'Rechazado',
                'descripcion' => 'Archivo no aprobado por incumplimiento de normas.',
                'es_final' => true,
            ],
        ];

        foreach ($estados as $estado) {
            EstadoArchivo::firstOrCreate(
                ['nombre' => $estado['nombre']],
                $estado
            );
        }
    }
}
