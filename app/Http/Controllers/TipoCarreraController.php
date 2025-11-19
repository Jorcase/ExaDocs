<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTipoCarreraRequest;
use App\Http\Requests\UpdateTipoCarreraRequest;
use App\Models\TipoCarrera;

class TipoCarreraController extends Controller
{
    public function index()
    {
        return inertia('tipo-carreras/index', [
            'tipos' => TipoCarrera::latest()->paginate(10),
        ]);
    }

    public function create()
    {
        return inertia('tipo-carreras/create', [
            'tipoCarrera' => new TipoCarrera(),
        ]);
    }

    public function store(StoreTipoCarreraRequest $request)
    {
        $tipo = TipoCarrera::create($request->validated());

        return redirect()
            ->route('tipo-carreras.index')
            ->with('success', "Tipo {$tipo->nombre} creado correctamente.");
    }

    public function show(TipoCarrera $tipoCarrera)
    {
        return inertia('tipo-carreras/show', [
            'tipoCarrera' => $tipoCarrera,
        ]);
    }

    public function edit(TipoCarrera $tipoCarrera)
    {
        return inertia('tipo-carreras/edit', [
            'tipoCarrera' => $tipoCarrera,
        ]);
    }

    public function update(UpdateTipoCarreraRequest $request, TipoCarrera $tipoCarrera)
    {
        $tipoCarrera->update($request->validated());

        return redirect()
            ->route('tipo-carreras.index')
            ->with('success', "Tipo {$tipoCarrera->nombre} actualizado correctamente.");
    }

    public function destroy(TipoCarrera $tipoCarrera)
    {
        $tipoCarrera->delete();

        return redirect()
            ->route('tipo-carreras.index')
            ->with('success', "Tipo {$tipoCarrera->nombre} eliminado correctamente.");
    }
}
