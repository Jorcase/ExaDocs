<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserProfileRequest;
use App\Http\Requests\UpdateUserProfileRequest;
use App\Models\UserProfile;
use App\Models\User;
use App\Models\Carrera;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;

class UserProfileController extends Controller
{
    public function index()
    {
        return inertia('perfiles/index', [
            'perfiles' => UserProfile::with(['user:id,name,email', 'carrera:id,nombre'])
                ->latest()
                ->paginate(10),
        ]);
    }

    public function create()
    {
        return inertia('perfiles/create', [
            'perfil' => new UserProfile(),
            'usuarios' => User::select('id', 'name', 'email')->orderBy('name')->get(),
            'carreras' => Carrera::select('id', 'nombre')->orderBy('nombre')->get(),
        ]);
    }

    public function store(StoreUserProfileRequest $request)
    {
        $data = $request->validated();

        if ($request->hasFile('avatar')) {
            $data['avatar_path'] = $request->file('avatar')->store('avatars', 'public');
        }

        $perfil = UserProfile::create($data);

        return redirect()->route('perfiles.index')
            ->with('success', "Perfil de {$perfil->user->name} creado.");
    }

    public function edit(UserProfile $perfile)
    {
        return inertia('perfiles/edit', [
            'perfil' => $perfile,
            'usuarios' => User::select('id', 'name', 'email')->orderBy('name')->get(),
            'carreras' => Carrera::select('id', 'nombre')->orderBy('nombre')->get(),
        ]);
    }

    public function update(UpdateUserProfileRequest $request, UserProfile $perfile)
    {
        $data = $request->validated();

        if ($request->hasFile('avatar')) {
            if ($perfile->avatar_path) {
                Storage::disk('public')->delete($perfile->avatar_path);
            }
            $data['avatar_path'] = $request->file('avatar')->store('avatars', 'public');
        }

        $perfile->update($data);

        return redirect()->route('perfiles.index')
            ->with('success', "Perfil de {$perfile->user->name} actualizado.");
    }

    public function destroy(UserProfile $perfile)
    {
        $perfile->delete();

        return redirect()->route('perfiles.index')
            ->with('success', "Perfil eliminado.");
    }

    public function generateReport()
    {
        $perfiles = UserProfile::with(['user:id,name,email', 'carrera:id,nombre'])->orderBy('id')->get();
        $pdf = Pdf::loadView('pdf.perfiles', compact('perfiles'));
        return $pdf->stream('perfiles.pdf');
    }
}
