<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEstadoArchivoRequest;
use App\Http\Requests\UpdateEstadoArchivoRequest;
use App\Models\EstadoArchivo;

class EstadoArchivoController extends Controller
{
    public function index()
    {
        return inertia('estado-archivos/index', [
            'estados' => EstadoArchivo::latest()->paginate(10),
        ]);
    }

    public function create()
    {
        return inertia('estado-archivos/create', [
            'estado' => new EstadoArchivo(),
        ]);
    }

    public function store(StoreEstadoArchivoRequest $request)
    {
        $estado = EstadoArchivo::create($request->validated());

        return redirect()
            ->route('estado-archivos.index')
            ->with('success', "Estado {$estado->nombre} creado correctamente.");
    }

    public function show(EstadoArchivo $estadoArchivo)
    {
        return inertia('estado-archivos/show', [
            'estado' => $estadoArchivo,
        ]);
    }

    public function edit(EstadoArchivo $estadoArchivo)
    {
        return inertia('estado-archivos/edit', [
            'estado' => $estadoArchivo,
        ]);
    }

    public function update(UpdateEstadoArchivoRequest $request, EstadoArchivo $estadoArchivo)
    {
        $estadoArchivo->update($request->validated());

        return redirect()
            ->route('estado-archivos.index')
            ->with('success', "Estado {$estadoArchivo->nombre} actualizado correctamente.");
    }

    public function destroy(EstadoArchivo $estadoArchivo)
    {
        $estadoArchivo->delete();

        return redirect()
            ->route('estado-archivos.index')
            ->with('success', "Estado {$estadoArchivo->nombre} eliminado correctamente.");
    }
}
