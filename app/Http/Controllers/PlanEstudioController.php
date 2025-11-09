<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePlan_EstudioRequest;
use App\Http\Requests\UpdatePlan_EstudioRequest;
use App\Models\Plan_Estudio;
use App\Models\Carrera;

class PlanEstudioController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return inertia('plan-estudios/index', [
            'planes' => Plan_Estudio::with('carrera:id,nombre')
                ->latest()
                ->paginate(10),
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
