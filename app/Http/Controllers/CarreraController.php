<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCarreraRequest;
use App\Http\Requests\UpdateCarreraRequest;
use App\Models\Carrera;

class CarreraController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
       return inertia('carreras/index', [
            'carreras' => Carrera::latest()->paginate(10)
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return inertia('carreras/create', [
            'carreras' => new Carrera()
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCarreraRequest $request)
    {
        $carrera = Carrera::create($request->validated());

        return redirect()
            ->route('carreras.index')
            ->with('success', "Carrera {$carrera->nombre} creada correctamente.");
    }

    /**
     * Display the specified resource.
     */
    public function show(Carrera $carrera)
    {
        return inertia('carreras/show', [
            'carrera' => $carrera,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Carrera $carrera)
    {
        return inertia('carreras/edit', [
            'carrera' => $carrera,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCarreraRequest $request, Carrera $carrera)
    {
        $carrera->update($request->validated());

        return redirect()
            ->route('carreras.index')
            ->with('success', "Carrera {$carrera->nombre} actualizada correctamente.");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Carrera $carrera)
    {
        $carrera->delete();

        return redirect()
            ->route('carreras.index')
            ->with('success', "Carrera {$carrera->nombre} eliminada correctamente.");
    }
}
