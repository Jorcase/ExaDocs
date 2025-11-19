<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePermissionRequest;
use App\Http\Requests\UpdatePermissionRequest;
use Spatie\Permission\Models\Permission;

class PermissionController extends Controller
{
    public function index()
    {
        return inertia('permissions/index', [
            'permissions' => Permission::query()
                ->latest()
                ->paginate(10)
                ->through(function ($permiso) {
                    return [
                        'id' => $permiso->id,
                        'name' => $permiso->name,
                        'created_at' => optional($permiso->created_at)->format('d/m/Y H:i'),
                    ];
                }),
        ]);
    }

    public function create()
    {
        return inertia('permissions/create');
    }

    public function store(StorePermissionRequest $request)
    {
        Permission::create([
            'name' => $request->name,
            'guard_name' => 'web',
        ]);

        return redirect()->route('permissions.index')
            ->with('success', 'Permiso creado correctamente.');
    }

    public function edit(Permission $permiso)
    {
        return inertia('permissions/edit', [
            'permiso' => $permiso,
        ]);
    }

    public function update(UpdatePermissionRequest $request, Permission $permiso)
    {
        $permiso->update([
            'name' => $request->name,
        ]);

        return redirect()->route('permissions.index')
            ->with('success', 'Permiso actualizado correctamente.');
    }

    public function destroy(Permission $permiso)
    {
        $permiso->delete();

        return redirect()->route('permissions.index')
            ->with('success', 'Permiso eliminado correctamente.');
    }
}
