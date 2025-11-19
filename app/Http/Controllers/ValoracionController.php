<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreValoracionRequest;
use App\Http\Requests\UpdateValoracionRequest;
use App\Models\Valoracion;
use App\Models\Archivo;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use App\Mail\ValoracionNuevaMail;

class ValoracionController extends Controller
{
    public function index()
    {
        return inertia('valoraciones/index', [
            'valoraciones' => Valoracion::with(['archivo:id,titulo', 'autor:id,name'])
                ->latest()
                ->paginate(10),
        ]);
    }

    public function create()
    {
        return inertia('valoraciones/create', [
            'valoracion' => new Valoracion(),
            'archivos' => Archivo::select('id', 'titulo')->orderBy('titulo')->get(),
            'usuarios' => User::select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    public function store(StoreValoracionRequest $request)
    {
        $valoracion = Valoracion::create($request->validated());

        $autorArchivo = $valoracion->archivo?->autor;
        if ($autorArchivo && $autorArchivo->email) {
            Mail::to($autorArchivo->email)->send(new ValoracionNuevaMail($valoracion));
        }

        return redirect()->route('valoraciones.index')
            ->with('success', "Valoración #{$valoracion->id} creada.");
    }

    public function edit(Valoracion $valoracion)
    {
        return inertia('valoraciones/edit', [
            'valoracion' => $valoracion,
            'archivos' => Archivo::select('id', 'titulo')->orderBy('titulo')->get(),
            'usuarios' => User::select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    public function update(UpdateValoracionRequest $request, Valoracion $valoracion)
    {
        $valoracion->update($request->validated());

        return redirect()->route('valoraciones.index')
            ->with('success', "Valoración #{$valoracion->id} actualizada.");
    }

    public function destroy(Valoracion $valoracion)
    {
        $valoracion->delete();

        return redirect()->route('valoraciones.index')
            ->with('success', "Valoración #{$valoracion->id} eliminada.");
    }
}
