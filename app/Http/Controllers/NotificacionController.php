<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreNotificacionRequest;
use App\Http\Requests\UpdateNotificacionRequest;
use App\Models\Notificacion;
use App\Models\User;

class NotificacionController extends Controller
{
    public function index()
    {
        return inertia('notificaciones/index', [
            'notificaciones' => Notificacion::with('user:id,name')->latest()->paginate(10),
        ]);
    }

    public function create()
    {
        return inertia('notificaciones/create', [
            'notificacion' => new Notificacion(),
            'usuarios' => User::select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    public function store(StoreNotificacionRequest $request)
    {
        $notificacion = Notificacion::create($request->validated());

        return redirect()->route('notificaciones.index')
            ->with('success', "Notificación #{$notificacion->id} creada.");
    }

    public function edit(Notificacion $notificacion)
    {
        return inertia('notificaciones/edit', [
            'notificacion' => $notificacion,
            'usuarios' => User::select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    public function update(UpdateNotificacionRequest $request, Notificacion $notificacion)
    {
        $notificacion->update($request->validated());

        return redirect()->route('notificaciones.index')
            ->with('success', "Notificación #{$notificacion->id} actualizada.");
    }

    public function destroy(Notificacion $notificacion)
    {
        $notificacion->delete();

        return redirect()->route('notificaciones.index')
            ->with('success', "Notificación #{$notificacion->id} eliminada.");
    }
}
