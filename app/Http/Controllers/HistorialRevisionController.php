<?php

namespace App\Http\Controllers;

use App\Models\HistorialRevision;
use App\Models\Archivo;
use App\Models\User;
use App\Models\EstadoArchivo;
use App\Http\Requests\StoreHistorialRevisionRequest;
use App\Http\Requests\UpdateHistorialRevisionRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Mail\ArchivoRevisadoMail;

class HistorialRevisionController extends Controller
{
    public function index()
    {
        return inertia('historial-revisiones/index', [
            'revisiones' => HistorialRevision::with(['archivo:id,titulo', 'revisor:id,name'])
                ->latest()
                ->paginate(10),
        ]);
    }

    public function create()
    {
        return inertia('historial-revisiones/create', [
            'revision' => new HistorialRevision(),
            'archivos' => Archivo::with('estado:id,nombre')
                ->select('id', 'titulo', 'estado_archivo_id')
                ->orderBy('titulo')
                ->get(),
            'usuarios' => User::select('id', 'name')->orderBy('name')->get(),
            'estados' => EstadoArchivo::select('id', 'nombre')->orderBy('nombre')->get(),
        ]);
    }

    public function store(StoreHistorialRevisionRequest $request)
    {
        $data = $request->validated();

        $revision = DB::transaction(function () use ($data) {
            $archivo = Archivo::with('estado:id,nombre')->findOrFail($data['archivo_id']);
            $estadoNuevo = EstadoArchivo::findOrFail($data['estado_nuevo_id']);

            $data['estado_previo'] = $archivo->estado->nombre ?? 'Sin estado';
            $data['estado_nuevo'] = $estadoNuevo->nombre;
            unset($data['estado_nuevo_id']);

            // Actualizamos el estado del archivo
            $archivo->estado_archivo_id = $estadoNuevo->id;
            $archivo->save();

            return HistorialRevision::create($data);
        });

        if ($revision->archivo->autor && $revision->archivo->autor->email) {
            Mail::to($revision->archivo->autor->email)->send(new ArchivoRevisadoMail($revision->archivo, $revision->estado_nuevo));
        }

        return redirect()->route('historial-revisiones.index')
            ->with('success', "Revisión #{$revision->id} creada.");
    }

    public function edit(HistorialRevision $historialRevision)
    {
        return inertia('historial-revisiones/edit', [
            'revision' => $historialRevision,
            'archivos' => Archivo::with('estado:id,nombre')
                ->select('id', 'titulo', 'estado_archivo_id')
                ->orderBy('titulo')
                ->get(),
            'usuarios' => User::select('id', 'name')->orderBy('name')->get(),
            'estados' => EstadoArchivo::select('id', 'nombre')->orderBy('nombre')->get(),
        ]);
    }

    public function update(UpdateHistorialRevisionRequest $request, HistorialRevision $historialRevision)
    {
        $data = $request->validated();

        DB::transaction(function () use ($data, $historialRevision) {
            $archivo = Archivo::with('estado:id,nombre')->findOrFail($data['archivo_id']);
            $estadoNuevo = EstadoArchivo::findOrFail($data['estado_nuevo_id']);

            $data['estado_previo'] = $archivo->estado->nombre ?? 'Sin estado';
            $data['estado_nuevo'] = $estadoNuevo->nombre;
            unset($data['estado_nuevo_id']);

            // Actualizamos el estado del archivo
            $archivo->estado_archivo_id = $estadoNuevo->id;
            $archivo->save();

            $historialRevision->update($data);
        });

        if ($historialRevision->archivo->autor && $historialRevision->archivo->autor->email) {
            Mail::to($historialRevision->archivo->autor->email)->send(new ArchivoRevisadoMail($historialRevision->archivo, $historialRevision->estado_nuevo));
        }

        return redirect()->route('historial-revisiones.index')
            ->with('success', "Revisión #{$historialRevision->id} actualizada.");
    }

    public function destroy(HistorialRevision $historialRevision)
    {
        $historialRevision->delete();

        return redirect()->route('historial-revisiones.index')
            ->with('success', "Revisión #{$historialRevision->id} eliminada.");
    }
}
