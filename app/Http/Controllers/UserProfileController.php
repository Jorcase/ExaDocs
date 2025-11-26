<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserProfileRequest;
use App\Http\Requests\UpdateUserProfileRequest;
use App\Models\UserProfile;
use App\Models\User;
use App\Models\Carrera;
use App\Models\Archivo;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Builder;

class UserProfileController extends Controller
{
    public function index(Request $request)
    {
        $table = (new UserProfile())->getTable();
        $search = $request->string('search');
        $carreraId = $request->input('carrera_id');
        $documento = $request->string('documento');
        $telefono = $request->string('telefono');
        $sort = $request->input('sort', 'id');
        $direction = $request->input('direction', 'desc');

        $query = $this->buildFilteredQuery($request);

        [$sort, $direction] = $this->normalizeSort($sort, $direction);
        $this->applySorting($query, $table, $sort, $direction);

        return inertia('perfiles/index', [
            'perfiles' => $query->paginate(10)->withQueryString(),
            'filters' => [
                'search' => $search->value(),
                'carrera_id' => $carreraId,
                'documento' => $documento->value(),
                'telefono' => $telefono->value(),
                'sort' => $sort,
                'direction' => $direction,
            ],
            'carreras' => Carrera::select('id', 'nombre')->orderBy('nombre')->get(),
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
            unset($data['avatar']);
        }

        $this->marcarPerfilCompleto($perfil = new UserProfile($data));

        $perfil = UserProfile::create($data);

        if ($perfil->user && !$perfil->user->hasRole('Estudiante') && $perfil->perfil_completo) {
            $perfil->user->assignRole('Estudiante');
        }

        return redirect()->route('perfiles.index')
            ->with('success', "Perfil de {$perfil->user->name} creado.");
    }

    public function edit(UserProfile $perfile)
    {
        $this->authorize('update', $perfile);

        $perfile->load('user');

        return inertia('perfiles/edit', [
            'perfil' => $perfile,
            'usuarios' => User::select('id', 'name', 'email')->orderBy('name')->get(),
            'carreras' => Carrera::select('id', 'nombre')->orderBy('nombre')->get(),
        ]);
    }

    public function update(UpdateUserProfileRequest $request, UserProfile $perfile)
    {
        $this->authorize('update', $perfile);

        $request->merge([
            'user_id' => $perfile->user_id,
            'carrera_principal_id' => $request->input('carrera_principal_id') ?: null,
        ]);
        $data = $request->validated();

        if ($request->hasFile('avatar')) {
            if ($perfile->avatar_path) {
                Storage::disk('public')->delete($perfile->avatar_path);
            }
            $data['avatar_path'] = $request->file('avatar')->store('avatars', 'public');
            unset($data['avatar']);
        } else {
            unset($data['avatar']);
        }

        $this->marcarPerfilCompleto($perfile, $data);

        $perfile->update($data);

        if ($perfile->user && !$perfile->user->hasRole('Estudiante') && $perfile->perfil_completo) {
            $perfile->user->assignRole('Estudiante');
        }

        return redirect()->route('perfiles.index')
            ->with('success', "Perfil de {$perfile->user->name} actualizado.");
    }

    public function show(UserProfile $perfile)
    {
        $perfile->load(['user', 'carrera']);
        $archivos = Archivo::with([
            'materia:id,nombre',
            'tipo:id,nombre',
            'estado:id,nombre',
        ])
            ->where('user_id', $perfile->user_id)
            ->orderByDesc('publicado_en')
            ->orderByDesc('id')
            ->paginate(6, ['id', 'user_id', 'materia_id', 'tipo_archivo_id', 'estado_archivo_id', 'titulo', 'publicado_en'])
            ->withQueryString();

        return inertia('perfiles/show', [
            'perfil' => $perfile,
            'archivos' => $archivos,
        ]);
    }

    public function showPublic(UserProfile $perfile)
    {
        $perfile->load(['user', 'carrera']);
        $archivos = Archivo::with([
            'materia:id,nombre',
            'tipo:id,nombre',
            'estado:id,nombre',
        ])
            ->where('user_id', $perfile->user_id)
            ->orderByDesc('publicado_en')
            ->orderByDesc('id')
            ->paginate(6, ['id', 'user_id', 'materia_id', 'tipo_archivo_id', 'estado_archivo_id', 'titulo', 'publicado_en'])
            ->withQueryString();

        return inertia('perfiles/show', [
            'perfil' => $perfile,
            'archivos' => $archivos,
        ]);
    }

    public function showProfile()
    {
        $user = auth()->user();
        $perfil = UserProfile::firstOrCreate(
            ['user_id' => $user->id],
            ['perfil_completo' => false]
        );
        $perfil->load(['user', 'carrera']);
        $archivos = Archivo::with([
            'materia:id,nombre',
            'tipo:id,nombre',
            'estado:id,nombre',
        ])
            ->where('user_id', $perfil->user_id)
            ->orderByDesc('publicado_en')
            ->orderByDesc('id')
            ->paginate(6, ['id', 'user_id', 'materia_id', 'tipo_archivo_id', 'estado_archivo_id', 'titulo', 'publicado_en'])
            ->withQueryString();

        return inertia('perfiles/show', [
            'perfil' => $perfil,
            'archivos' => $archivos,
        ]);
    }

    public function editProfile()
    {
        $user = auth()->user();
        $perfil = UserProfile::firstOrCreate(
            ['user_id' => $user->id],
            ['perfil_completo' => false]
        );

        $this->authorize('update', $perfil);

        return inertia('perfiles/edit-self', [
            'perfil' => $perfil,
            'carreras' => Carrera::select('id', 'nombre')->orderBy('nombre')->get(),
        ]);
    }

    public function updateProfile(UpdateUserProfileRequest $request)
    {
        $user = auth()->user();
        $perfil = UserProfile::firstOrCreate(
            ['user_id' => $user->id],
            ['perfil_completo' => false]
        );
        $this->authorize('update', $perfil);

        $request->merge([
            'user_id' => $perfil->user_id,
            'carrera_principal_id' => $request->input('carrera_principal_id') ?: null,
        ]);
        $data = $request->validated();

        if ($request->hasFile('avatar')) {
            if ($perfil->avatar_path) {
                Storage::disk('public')->delete($perfil->avatar_path);
            }
            $data['avatar_path'] = $request->file('avatar')->store('avatars', 'public');
            unset($data['avatar']);
        } else {
            unset($data['avatar']);
        }

        $this->marcarPerfilCompleto($perfil, $data);
        $perfil->update($data);

        if ($perfil->user && !$perfil->user->hasRole('Estudiante') && $perfil->perfil_completo) {
            $perfil->user->assignRole('Estudiante');
        }

        return redirect()->route('perfil.show')->with('success', 'Perfil actualizado.');
    }

    public function destroy(UserProfile $perfile)
    {
        $this->authorize('delete', $perfile);

        $perfile->delete();

        return redirect()->route('perfiles.index')
            ->with('success', "Perfil eliminado.");
    }

    public function generateReport()
    {
        $request = request();
        $table = (new UserProfile())->getTable();
        $sort = $request->input('sort', 'id');
        $direction = $request->input('direction', 'desc');
        [$sort, $direction] = $this->normalizeSort($sort, $direction);

        $query = $this->buildFilteredQuery($request);
        $this->applySorting($query, $table, $sort, $direction);

        $perfiles = $query->get();
        $pdf = Pdf::loadView('pdf.perfiles', compact('perfiles'));
        return $pdf->stream('perfiles.pdf');
    }

    private function buildFilteredQuery(Request $request): Builder
    {
        $table = (new UserProfile())->getTable();
        $search = $request->string('search');
        $carreraId = $request->input('carrera_id');
        $documento = $request->string('documento');
        $telefono = $request->string('telefono');

        $query = UserProfile::query()->with(['user:id,name,email', 'carrera:id,nombre']);

        if ($search->isNotEmpty()) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', fn ($u) => $u->where('name', 'like', '%' . $search . '%')
                    ->orWhere('email', 'like', '%' . $search . '%'))
                    ->orWhere('documento', 'like', '%' . $search . '%')
                    ->orWhere('telefono', 'like', '%' . $search . '%');
            });
        }

        if ($carreraId) {
            $query->where("{$table}.carrera_principal_id", (int) $carreraId);
        }

        if ($documento->isNotEmpty()) {
            $query->where("{$table}.documento", 'like', '%' . $documento . '%');
        }

        if ($telefono->isNotEmpty()) {
            $query->where("{$table}.telefono", 'like', '%' . $telefono . '%');
        }

        return $query;
    }

    private function normalizeSort(string $sort, string $direction): array
    {
        $allowedSorts = ['id', 'user', 'email', 'documento', 'telefono', 'carrera'];
        if (!in_array($sort, $allowedSorts, true)) {
            $sort = 'id';
        }
        $direction = $direction === 'asc' ? 'asc' : 'desc';
        return [$sort, $direction];
    }

    private function applySorting(Builder $query, string $table, string $sort, string $direction): void
    {
        if (in_array($sort, ['user', 'email'], true)) {
            $query->leftJoin('users', 'users.id', '=', "{$table}.user_id")
                ->orderBy($sort === 'user' ? 'users.name' : 'users.email', $direction)
                ->select("{$table}.*");
        } elseif ($sort === 'carrera') {
            $query->leftJoin('carreras', 'carreras.id', '=', "{$table}.carrera_principal_id")
                ->orderBy('carreras.nombre', $direction)
                ->select("{$table}.*");
        } else {
            $query->orderBy("{$table}.{$sort}", $direction);
        }
    }

    private function marcarPerfilCompleto(UserProfile $perfil, ?array $data = null): void
    {
        $payload = $data ?? $perfil->getAttributes();
        $completo = !empty($payload['nombre_completo'])
            && !empty($payload['documento'])
            && !empty($payload['telefono'])
            && !empty($payload['carrera_principal_id']);

        if ($completo) {
            $perfil->perfil_completo = true;
            $perfil->perfil_completado_en = now();
        }
    }
}
