<?php

namespace App\Http\Controllers;

use App\Models\MateriaUserProgreso;
use Illuminate\Http\Request;

class MateriaProgresoController extends Controller
{
    public function update(Request $request)
    {
        $request->validate([
            'materia_id' => 'required|exists:materias,id',
            'estado' => 'required|in:cursando,regular,aprobada,promocionada,pendiente',
            'nota' => 'nullable|integer|between:1,10',
            'fecha_aprobacion' => 'nullable|date',
        ]);

        $user = $request->user();
        $activeCarreraId = session('active_carrera_id') ?? $user->carreras()->wherePivot('es_principal', true)->value('carreras.id');
        if (!$activeCarreraId) {
            $activeCarreraId = $user->carreras()->first()?->id;
        }

        if (!$activeCarreraId) {
            return back()->withErrors(['carrera' => 'No se encontró una carrera activa.']);
        }

        if ($request->estado === 'pendiente') {
            MateriaUserProgreso::where('user_id', $user->id)
                ->where('carrera_id', $activeCarreraId)
                ->where('materia_id', $request->materia_id)
                ->delete();
        } else {
            MateriaUserProgreso::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'carrera_id' => $activeCarreraId,
                    'materia_id' => $request->materia_id,
                ],
                [
                    'estado' => $request->estado,
                    'nota' => in_array($request->estado, ['aprobada', 'promocionada']) ? $request->nota : null,
                    'fecha_aprobacion' => in_array($request->estado, ['aprobada', 'promocionada']) ? $request->fecha_aprobacion : null,
                ]
            );
        }

        return back()->with('success', 'Progreso de la materia actualizado con éxito.');
    }

    public function generateReport(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            abort(403);
        }

        $activeCarreraId = session('active_carrera_id') ?? $user->carreras()->wherePivot('es_principal', true)->value('carreras.id');
        if (!$activeCarreraId) {
            $activeCarreraId = $user->carreras()->first()?->id;
        }

        if (!$activeCarreraId) {
            return back()->withErrors(['carrera' => 'No se encontró una carrera activa.']);
        }

        $carrera = \App\Models\Carrera::with(['materias' => function ($query) {
            $query->select('materias.id', 'materias.nombre', 'materias.codigo')
                ->withPivot('cuatrimestre', 'anio_sugerido');
        }])->find($activeCarreraId);

        if (!$carrera) {
            abort(404, 'Carrera no encontrada');
        }

        $planEstudioId = $user->carreras()->where('carreras.id', $activeCarreraId)->first()?->pivot->plan_estudio_id;
        $optativasRequeridas = 0;
        $tipoAsignaturas = [];
        $planNombre = 'Plan General';

        if ($planEstudioId) {
            $plan = \App\Models\Plan_Estudio::find($planEstudioId);
            if ($plan) {
                $planNombre = $plan->nombre;
                $optativasRequeridas = $plan->optativas_requeridas ?? 0;
                $tipoAsignaturas = \DB::table('plan_materia')
                    ->where('plan_id', $planEstudioId)
                    ->pluck('tipo_asignatura', 'materia_id')
                    ->toArray();
            }
        }

        $progreso = $user->progresos()
            ->where('carrera_id', $activeCarreraId)
            ->get()
            ->keyBy('materia_id');

        $materiasPlan = $carrera->materias
            ->filter(function ($materia) use ($planEstudioId, $tipoAsignaturas) {
                if ($planEstudioId) {
                    return isset($tipoAsignaturas[$materia->id]);
                }
                return true;
            })
            ->map(function ($materia) use ($progreso, $tipoAsignaturas) {
                $prog = $progreso->get($materia->id);
                return (object) [
                    'id' => $materia->id,
                    'nombre' => $materia->nombre,
                    'codigo' => $materia->codigo,
                    'anio_sugerido' => $materia->pivot->anio_sugerido,
                    'cuatrimestre' => $materia->pivot->cuatrimestre,
                    'estado' => $prog ? $prog->estado : 'pendiente',
                    'nota' => $prog ? $prog->nota : null,
                    'tipo_asignatura' => $tipoAsignaturas[$materia->id] ?? 'obligatoria',
                ];
            })->sortBy([
                ['anio_sugerido', 'asc'],
                ['cuatrimestre', 'asc'],
                ['nombre', 'asc'],
            ])->values();

        // Calcular estadísticas
        $obligatorias = $materiasPlan->filter(fn($m) => $m->tipo_asignatura !== 'optativa');
        $optativas = $materiasPlan->filter(fn($m) => $m->tipo_asignatura === 'optativa');

        $ob_aprobadas = $obligatorias->filter(fn($m) => in_array($m->estado, ['aprobada', 'promocionada']));
        $opt_aprobadas = $optativas->filter(fn($m) => in_array($m->estado, ['aprobada', 'promocionada']));
        $count_opt_aprobadas = min($opt_aprobadas->count(), $optativasRequeridas);

        $aprobadasCount = $ob_aprobadas->count() + $count_opt_aprobadas;
        $totalMaterias = $obligatorias->count() + $optativasRequeridas;
        $porcentaje = $totalMaterias > 0 ? round(($aprobadasCount / $totalMaterias) * 100, 1) : 0;

        // Calcular promedio de aprobadas/promocionadas con nota
        $aprobadasConNota = $materiasPlan->filter(fn($m) => in_array($m->estado, ['aprobada', 'promocionada']) && $m->nota !== null);
        $promedio = $aprobadasConNota->count() > 0 ? round($aprobadasConNota->avg('nota'), 2) : 0;

        $carreraNombre = $carrera->nombre;

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.progreso', compact(
            'materiasPlan',
            'carreraNombre',
            'planNombre',
            'porcentaje',
            'aprobadasCount',
            'totalMaterias',
            'promedio',
            'user'
        ));

        return $pdf->stream("progreso-{$carrera->codigo}.pdf");
    }
}
