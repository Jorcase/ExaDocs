<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserProfileRequest;
use App\Http\Requests\UpdateUserProfileRequest;
use App\Models\UserProfile;
use App\Models\User;
use App\Models\Carrera;
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
}
