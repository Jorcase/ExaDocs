<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMateriaRequest;
use App\Http\Requests\UpdateMateriaRequest;
use App\Models\Materia;
use App\Models\Carrera;
use App\Models\Plan_Estudio;
use Barryvdh\DomPDF\Facade\Pdf;

class MateriaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return inertia('materias/index', [
            'materias' => Materia::latest()->paginate(10),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return inertia('materias/create', [
            'materia' => new Materia(),
            'carreras' => Carrera::with('planesEstudio:id,carrera_id,nombre')
                ->select('id', 'nombre')
                ->orderBy('nombre')
                ->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreMateriaRequest $request)
    {
        $data = $request->validated();
        $asignaciones = collect($data['asignaciones'] ?? [])->filter(fn ($a) => $a['carrera_id'] ?? false);
        unset($data['asignaciones']);

        // Validar que los planes pertenecen a la carrera elegida
        $this->validarPlanesPorCarrera($asignaciones);

        $materia = Materia::create($data);
        $this->sincronizarAsignaciones($materia, $asignaciones);

        return redirect()
            ->route('materias.index')
            ->with('success', "Materia {$materia->nombre} creada correctamente.");
    }

    /**
     * Display the specified resource.
     */
    public function show(Materia $materia)
    {
        return inertia('materias/show', [
            'materia' => $materia,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Materia $materia)
    {
        return inertia('materias/edit', [
            'materia' => $materia->load(['carreras:id,nombre', 'planesEstudio:id,nombre,carrera_id']),
            'carreras' => Carrera::with('planesEstudio:id,carrera_id,nombre')
                ->select('id', 'nombre')
                ->orderBy('nombre')
                ->get(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateMateriaRequest $request, Materia $materia)
    {
        $data = $request->validated();
        $asignaciones = collect($data['asignaciones'] ?? [])->filter(fn ($a) => $a['carrera_id'] ?? false);
        unset($data['asignaciones']);

        $this->validarPlanesPorCarrera($asignaciones);

        $materia->update($data);
        $this->sincronizarAsignaciones($materia, $asignaciones);

        return redirect()
            ->route('materias.index')
            ->with('success', "Materia {$materia->nombre} actualizada correctamente.");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Materia $materia)
    {
        $materia->delete();

        return redirect()
            ->route('materias.index')
            ->with('success', "Materia {$materia->nombre} eliminada correctamente.");
    }

    public function generateReport()
    {
        $materias = Materia::with(['carreras:id,nombre', 'planesEstudio:id,nombre'])->orderBy('nombre')->get();
        $pdf = Pdf::loadView('pdf.materias', compact('materias'));
        return $pdf->stream('materias.pdf');
    }

    private function validarPlanesPorCarrera($asignaciones): void
    {
        foreach ($asignaciones as $asig) {
            if (!empty($asig['plan_estudio_id'])) {
                $plan = Plan_Estudio::find($asig['plan_estudio_id']);
                if (!$plan || $plan->carrera_id !== (int) $asig['carrera_id']) {
                    abort(422, 'El plan seleccionado no pertenece a la carrera elegida.');
                }
            }
        }
    }

    private function sincronizarAsignaciones(Materia $materia, $asignaciones): void
    {
        $carreraIds = $asignaciones->pluck('carrera_id')->unique()->all();
        $materia->carreras()->sync($carreraIds);

        $planes = $asignaciones
            ->pluck('plan_estudio_id')
            ->filter()
            ->unique()
            ->all();

        $planData = collect($planes)->mapWithKeys(fn ($planId) => [
            $planId => [
                'tipo_asignatura' => $materia->tipo ?? 'obligatoria',
                'correlativas' => null,
            ],
        ])->all();

        $materia->planesEstudio()->sync($planData);
    }
}
