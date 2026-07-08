<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserProfileRequest;
use App\Http\Requests\UpdateUserProfileRequest;
use App\Models\UserProfile;
use App\Models\User;
use App\Models\Carrera;
use App\Models\Archivo;
use App\Models\MateriaUserProgreso;
use App\Models\Plan_Estudio;
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

        // Sync careers
        $syncData = [];
        if ($perfil->carrera_principal_id) {
            $syncData[$perfil->carrera_principal_id] = ['es_principal' => true];
        }
        if ($request->has('carreras_secundarias')) {
            foreach ($request->input('carreras_secundarias') as $carreraId) {
                if ($carreraId != $perfil->carrera_principal_id) {
                    $syncData[$carreraId] = ['es_principal' => false];
                }
            }
        }
        if ($perfil->user) {
            $perfil->user->carreras()->sync($syncData);
        }

        if ($perfil->user && !$perfil->user->hasRole('Estudiante') && $perfil->perfil_completo) {
            $perfil->user->assignRole('Estudiante');
        }

        return redirect()->route('perfiles.index')
            ->with('success', "Perfil de {$perfil->user->name} creado.");
    }

    public function edit(UserProfile $perfile)
    {
        $this->authorize('update', $perfile);

        $perfile->load('user.carreras');

        return inertia('perfiles/edit', [
            'perfil' => $perfile,
            'usuarios' => User::select('id', 'name', 'email')->orderBy('name')->get(),
            'carreras' => Carrera::select('id', 'nombre')->orderBy('nombre')->get(),
            'userCarreras' => $perfile->user ? $perfile->user->carreras->map(fn($c) => [
                'id' => $c->id,
                'es_principal' => (bool)$c->pivot->es_principal,
            ]) : [],
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

        if ($request->input('remove_avatar')) {
            if ($perfile->avatar_path) {
                Storage::disk('public')->delete($perfile->avatar_path);
            }
            $data['avatar_path'] = null;
            unset($data['avatar']);
        } elseif ($request->hasFile('avatar')) {
            if ($perfile->avatar_path) {
                Storage::disk('public')->delete($perfile->avatar_path);
            }
            $data['avatar_path'] = $request->file('avatar')->store('avatars', 'public');
            unset($data['avatar']);
        } else {
            unset($data['avatar']);
        }
        unset($data['remove_avatar']);

        $this->marcarPerfilCompleto($perfile, $data);

        $perfile->update($data);

        // Sync careers
        $syncData = [];
        if ($perfile->carrera_principal_id) {
            $syncData[$perfile->carrera_principal_id] = ['es_principal' => true];
        }
        $carrerasSecundarias = $request->input('carreras_secundarias', []);
        foreach ($carrerasSecundarias as $carreraId) {
            if ($carreraId != $perfile->carrera_principal_id) {
                $syncData[$carreraId] = ['es_principal' => false];
            }
        }
        if ($perfile->user) {
            $perfile->user->carreras()->sync($syncData);
        }

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
        $perfile->load(['user.carreras', 'carrera']);
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

        $stats = $this->getProfileProgressStats($perfile);

        return inertia('perfiles/show', [
            'perfil' => $perfile,
            'archivos' => $archivos,
            'progresoStats' => $stats['progresoStats'],
            'semesterProgress' => $stats['semesterProgress'],
        ]);
    }

    public function showProfile()
    {
        $user = auth()->user();
        $perfil = UserProfile::firstOrCreate(
            ['user_id' => $user->id],
            ['perfil_completo' => false]
        );
        $perfil->load(['user.carreras', 'carrera']);
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

        $stats = $this->getProfileProgressStats($perfil);

        return inertia('perfiles/show', [
            'perfil' => $perfil,
            'archivos' => $archivos,
            'progresoStats' => $stats['progresoStats'],
            'semesterProgress' => $stats['semesterProgress'],
        ]);
    }

    public function editProfile()
    {
        $user = auth()->user();
        $perfil = UserProfile::firstOrCreate(
            ['user_id' => $user->id],
            ['perfil_completo' => false]
        );
        $user->load('carreras');

        $this->authorize('update', $perfil);

        return inertia('perfiles/edit-self', [
            'perfil' => $perfil,
            'carreras' => Carrera::select('id', 'nombre')->orderBy('nombre')->get(),
            'userCarreras' => $user->carreras->map(fn($c) => [
                'id' => $c->id,
                'es_principal' => (bool)$c->pivot->es_principal,
            ]),
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

        if ($request->input('remove_avatar')) {
            if ($perfil->avatar_path) {
                Storage::disk('public')->delete($perfil->avatar_path);
            }
            $data['avatar_path'] = null;
            unset($data['avatar']);
        } elseif ($request->hasFile('avatar')) {
            if ($perfil->avatar_path) {
                Storage::disk('public')->delete($perfil->avatar_path);
            }
            $data['avatar_path'] = $request->file('avatar')->store('avatars', 'public');
            unset($data['avatar']);
        } else {
            unset($data['avatar']);
        }
        unset($data['remove_avatar']);

        $this->marcarPerfilCompleto($perfil, $data);
        $perfil->update($data);

        // Sync careers
        $syncData = [];
        if ($perfil->carrera_principal_id) {
            $syncData[$perfil->carrera_principal_id] = ['es_principal' => true];
        }
        $carrerasSecundarias = $request->input('carreras_secundarias', []);
        foreach ($carrerasSecundarias as $carreraId) {
            if ($carreraId != $perfil->carrera_principal_id) {
                $syncData[$carreraId] = ['es_principal' => false];
            }
        }
        $user->carreras()->sync($syncData);

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

    private function getProfileProgressStats($perfil)
    {
        $user = auth()->user();
        $activeCarreraId = null;
        if ($user && $user->id === $perfil->user_id) {
            $activeCarreraId = session('active_carrera_id');
        }
        if (!$activeCarreraId) {
            $activeCarreraId = $perfil->carrera_principal_id ?? $perfil->user->carreras()->first()?->id;
        }

        $progresoStats = [
            'total_materias' => 0,
            'aprobadas_count' => 0,
            'promedio' => 0,
            'porcentaje' => 0,
        ];
        $semesterProgress = [];

        if ($activeCarreraId) {
            $carrera = Carrera::with(['materias' => function ($query) {
                $query->select('materias.id', 'materias.nombre')
                    ->withPivot('cuatrimestre', 'anio_sugerido');
            }])->find($activeCarreraId);

            if ($carrera) {
                $planEstudioId = $perfil->user->carreras()->where('carreras.id', $activeCarreraId)->first()?->pivot->plan_estudio_id;
                $optativasRequeridas = 0;
                $tipoAsignaturas = [];

                if ($planEstudioId) {
                    $plan = Plan_Estudio::find($planEstudioId);
                    if ($plan) {
                        $optativasRequeridas = $plan->optativas_requeridas ?? 0;
                        $tipoAsignaturas = \DB::table('plan_materia')
                            ->where('plan_id', $planEstudioId)
                            ->pluck('tipo_asignatura', 'materia_id')
                            ->toArray();
                    }
                }

                $progreso = $perfil->user->progresos()
                    ->where('carrera_id', $activeCarreraId)
                    ->get()
                    ->keyBy('materia_id');

                $materiasPlan = $carrera->materias
                    ->filter(function ($materia) use ($planEstudioId, $tipoAsignaturas) {
                        if ($planEstudioId) {
                            return isset($tipoAsignaturas[$materia->id]);
                        }
                        return true;
                    })
                    ->map(function ($materia) use ($progreso, $tipoAsignaturas) {
                        $prog = $progreso->get($materia->id);
                        return [
                            'id' => $materia->id,
                            'estado' => $prog ? $prog->estado : 'pendiente',
                            'nota' => $prog ? $prog->nota : null,
                            'cuatrimestre' => $materia->pivot->cuatrimestre,
                            'anio_sugerido' => $materia->pivot->anio_sugerido,
                            'tipo_asignatura' => $tipoAsignaturas[$materia->id] ?? 'obligatoria',
                        ];
                    });

                $obligatorias = $materiasPlan->filter(fn($m) => $m['tipo_asignatura'] !== 'optativa');
                $optativas = $materiasPlan->filter(fn($m) => $m['tipo_asignatura'] === 'optativa');

                $ob_aprobadas = $obligatorias->filter(fn($m) => in_array($m['estado'], ['aprobada', 'promocionada']));
                $opt_aprobadas = $optativas->filter(fn($m) => in_array($m['estado'], ['aprobada', 'promocionada']));

                $count_opt_aprobadas = min($opt_aprobadas->count(), $optativasRequeridas);

                $aprobadasCount = $ob_aprobadas->count() + $count_opt_aprobadas;
                $totalMaterias = $obligatorias->count() + $optativasRequeridas;

                $sumNotas = 0;
                $countNotas = 0;
                foreach ($materiasPlan as $m) {
                    if (in_array($m['estado'], ['aprobada', 'promocionada']) && $m['nota']) {
                        $sumNotas += $m['nota'];
                        $countNotas++;
                    }
                }

                $promedio = $countNotas > 0 ? round($sumNotas / $countNotas, 2) : 0;
                $porcentaje = $totalMaterias > 0 ? round(($aprobadasCount / $totalMaterias) * 100, 1) : 0;

                $progresoStats = [
                    'total_materias' => $totalMaterias,
                    'aprobadas_count' => $aprobadasCount,
                    'promedio' => $promedio,
                    'porcentaje' => $porcentaje,
                ];

                $anios = $materiasPlan->groupBy('anio_sugerido');
                foreach ($anios as $anio => $mats) {
                    $yearOblig = $mats->filter(fn($m) => $m['tipo_asignatura'] !== 'optativa');
                    $yearOpt = $mats->filter(fn($m) => $m['tipo_asignatura'] === 'optativa');

                    $yearObAprob = $yearOblig->filter(fn($m) => in_array($m['estado'], ['aprobada', 'promocionada']))->count();
                    $yearOptAprob = $yearOpt->filter(fn($m) => in_array($m['estado'], ['aprobada', 'promocionada']))->count();

                    $totOptInYear = $yearOpt->count();
                    $yearReqOpt = min($totOptInYear, $optativasRequeridas);
                    $yearCountOptAprob = min($yearOptAprob, $yearReqOpt);
                    
                    $tot = $yearOblig->count() + $yearReqOpt;
                    $aprob = $yearObAprob + $yearCountOptAprob;

                    $pct = $tot > 0 ? round(($aprob / $tot) * 100) : 0;
                    $semesterProgress[] = [
                        'label' => "Año " . $anio,
                        'percentage' => $pct,
                    ];
                }
            }
        }

        return [
            'progresoStats' => $progresoStats,
            'semesterProgress' => array_values($semesterProgress),
        ];
    }
}
