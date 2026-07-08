<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\MateriaUserProgreso;

class ExpireCursadas extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:expire-cursadas {--semester= : El cuatrimestre a expirar (1 o 2). Si se omite, se deduce por la fecha actual.}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Cambia el estado de las cursadas terminadas a "pendiente_actualizar" en base al cuatrimestre.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $semester = $this->option('semester');

        if (!$semester) {
            $month = now()->month;
            // Si estamos de julio a diciembre, expiramos el 1er cuatrimestre (que terminó en junio/julio).
            // Si estamos de enero a junio, expiramos el 2do cuatrimestre y las anuales (que terminaron en diciembre/enero).
            $semester = ($month >= 7 && $month <= 12) ? 1 : 2;
        }

        $query = MateriaUserProgreso::where('estado', 'cursando');

        if ((int)$semester === 1) {
            $query->whereHas('carrera.materias', function ($q) {
                $q->whereColumn('carrera_materia.materia_id', 'materia_user_progreso.materia_id')
                  ->where('carrera_materia.cuatrimestre', 1);
            });
            $count = $query->update(['estado' => 'pendiente_actualizar']);
            $this->info("Se marcaron {$count} cursadas del 1er cuatrimestre como 'pendiente_actualizar'.");
        } else {
            $query->whereHas('carrera.materias', function ($q) {
                $q->whereColumn('carrera_materia.materia_id', 'materia_user_progreso.materia_id')
                  ->whereIn('carrera_materia.cuatrimestre', [2, 3]); // 2 = 2do Cuatrimestre, 3 = Anual
            });
            $count = $query->update(['estado' => 'pendiente_actualizar']);
            $this->info("Se marcaron {$count} cursadas del 2do cuatrimestre y anuales como 'pendiente_actualizar'.");
        }

        return 0;
    }
}
