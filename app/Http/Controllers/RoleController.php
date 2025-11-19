<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRoleRequest;
use App\Http\Requests\UpdateRoleRequest;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    public function index()
    {
        return inertia('roles/index', [
            'roles' => Role::with('permissions')
                ->latest()
                ->paginate(10)
                ->through(function ($role) {
                    return [
                        'id' => $role->id,
                        'name' => $role->name,
                        'created_at' => optional($role->created_at)->format('d/m/Y H:i'),
                        'permissions' => $role->permissions->pluck('name'),
                    ];
                }),
        ]);
    }

    public function create()
    {
        return inertia('roles/create', [
            'permissions' => Permission::orderBy('name')->pluck('name'),
        ]);
    }

    public function store(StoreRoleRequest $request)
    {
        $role = Role::create([
            'name' => $request->name,
            'guard_name' => 'web',
        ]);

        if ($request->permissions) {
            $role->syncPermissions($request->permissions);
        }

        return redirect()->route('roles.index')
            ->with('success', 'Rol creado correctamente.');
    }

    public function edit(Role $role)
    {
        return inertia('roles/edit', [
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'permissions' => $role->permissions()->pluck('name')->map(fn ($n) => ['name' => $n]),
            ],
            'permissions' => Permission::orderBy('name')->pluck('name'),
        ]);
    }

    public function update(UpdateRoleRequest $request, Role $role)
    {
        $role->update([
            'name' => $request->name,
        ]);

        $role->syncPermissions($request->permissions ?? []);

        return redirect()->route('roles.index')
            ->with('success', 'Rol actualizado correctamente.');
    }

    public function destroy(Role $role)
    {
        $role->delete();

        return redirect()->route('roles.index')
            ->with('success', 'Rol eliminado correctamente.');
    }
}
