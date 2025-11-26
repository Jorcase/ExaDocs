<?php

namespace App\Http\Controllers;

use App\Models\Carrera;
use App\Models\EstadoArchivo;
use App\Models\Archivo;
use Inertia\Inertia;
use Inertia\Response;

class EstadisticasController extends Controller
{
    public function index(): Response
    {
        $usuariosPorCarrera = Carrera::withCount('perfiles as usuarios')
            ->orderByDesc('usuarios')
            ->get()
            ->map(fn ($carrera) => [
                'carrera' => $carrera->nombre,
                'usuarios' => (int) $carrera->usuarios,
            ]);

        $revisionesPorEstado = EstadoArchivo::withCount('archivos as cantidad')
            ->orderByDesc('cantidad')
            ->get()
            ->map(fn ($estado) => [
                'estado' => $estado->nombre,
                'valor' => (int) $estado->cantidad,
            ]);

        $topMaterias = Archivo::query()
            ->selectRaw('materia_id, COALESCE(SUM(visitas_count), 0) as vistas')
            ->whereNotNull('materia_id')
            ->groupBy('materia_id')
            ->orderByDesc('vistas')
            ->with(['materia:id,nombre'])
            ->take(10)
            ->get()
            ->filter(fn ($archivo) => $archivo->materia)
            ->map(fn ($archivo) => [
                'nombre' => $archivo->materia->nombre,
                'vistas' => (int) $archivo->vistas,
            ]);

        return Inertia::render('estadisticas/index', [
            'usuariosPorCarrera' => $usuariosPorCarrera,
            'revisionesPorEstado' => $revisionesPorEstado,
            'topMaterias' => $topMaterias,
        ]);
    }
}
