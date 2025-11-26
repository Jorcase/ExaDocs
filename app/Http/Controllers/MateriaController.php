<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMateriaRequest;
use App\Http\Requests\UpdateMateriaRequest;
use App\Models\Materia;
use App\Models\Carrera;
use App\Models\Plan_Estudio;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Exports\MateriasExport;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Arr;

class MateriaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $table = (new Materia())->getTable();
        $search = $request->string('search');
        $codigo = $request->string('codigo');
        $tipos = $request->input('tipo', []);
        $carreraId = $request->input('carrera_id');
        $sort = $request->input('sort', 'id');
        $direction = $request->input('direction', 'desc');

        $query = $this->buildFilteredQuery($request);

        [$sort, $direction] = $this->normalizeSort($sort, $direction);
        $query->orderBy("{$table}.{$sort}", $direction);

        return inertia('materias/index', [
            'materias' => $query->paginate(10)->withQueryString(),
            'filters' => [
                'search' => $search->value(),
                'codigo' => $codigo->value(),
                'tipo' => is_array($tipos) ? $tipos : [],
                'carrera_id' => $carreraId,
                'sort' => $sort,
                'direction' => $direction,
            ],
            'codigos' => Materia::select('codigo')->distinct()->pluck('codigo')->filter()->values(),
            'carreras' => Carrera::select('id', 'nombre')->orderBy('nombre')->get(),
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
    public function exportMaterias()
    {
        $request = request();
        $table = (new Materia())->getTable();
        $sort = $request->input('sort', 'id');
        $direction = $request->input('direction', 'desc');
        [$sort, $direction] = $this->normalizeSort($sort, $direction);

        $query = $this->buildFilteredQuery($request)
            ->with(['carreras:id,nombre', 'planesEstudio:id,nombre']);
        $query->orderBy("{$table}.{$sort}", $direction);

        $materias = $query->get();

        return Excel::download(new MateriasExport($materias), 'materias.xlsx');
    }

    public function generateReport(Request $request)
    {
        $table = (new Materia())->getTable();
        $sort = $request->input('sort', 'id');
        $direction = $request->input('direction', 'desc');
        [$sort, $direction] = $this->normalizeSort($sort, $direction);

        $query = $this->buildFilteredQuery($request)
            ->with(['carreras:id,nombre', 'planesEstudio:id,nombre']);
        $query->orderBy("{$table}.{$sort}", $direction);

        $materias = $query->get();
        $pdf = Pdf::loadView('pdf.materias', compact('materias'));
        return $pdf->stream('materias.pdf');
    }

    private function buildFilteredQuery(Request $request): Builder
    {
        $search = $request->string('search');
        $codigo = $request->string('codigo');
        $tipos = $request->input('tipo', []);
        $carreraId = $request->input('carrera_id');

        $query = Materia::query();

        if ($search->isNotEmpty()) {
            $query->where('nombre', 'like', '%' . $search . '%');
        }

        if ($codigo->isNotEmpty()) {
            $query->where('codigo', 'like', '%' . $codigo . '%');
        }

        if (is_array($tipos) && count($tipos)) {
            $query->whereIn('tipo', $tipos);
        }

        if ($carreraId) {
            $query->whereHas('carreras', fn ($q) => $q->where('carreras.id', (int) $carreraId));
        }

        return $query;
    }

    private function normalizeSort(string $sort, string $direction): array
    {
        $allowedSorts = ['id', 'nombre', 'codigo', 'tipo'];
        if (!in_array($sort, $allowedSorts, true)) {
            $sort = 'id';
        }
        $direction = $direction === 'asc' ? 'asc' : 'desc';

        return [$sort, $direction];
    }
}
