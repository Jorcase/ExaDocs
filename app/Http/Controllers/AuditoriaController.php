<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAuditoriaRequest;
use App\Http\Requests\UpdateAuditoriaRequest;
use App\Models\Auditoria;
use App\Models\User;

class AuditoriaController extends Controller
{
    public function index()
    {
        return inertia('auditorias/index', [
            'auditorias' => Auditoria::with('user:id,name')
                ->latest('created_at')
                ->paginate(10),
        ]);
    }

    public function create()
    {
        return inertia('auditorias/create', [
            'auditoria' => new Auditoria(),
            'usuarios' => User::select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    public function store(StoreAuditoriaRequest $request)
    {
        $auditoria = Auditoria::create($request->validated());

        return redirect()->route('auditorias.index')
            ->with('success', "Auditoría #{$auditoria->id} creada.");
    }

    public function edit(Auditoria $auditoria)
    {
        return inertia('auditorias/edit', [
            'auditoria' => $auditoria,
            'usuarios' => User::select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    public function update(UpdateAuditoriaRequest $request, Auditoria $auditoria)
    {
        $auditoria->update($request->validated());

        return redirect()->route('auditorias.index')
            ->with('success', "Auditoría #{$auditoria->id} actualizada.");
    }

    public function destroy(Auditoria $auditoria)
    {
        $auditoria->delete();

        return redirect()->route('auditorias.index')
            ->with('success', "Auditoría #{$auditoria->id} eliminada.");
    }
}
