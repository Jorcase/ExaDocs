<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTipoArchivoRequest;
use App\Http\Requests\UpdateTipoArchivoRequest;
use App\Models\TipoArchivo;
use Illuminate\Http\Request;

class TipoArchivoController extends Controller
{
    public function index(Request $request)
    {
        $sort = $request->input('sort', 'id');
        $direction = $request->input('direction', 'desc');

        $allowedSorts = ['id', 'nombre'];
        if (!in_array($sort, $allowedSorts, true)) {
            $sort = 'id';
        }
        $direction = $direction === 'asc' ? 'asc' : 'desc';

        return inertia('tipo-archivos/index', [
            'tipos' => TipoArchivo::orderBy($sort, $direction)->paginate(10)->withQueryString(),
            'filters' => [
                'sort' => $sort,
                'direction' => $direction,
            ],
        ]);
    }

    public function create()
    {
        return inertia('tipo-archivos/create', [
            'tipo' => new TipoArchivo(),
        ]);
    }

    public function store(StoreTipoArchivoRequest $request)
    {
        $tipo = TipoArchivo::create($request->validated());

        return redirect()
            ->route('tipo-archivos.index')
            ->with('success', "Tipo {$tipo->nombre} creado correctamente.");
    }

    public function show(TipoArchivo $tipoArchivo)
    {
        return inertia('tipo-archivos/show', [
            'tipo' => $tipoArchivo,
        ]);
    }

    public function edit(TipoArchivo $tipoArchivo)
    {
        return inertia('tipo-archivos/edit', [
            'tipo' => $tipoArchivo,
        ]);
    }

    public function update(UpdateTipoArchivoRequest $request, TipoArchivo $tipoArchivo)
    {
        $tipoArchivo->update($request->validated());

        return redirect()
            ->route('tipo-archivos.index')
            ->with('success', "Tipo {$tipoArchivo->nombre} actualizado correctamente.");
    }

    public function destroy(TipoArchivo $tipoArchivo)
    {
        $tipoArchivo->delete();

        return redirect()
            ->route('tipo-archivos.index')
            ->with('success', "Tipo {$tipoArchivo->nombre} eliminado correctamente.");
    }
}
