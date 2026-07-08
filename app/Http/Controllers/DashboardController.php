<?php

namespace App\Http\Controllers;

use App\Models\Archivo;
use App\Models\Carrera;
use App\Models\Materia;
use App\Models\MateriaUserProgreso;
use App\Models\EstadoArchivo;
use App\Models\Plan_Estudio;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $user = Auth::user();
        
        // Detect selected active career from Nav selector (session), falling back to user's database settings
        $carreraId = null;
        if ($user) {
            $carreraId = session('active_carrera_id');
            if (!$carreraId) {
                $carreraId = $user->carreras()->wherePivot('es_principal', true)->value('carreras.id')
                    ?? $user->carreras()->value('carreras.id')
                    ?? $user->profile?->carrera_principal_id;
                if ($carreraId) {
                    session(['active_carrera_id' => (int) $carreraId]);
                }
            }
        }

        $canViewCosas = $user && $user->can('view_cosasuser');
        $canSeeAllEstados = $user && ($user->can('state_archivo') || $user->can('view_moderacion'));
        
        $estadoPendienteId = EstadoArchivo::where('nombre', 'like', '%pend%')->orderBy('id')->value('id');
        $estadoAprobadoId = EstadoArchivo::where('nombre', 'like', '%aprob%')->orderBy('id')->value('id');

        // Stats summary for ExaDocs platform
        $stats = [
            'archivos' => Archivo::count(),
            'materias' => Materia::count(),
            'carreras' => Carrera::count(),
            'usuarios' => User::count(),
        ];

        // Fetch Popular files (filtered by selected career if set)
        $popularQuery = Archivo::with(['autor:id,name', 'estado:id,nombre', 'materia:id,nombre', 'planEstudio:id,nombre', 'tipo:id,nombre'])
            ->withCount(['savers', 'valoraciones', 'comentarios'])
            ->withAvg('valoraciones', 'puntaje')
            ->orderByDesc('visitas_count')
            ->orderByDesc('created_at');

        if ($carreraId) {
            $popularQuery->whereHas('materia.carreras', fn($q) => $q->where('carreras.id', $carreraId));
        }

        if (!$canSeeAllEstados) {
            $popularQuery->where(function ($q) use ($estadoAprobadoId, $estadoPendienteId, $user) {
                if ($estadoAprobadoId) {
                    $q->where('estado_archivo_id', $estadoAprobadoId);
                }
                if ($estadoPendienteId && $user) {
                    $q->orWhere(function ($q2) use ($estadoPendienteId, $user) {
                        $q2->where('estado_archivo_id', '!=', $estadoPendienteId)
                            ->where('user_id', $user->id);
                    });
                } elseif ($user) {
                    $q->orWhere('user_id', $user->id);
                }
            });
        }

        $popularArchivos = $canViewCosas
            ? $popularQuery->limit(12)->get()->map(fn (Archivo $archivo) => [
                'id' => $archivo->id,
                'titulo' => $archivo->titulo,
                'materia' => $archivo->materia->nombre ?? null,
                'autor' => $archivo->autor->name ?? null,
                'visitas' => $archivo->visitas_count ?? 0,
                'saves' => $archivo->savers_count ?? 0,
                'valoraciones' => $archivo->valoraciones_count ?? 0,
                'valoraciones_avg' => $archivo->valoraciones_avg_puntaje,
                'comentarios' => $archivo->comentarios_count ?? 0,
                'file_path' => $archivo->file_path,
                'thumbnail_path' => $archivo->thumbnail_path,
                'tipo' => $archivo->tipo->nombre ?? 'Documento',
            ])
            : collect();

        // Fetch Recent files (filtered by selected career if set)
        $recentQuery = Archivo::with(['autor:id,name', 'estado:id,nombre', 'materia:id,nombre', 'tipo:id,nombre'])
            ->withCount(['savers', 'valoraciones', 'comentarios'])
            ->withAvg('valoraciones', 'puntaje')
            ->orderByDesc('publicado_en')
            ->orderByDesc('created_at');

        if ($carreraId) {
            $recentQuery->whereHas('materia.carreras', fn($q) => $q->where('carreras.id', $carreraId));
        }

        if (!$canSeeAllEstados) {
            $recentQuery->where(function ($q2) use ($estadoAprobadoId, $estadoPendienteId, $user) {
                if ($estadoAprobadoId) {
                    $q2->where('estado_archivo_id', $estadoAprobadoId);
                }
                if ($user) {
                    $q2->orWhere('user_id', $user->id);
                }
                if ($estadoPendienteId) {
                    $q2->where('estado_archivo_id', '!=', $estadoPendienteId);
                }
            });
        }

        $recentArchivos = $recentQuery->limit(12)->get()->map(fn (Archivo $archivo) => [
            'id' => $archivo->id,
            'titulo' => $archivo->titulo,
            'materia' => $archivo->materia->nombre ?? null,
            'autor' => $archivo->autor->name ?? null,
            'visitas' => $archivo->visitas_count ?? 0,
            'saves' => $archivo->savers_count ?? 0,
            'valoraciones' => $archivo->valoraciones_count ?? 0,
            'valoraciones_avg' => $archivo->valoraciones_avg_puntaje,
            'comentarios' => $archivo->comentarios_count ?? 0,
            'file_path' => $archivo->file_path,
            'thumbnail_path' => $archivo->thumbnail_path,
            'tipo' => $archivo->tipo->nombre ?? 'Documento',
        ]);

        // Student Progress & Personalized Recommendations
        $userProgresoStats = null;
        $recommendedArchivos = collect();

        if ($user && $carreraId && $canViewCosas) {
            $planEstudioId = $user->carreras()->where('carreras.id', $carreraId)->first()?->pivot->plan_estudio_id;
            $optativasRequeridas = 0;
            $tipoAsignaturas = [];

            if ($planEstudioId) {
                $plan = Plan_Estudio::find($planEstudioId);
                if ($plan) {
                    $optativasRequeridas = $plan->optativas_requeridas ?? 0;
                    $tipoAsignaturas = \DB::table('plan_materia')
                        ->where('plan_id', $planEstudioId)
                        ->pluck('tipo_asignatura', 'materia_id')
                        ->toArray();
                }
            }

            // Find subjects belonging to the selected career (or active plan if set)
            $carreraMateriaIds = Materia::whereHas('carreras', fn($q) => $q->where('carreras.id', $carreraId))->pluck('id')->toArray();
            if ($planEstudioId) {
                $carreraMateriaIds = array_intersect($carreraMateriaIds, array_keys($tipoAsignaturas));
            }
            
            // Get student's progress strictly for the selected career
            $progreso = MateriaUserProgreso::where('user_id', $user->id)
                ->where('carrera_id', $carreraId)
                ->get()
                ->keyBy('materia_id');
                
            $cursandoMateriaIds = [];
            $regularMateriaIds = [];
            $completadasMateriaIds = [];
            $pendientesMateriaIds = [];

            foreach ($carreraMateriaIds as $mId) {
                $pState = $progreso->get($mId)?->estado ?? 'pendiente';
                if ($pState === 'cursando') {
                    $cursandoMateriaIds[] = $mId;
                } elseif ($pState === 'regular') {
                    $regularMateriaIds[] = $mId;
                } elseif (in_array($pState, ['aprobada', 'promocionada'])) {
                    $completadasMateriaIds[] = $mId;
                } else {
                    $pendientesMateriaIds[] = $mId;
                }
            }

            // Group into obligatoria vs optativa to apply required electives caps
            $obligatoriasIds = [];
            $optativasIds = [];
            foreach ($carreraMateriaIds as $mId) {
                $t = $tipoAsignaturas[$mId] ?? 'obligatoria';
                if ($t === 'optativa') {
                    $optativasIds[] = $mId;
                } else {
                    $obligatoriasIds[] = $mId;
                }
            }

            $ob_aprobadas = array_intersect($completadasMateriaIds, $obligatoriasIds);
            $ob_cursando = array_intersect($cursandoMateriaIds, $obligatoriasIds);
            $ob_regular = array_intersect($regularMateriaIds, $obligatoriasIds);

            $opt_aprobadas = array_intersect($completadasMateriaIds, $optativasIds);
            $opt_cursando = array_intersect($cursandoMateriaIds, $optativasIds);
            $opt_regular = array_intersect($regularMateriaIds, $optativasIds);

            $count_opt_aprobadas = min(count($opt_aprobadas), $optativasRequeridas);
            $remaining = $optativasRequeridas - $count_opt_aprobadas;

            $count_opt_cursando = min(count($opt_cursando), $remaining);
            $remaining -= $count_opt_cursando;

            $count_opt_regular = min(count($opt_regular), $remaining);

            $aprobadasCount = count($ob_aprobadas) + $count_opt_aprobadas;
            $cursandoCount = count($ob_cursando) + $count_opt_cursando;
            $regularCount = count($ob_regular) + $count_opt_regular;
            $totalMateriasPlan = count($obligatoriasIds) + $optativasRequeridas;

            $userProgresoStats = [
                'carrera_nombre' => Carrera::where('id', $carreraId)->value('nombre') ?? 'Tu Carrera Seleccionada',
                'aprobadas' => $aprobadasCount,
                'cursando' => $cursandoCount,
                'regulares' => $regularCount,
                'total' => $totalMateriasPlan,
            ];

            // Recommendation Query: Filter to career subjects, order by academic status
            $recommendedQuery = Archivo::with(['autor:id,name', 'estado:id,nombre', 'materia:id,nombre', 'planEstudio:id,nombre', 'tipo:id,nombre'])
                ->withCount(['savers', 'valoraciones', 'comentarios'])
                ->withAvg('valoraciones', 'puntaje')
                ->whereIn('materia_id', $carreraMateriaIds);

            if (!$canSeeAllEstados) {
                $recommendedQuery->where(function ($q) use ($estadoAprobadoId, $estadoPendienteId, $user) {
                    if ($estadoAprobadoId) {
                        $q->where('estado_archivo_id', $estadoAprobadoId);
                    }
                    if ($estadoPendienteId && $user) {
                        $q->orWhere(function ($q2) use ($estadoPendienteId, $user) {
                            $q2->where('estado_archivo_id', '!=', $estadoPendienteId)
                                ->where('user_id', $user->id);
                        });
                    } elseif ($user) {
                        $q->orWhere('user_id', $user->id);
                    }
                });
            }

            if (!empty($cursandoMateriaIds) || !empty($regularMateriaIds) || !empty($pendientesMateriaIds)) {
                $cursandoList = implode(',', array_filter(array_map('intval', $cursandoMateriaIds))) ?: '0';
                $regularList = implode(',', array_filter(array_map('intval', $regularMateriaIds))) ?: '0';
                $pendientesList = implode(',', array_filter(array_map('intval', $pendientesMateriaIds))) ?: '0';

                $recommendedQuery->orderByRaw("CASE 
                    WHEN materia_id IN ($cursandoList) THEN 1 
                    WHEN materia_id IN ($regularList) THEN 2 
                    WHEN materia_id IN ($pendientesList) THEN 3 
                    ELSE 4 
                END ASC");
            }

            $recommendedQuery->orderByDesc('visitas_count')->orderByDesc('created_at');

            $recommendedArchivos = $recommendedQuery->limit(12)->get()->map(fn (Archivo $archivo) => [
                'id' => $archivo->id,
                'titulo' => $archivo->titulo,
                'materia' => $archivo->materia->nombre ?? null,
                'autor' => $archivo->autor->name ?? null,
                'visitas' => $archivo->visitas_count ?? 0,
                'saves' => $archivo->savers_count ?? 0,
                'valoraciones' => $archivo->valoraciones_count ?? 0,
                'valoraciones_avg' => $archivo->valoraciones_avg_puntaje,
                'comentarios' => $archivo->comentarios_count ?? 0,
                'file_path' => $archivo->file_path,
                'thumbnail_path' => $archivo->thumbnail_path,
                'tipo' => $archivo->tipo->nombre ?? 'Documento',
                'relevancia_estado' => in_array($archivo->materia_id, $cursandoMateriaIds)
                    ? 'cursando'
                    : (in_array($archivo->materia_id, $regularMateriaIds) 
                        ? 'regular'
                        : (in_array($archivo->materia_id, $completadasMateriaIds) ? 'completada' : 'pendiente')),
            ]);
        }

        return Inertia::render('dashboard', [
            'recentArchivos' => $recentArchivos,
            'popularArchivos' => $popularArchivos,
            'recommendedArchivos' => $recommendedArchivos,
            'userProgresoStats' => $userProgresoStats,
            'canViewCosas' => $canViewCosas,
            'stats' => $stats,
        ]);
    }
}
