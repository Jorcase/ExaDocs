<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePlan_EstudioRequest;
use App\Http\Requests\UpdatePlan_EstudioRequest;
use App\Models\Plan_Estudio;
use App\Models\Carrera;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;

class PlanEstudioController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $table = (new Plan_Estudio())->getTable();
        $query = Plan_Estudio::query()->with('carrera:id,nombre');

        $search = trim((string) $request->input('search', ''));
        $anio = $request->input('anio');
        $carreraId = $request->input('carrera_id');
        $estados = array_filter(Arr::wrap($request->input('estado', [])));
        $sort = $request->input('sort', 'id');
        $direction = $request->input('direction', 'desc');

        if ($search !== '') {
            $query->where('nombre', 'like', '%' . $search . '%');
        }

        if ($anio !== null && $anio !== '') {
            $query->where('anio_plan', (int) $anio);
        }

        if (!empty($estados)) {
            $query->whereIn('estado', $estados);
        }

        if ($carreraId) {
            $query->where('carrera_id', (int) $carreraId);
        }

        $allowedSorts = ['id', 'nombre', 'anio_plan', 'estado', 'carrera'];
        if (!in_array($sort, $allowedSorts, true)) {
            $sort = 'id';
        }
        $direction = $direction === 'asc' ? 'asc' : 'desc';

        if ($sort === 'carrera') {
            $query->join('carreras', 'carreras.id', '=', "{$table}.carrera_id")
                ->orderBy('carreras.nombre', $direction)
                ->select("{$table}.*");
        } else {
            $query->orderBy($sort === 'anio_plan' ? 'anio_plan' : "{$table}.{$sort}", $direction);
        }

        return inertia('plan-estudios/index', [
            'planes' => $query->paginate(10)->withQueryString(),
            'filters' => [
                'search' => $search,
                'anio' => $anio,
                'estado' => $estados,
                'carrera_id' => $carreraId,
                'sort' => $sort,
                'direction' => $direction,
            ],
            'carreras' => Carrera::select('id', 'nombre')->orderBy('nombre')->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return inertia('plan-estudios/create', [
            'plan' => new Plan_Estudio(),
            'carreras' => Carrera::select('id', 'nombre')->orderBy('nombre')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePlan_EstudioRequest $request)
    {
        $plan = Plan_Estudio::create($request->validated());

        return redirect()
            ->route('planes-estudio.index')
            ->with('success', "Plan {$plan->nombre} creado correctamente.");
    }

    /**
     * Display the specified resource.
     */
    public function show(Plan_Estudio $plan)
    {
        return inertia('plan-estudios/show', [
            'plan' => $plan->load('carrera:id,nombre'),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Plan_Estudio $plan)
    {
        return inertia('plan-estudios/edit', [
            'plan' => $plan,
            'carreras' => Carrera::select('id', 'nombre')->orderBy('nombre')->get(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePlan_EstudioRequest $request, Plan_Estudio $plan)
    {
        $plan->update($request->validated());

        return redirect()
            ->route('planes-estudio.index')
            ->with('success', "Plan {$plan->nombre} actualizado correctamente.");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Plan_Estudio $plan)
    {
        $plan->delete();

        return redirect()
            ->route('planes-estudio.index')
            ->with('success', "Plan {$plan->nombre} eliminado correctamente.");
    }
}
