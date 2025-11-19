<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreReporteContenidoRequest;
use App\Http\Requests\UpdateReporteContenidoRequest;
use App\Models\ReporteContenido;
use App\Models\Archivo;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use App\Mail\ReporteContenidoMail;

class ReporteContenidoController extends Controller
{
    public function index()
    {
        return inertia('reportes/index', [
            'reportes' => ReporteContenido::with([
                'archivo:id,titulo',
                'reportante:id,name',
                'moderador:id,name',
            ])->latest()->paginate(10),
        ]);
    }

    public function create()
    {
        return inertia('reportes/create', [
            'reporte' => new ReporteContenido(),
            'archivos' => Archivo::select('id', 'titulo')->orderBy('titulo')->get(),
            'usuarios' => User::select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    public function store(StoreReporteContenidoRequest $request)
    {
        $reporte = ReporteContenido::create($request->validated());

        $autorArchivo = $reporte->archivo?->autor;
        if ($autorArchivo && $autorArchivo->email) {
            Mail::to($autorArchivo->email)->send(new ReporteContenidoMail($reporte));
        }

        return redirect()->route('reportes.index')
            ->with('success', "Reporte #{$reporte->id} creado.");
    }

    public function edit(ReporteContenido $reporte)
    {
        return inertia('reportes/edit', [
            'reporte' => $reporte,
            'archivos' => Archivo::select('id', 'titulo')->orderBy('titulo')->get(),
            'usuarios' => User::select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    public function update(UpdateReporteContenidoRequest $request, ReporteContenido $reporte)
    {
        $reporte->update($request->validated());

        return redirect()->route('reportes.index')
            ->with('success', "Reporte #{$reporte->id} actualizado.");
    }

    public function destroy(ReporteContenido $reporte)
    {
        $reporte->delete();

        return redirect()->route('reportes.index')
            ->with('success', "Reporte #{$reporte->id} eliminado.");
    }
}
