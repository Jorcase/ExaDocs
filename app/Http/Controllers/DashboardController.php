<?php

namespace App\Http\Controllers;

use App\Models\Archivo;
use App\Models\Carrera;
use App\Models\Materia;
use App\Models\Plan_Estudio;
use App\Models\UserProfile;
use App\Models\EstadoArchivo;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $user = Auth::user();
        $carreraId = $user?->profile?->carrera_principal_id;
        $canViewCosas = $user && $user->can('view_cosasuser');
        $canSeeAllEstados = $user && ($user->can('state_archivo') || $user->can('view_moderacion'));
        $estadoPendienteId = EstadoArchivo::where('nombre', 'like', '%pend%')->orderBy('id')->value('id');
        $estadoAprobadoId = EstadoArchivo::where('nombre', 'like', '%aprob%')->orderBy('id')->value('id');

        $popularQuery = Archivo::with(['autor:id,name', 'estado:id,nombre', 'materia:id,nombre', 'planEstudio:id,nombre'])
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
            ? $popularQuery
                ->limit(12)
                ->get()
                ->map(fn (Archivo $archivo) => [
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
                ])
            : collect();

        $recentArchivos = Archivo::with(['autor:id,name', 'estado:id,nombre', 'materia:id,nombre'])
            ->withCount(['savers', 'valoraciones', 'comentarios'])
            ->withAvg('valoraciones', 'puntaje')
            ->orderByDesc('publicado_en')
            ->orderByDesc('created_at')
            ->limit(12)
            ->when(!$canSeeAllEstados, function ($q) use ($estadoAprobadoId, $estadoPendienteId, $user) {
                $q->where(function ($q2) use ($estadoAprobadoId, $estadoPendienteId, $user) {
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
            })
            ->get()
            ->map(fn (Archivo $archivo) => [
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
            ]);

        $stats = [
            'archivos' => Archivo::count(),
            'materias' => Materia::count(),
            'carreras' => Carrera::count(),
            'usuarios' => User::count(),
        ];

        return Inertia::render('dashboard', [
            'recentArchivos' => $recentArchivos,
            'popularArchivos' => $popularArchivos,
            'canViewCosas' => $canViewCosas,
            'stats' => $stats,
        ]);
    }
}
