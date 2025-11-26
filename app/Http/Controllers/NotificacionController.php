<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreNotificacionRequest;
use App\Http\Requests\UpdateNotificacionRequest;
use App\Models\Notificacion;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificacionController extends Controller
{
    public function userIndex(Request $request)
    {
        $user = $request->user();
        $notificaciones = Notificacion::with(['actor:id,name'])
            ->where('user_id', $user->id)
            ->latest()
            ->paginate(10);

        return inertia('notificaciones/user-index', [
            'notificaciones' => $notificaciones,
        ]);
    }

    public function adminIndex()
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

        return redirect()->route('admin.notificaciones.index')
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

        return redirect()->route('admin.notificaciones.index')
            ->with('success', "Notificación #{$notificacion->id} actualizada.");
    }

    public function destroy(Notificacion $notificacion)
    {
        $notificacion->delete();

        return redirect()->route('admin.notificaciones.index')
            ->with('success', "Notificación #{$notificacion->id} eliminada.");
    }

    public function markRead(Request $request, Notificacion $notificacion)
    {
        $this->authorizeNotification($request->user(), $notificacion);
        if (!$notificacion->leido_en) {
            $notificacion->update(['leido_en' => now()]);
        }
        return back()->with('success', 'Notificación marcada como leída.');
    }

    public function markUnread(Request $request, Notificacion $notificacion)
    {
        $this->authorizeNotification($request->user(), $notificacion);
        if ($notificacion->leido_en) {
            $notificacion->update(['leido_en' => null]);
        }
        return back()->with('success', 'Notificación marcada como no leída.');
    }

    public function markAllRead(Request $request)
    {
        $user = $request->user();
        if (!$user || !$user->can('view_notifipersonal')) {
            abort(403);
        }
        Notificacion::where('user_id', $user->id)->whereNull('leido_en')->update(['leido_en' => now()]);
        return back()->with('success', 'Todas las notificaciones marcadas como leídas.');
    }

    private function authorizeNotification(?User $user, Notificacion $notificacion): void
    {
        if (!$user || $notificacion->user_id !== $user->id) {
            abort(403);
        }
    }
}
