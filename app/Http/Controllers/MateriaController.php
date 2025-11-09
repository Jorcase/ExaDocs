<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMateriaRequest;
use App\Http\Requests\UpdateMateriaRequest;
use App\Models\Materia;

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
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreMateriaRequest $request)
    {
        $materia = Materia::create($request->validated());

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
            'materia' => $materia,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateMateriaRequest $request, Materia $materia)
    {
        $materia->update($request->validated());

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
}
