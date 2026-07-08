<?php

namespace App\Http\Controllers;

use App\Models\Carrera;
use App\Models\EstadoArchivo;
use App\Models\Archivo;
use App\Models\Materia;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class EstadisticasController extends Controller
{
    public function index(): Response
    {
        // 1. Users per career: count pivot carrera_user records so double-major students count in both
        $usuariosPorCarrera = Carrera::withCount('users as usuarios')
            ->orderByDesc('usuarios')
            ->get()
            ->map(fn ($carrera) => [
                'carrera' => $carrera->nombre,
                'usuarios' => (int) $carrera->usuarios,
            ]);

        // 2. Reviews by file status
        $revisionesPorEstado = EstadoArchivo::withCount('archivos as cantidad')
            ->orderByDesc('cantidad')
            ->get()
            ->map(fn ($estado) => [
                'estado' => $estado->nombre,
                'valor' => (int) $estado->cantidad,
            ]);

        // 3. Top visited subjects
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

        // 4. Distribution of careers per student (1, 2, or 3+ careers)
        $carrerasPorUsuarioData = DB::table('carrera_user')
            ->select('user_id', DB::raw('count(carrera_id) as total_carreras'))
            ->groupBy('user_id')
            ->get();
            
        $carrerasPorUsuario = [
            ['rango' => '1 Carrera', 'usuarios' => $carrerasPorUsuarioData->where('total_carreras', 1)->count()],
            ['rango' => '2 Carreras', 'usuarios' => $carrerasPorUsuarioData->where('total_carreras', 2)->count()],
            ['rango' => '3 o más', 'usuarios' => $carrerasPorUsuarioData->where('total_carreras', '>=', 3)->count()],
        ];

        // 5. Monthly upload activity (database agnostic format grouping)
        $driverName = DB::connection()->getDriverName();
        $mesExpression = $driverName === 'sqlite' 
            ? 'strftime("%Y-%m", created_at)' 
            : 'DATE_FORMAT(created_at, "%Y-%m")';

        $archivosPorMes = Archivo::selectRaw("count(id) as archivos, {$mesExpression} as mes")
            ->whereNotNull('created_at')
            ->groupBy('mes')
            ->orderBy('mes', 'asc')
            ->take(12)
            ->get()
            ->map(fn($item) => [
                'mes' => $item->mes,
                'archivos' => (int) $item->archivos
            ]);

        // 6. Resumen KPIs values for quick visualization cards
        $estadoPendienteId = EstadoArchivo::where('nombre', 'like', '%pend%')->value('id');
        $kpis = [
            'total_usuarios' => User::count(),
            'total_archivos' => Archivo::count(),
            'total_materias' => Materia::count(),
            'archivos_pendientes' => $estadoPendienteId ? Archivo::where('estado_archivo_id', $estadoPendienteId)->count() : 0,
        ];

        return Inertia::render('estadisticas/index', [
            'usuariosPorCarrera' => $usuariosPorCarrera,
            'revisionesPorEstado' => $revisionesPorEstado,
            'topMaterias' => $topMaterias,
            'carrerasPorUsuario' => $carrerasPorUsuario,
            'archivosPorMes' => $archivosPorMes,
            'kpis' => $kpis,
        ]);
    }
}
