<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreArchivoRequest;
use App\Http\Requests\UpdateArchivoRequest;
use App\Models\Archivo;
use Illuminate\Support\Facades\Auth;
use App\Models\Materia;
use App\Models\TipoArchivo;
use App\Models\EstadoArchivo;
use App\Models\Plan_Estudio;
use App\Models\Carrera;
use App\Models\User;
use App\Models\TipoCarrera;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use App\Mail\ArchivoCreadoMail;
use App\Mail\ArchivoActualizadoMail;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Exports\ArchivosExport;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Builder;
use App\Services\NotificacionService;


class ArchivoController extends Controller
{
    public function index(Request $request)
    {
        $sortParam = $request->input('sort', 'date');
        $sort = in_array($sortParam, ['title', 'popular'], true) ? $sortParam : 'date';
        $direction = $request->input('direction', 'desc') === 'asc' ? 'asc' : 'desc';
        $user = $request->user();
        $userId = $user?->id;
        $canViewAllEstados = $user && ($user->can('state_archivo') || $user->can('view_moderacion'));
        $estadoAprobadoId = $this->estadoAprobadoId();

        $query = $this->buildFilteredQuery($request);

        $archivos = $query
            ->when($sort === 'title', fn($q) => $q->orderBy('titulo', $direction))
            ->when($sort === 'popular', fn($q) => $q->orderBy('visitas_count', $direction))
            ->when($sort === 'date', fn($q) => $q->orderBy('created_at', $direction))
            ->paginate(9)
            ->through(function ($archivo) use ($request) {
                $auth = $request->user();
                $archivo->can_update = $auth ? Gate::forUser($auth)->allows('update', $archivo) : false;
                $archivo->can_delete = $auth ? Gate::forUser($auth)->allows('delete', $archivo) : false;

                return $archivo;
            })
            ->withQueryString();

        return inertia('archivos/index', [
            'archivos' => $archivos,
            'filters' => [
                'search' => $request->input('search'),
                'autor' => $request->input('autor'),
                'tipo_carrera_id' => $request->input('tipo_carrera_id'),
                'carrera_id' => $request->input('carrera_id'),
                'materia_id' => $request->input('materia_id'),
                'tipo_archivo_id' => $request->input('tipo_archivo_id'),
                'plan_estudio_id' => $request->input('plan_estudio_id'),
                'estado_archivo_id' => $request->input('estado_archivo_id'),
                'sort' => $sort,
                'direction' => $direction,
                'page' => (int) $request->input('page', 1),
            ],
            'autores' => User::select('name')->orderBy('name')->pluck('name'),
            'tipoCarreras' => TipoCarrera::select('id', 'nombre')->orderBy('nombre')->get(),
            'carreras' => Carrera::select('id', 'nombre', 'tipo_carrera_id')->orderBy('nombre')->get(),
            'materias' => Materia::with([
                'carreras:id',
                'planesEstudio:id',
            ])
                ->select('id', 'nombre')
                ->orderBy('nombre')
                ->get()
                ->map(function ($materia) {
                    return [
                        'id' => $materia->id,
                        'nombre' => $materia->nombre,
                        'carrera_ids' => $materia->carreras->pluck('id'),
                        'plan_ids' => $materia->planesEstudio->pluck('id'),
                    ];
                }),
            'tipos' => TipoArchivo::select('id', 'nombre')->orderBy('nombre')->get(),
            'planes' => Plan_Estudio::select('id', 'nombre', 'carrera_id')->orderBy('nombre')->get(),
            'estados' => EstadoArchivo::select('id', 'nombre')->orderBy('nombre')->get(),
        ]);
    }

    public function create()
    {
        $user = auth()->user();
        $canSetEstado = $user && $user->can('state_archivo');
        $estadoPendienteId = $this->estadoPendienteId();

        return inertia('archivos/create', [
            'archivo' => new Archivo(),
            'carreras' => Carrera::with(['planesEstudio:id,nombre,carrera_id', 'materias:id,nombre'])
                ->select('id', 'nombre')
                ->orderBy('nombre')
                ->get(),
            'planes' => Plan_Estudio::with('materias:id,nombre')
                ->select('id', 'nombre', 'carrera_id')
                ->orderBy('nombre')
                ->get(),
            'tipos' => TipoArchivo::select('id', 'nombre')->orderBy('nombre')->get(),
            'estados' => $canSetEstado ? EstadoArchivo::select('id', 'nombre')->orderBy('nombre')->get() : [],
            'estado_default_id' => $estadoPendienteId,
            'can_set_estado' => $canSetEstado,
        ]);
    }

    public function store(StoreArchivoRequest $request)
    {
        $data = $request->validated();
        $user = auth()->user();
        $canSetEstado = $user && $user->can('state_archivo');
        if (!$canSetEstado) {
            $data['estado_archivo_id'] = $this->estadoPendienteId();
        }

        $this->validarRelacionCarrera($data['carrera_id'], $data['materia_id'], $data['plan_estudio_id'] ?? null);

        $file = $request->file('archivo');
        $path = $file->store('archivos', 'public');

        $thumbnailPath = $this->generarThumbnail($path, $file->getClientOriginalExtension());

        unset($data['carrera_id']);
        unset($data['archivo']);
        $data['user_id'] = Auth::id();
        $data['file_path'] = $path;
        $data['thumbnail_path'] = $thumbnailPath;
        $data['peso_bytes'] = $file->getSize();
        $data['publicado_en'] = now();

        $archivo = Archivo::create($data);

        if (config('mail.notifications_enabled') && $archivo->autor && $archivo->autor->email) {
            Mail::to($archivo->autor->email)->queue(new ArchivoCreadoMail($archivo));
        }

        return redirect()
            ->route('archivos.index')
            ->with('success', "Archivo {$archivo->titulo} creado correctamente.");
    }

    public function show(Request $request, Archivo $archivo)
    {
        $user = $request->user();
        $userId = $user?->id;
        $canViewAllEstados = $user && ($user->can('state_archivo') || $user->can('view_moderacion'));
        $estadoAprobadoId = $this->estadoAprobadoId();
        $filterKeys = [
            'search',
            'autor',
            'tipo_carrera_id',
            'carrera_id',
            'materia_id',
            'tipo_archivo_id',
            'plan_estudio_id',
            'estado_archivo_id',
            'sort',
            'direction',
            'page',
        ];
        $filters = $request->only($filterKeys);
        $filtersClean = array_filter($filters, static fn($v) => !is_null($v) && $v !== '');
        $backUrl = route('archivos.index', $filtersClean);

        if (!$canViewAllEstados) {
            if ($estadoAprobadoId) {
                if ($archivo->estado_archivo_id !== $estadoAprobadoId && $archivo->user_id !== $userId) {
                    abort(403);
                }
            } else {
                if ($archivo->user_id !== $userId) {
                    abort(403);
                }
            }
        }

        $this->registrarVisita($request, $archivo);

        $archivo->loadCount(['savers', 'comentarios', 'valoraciones'])->loadAvg('valoraciones', 'puntaje');

        $archivo->setAttribute('is_saved', $user ? $user->savedArchivos()->where('archivo_id', $archivo->id)->exists() : false);

        return inertia('archivos/show', [
            'archivo' => $archivo->load([
                'autor.profile:id,user_id,nombre_completo,avatar_path',
                'materia',
                'tipo',
                'estado',
                'planEstudio',
                'comentarios.autor:id,name',
                'comentarios.autor.profile:id,user_id,nombre_completo,avatar_path',
                'valoraciones.autor:id,name',
                'valoraciones.autor.profile:id,user_id,nombre_completo,avatar_path',
            ]),
            'estados' => EstadoArchivo::select('id', 'nombre')->orderBy('nombre')->get(),
            'can_update' => auth()->user() ? Gate::forUser(auth()->user())->allows('update', $archivo) : false,
            'backUrl' => $backUrl,
        ]);
    }

    public function myStuff(Request $request)
    {
        $user = $request->user();
        $actividadPage = (int) $request->input('actividad_page', 1);
        $perPageActividad = 10;

        $guardados = $user->savedArchivos()
            ->with(['materia:id,nombre', 'tipo:id,nombre', 'estado:id,nombre'])
            ->withCount(['savers', 'comentarios', 'valoraciones'])
            ->withAvg('valoraciones', 'puntaje')
            ->orderByDesc('archivo_user_saved.created_at')
            ->paginate(9, ['archivos.*'], 'guardados_page')
            ->withQueryString();

        $publicaciones = $user->archivos()
            ->with(['materia:id,nombre', 'tipo:id,nombre', 'estado:id,nombre'])
            ->withCount(['savers', 'comentarios', 'valoraciones'])
            ->withAvg('valoraciones', 'puntaje')
            ->orderByDesc('created_at')
            ->paginate(9, ['archivos.*'], 'publicaciones_page')
            ->withQueryString();

        $comentarios = $user->comentarios()
            ->with('archivo:id,titulo')
            ->select('id', 'archivo_id', 'cuerpo', 'created_at')
            ->latest()
            ->get();

        $valoraciones = $user->valoraciones()
            ->with('archivo:id,titulo')
            ->select('id', 'archivo_id', 'puntaje', 'comentario', 'created_at')
            ->latest()
            ->get();

        $actividad = $comentarios->map(function ($c) {
            return [
                'type' => 'comentario',
                'id' => $c->id,
                'archivo' => $c->archivo,
                'texto' => $c->cuerpo,
                'created_at' => $c->created_at,
            ];
        })->concat($valoraciones->map(function ($v) {
            return [
                'type' => 'valoracion',
                'id' => $v->id,
                'archivo' => $v->archivo,
                'puntaje' => $v->puntaje,
                'texto' => $v->comentario,
                'created_at' => $v->created_at,
            ];
        }))->sortByDesc('created_at')->values();

        $actividadPaginated = new LengthAwarePaginator(
            $actividad->forPage($actividadPage, $perPageActividad)->values(),
            $actividad->count(),
            $perPageActividad,
            $actividadPage,
            [
                'path' => $request->url(),
                'pageName' => 'actividad_page',
                'query' => $request->query(),
            ]
        );

        return inertia('mis-cosas/index', [
            'guardados' => $guardados,
            'publicaciones' => $publicaciones,
            'actividad' => $actividadPaginated,
        ]);
    }

    public function edit(Archivo $archivo)
    {
        $this->authorize('update', $archivo);

        $archivo->load(['materia.carreras:id', 'planEstudio:id,nombre']);
        $archivo->setAttribute('carrera_id', optional($archivo->materia?->carreras?->first())->id);
        $canSetEstado = auth()->user()?->can('state_archivo') ?? false;
        $estadoAprobadoId = $this->estadoAprobadoId();
        $isAprobado = $estadoAprobadoId && $archivo->estado_archivo_id === $estadoAprobadoId;

        return inertia('archivos/edit', [
            'archivo' => $archivo,
            'carreras' => Carrera::with(['planesEstudio:id,nombre,carrera_id', 'materias:id,nombre'])
                ->select('id', 'nombre')
                ->orderBy('nombre')
                ->get(),
            'planes' => Plan_Estudio::with('materias:id,nombre')
                ->select('id', 'nombre', 'carrera_id')
                ->orderBy('nombre')
                ->get(),
            'tipos' => TipoArchivo::select('id', 'nombre')->orderBy('nombre')->get(),
            'estados' => EstadoArchivo::select('id', 'nombre')->orderBy('nombre')->get(),
            'can_set_estado' => $canSetEstado,
            'can_replace_file' => auth()->user()?->can('replace_archivo') ?? false,
            'is_aprobado' => $isAprobado,
        ]);
    }

    public function update(UpdateArchivoRequest $request, Archivo $archivo)
    {
        $this->authorize('update', $archivo);

        $data = $request->validated();
        $user = $request->user();
        $canReplaceAprobado = $user && $user->can('replace_archivo');
        $estadoAprobadoId = $this->estadoAprobadoId();
        $isAprobado = $estadoAprobadoId && $archivo->estado_archivo_id === $estadoAprobadoId;
        $fileChanged = false;

        $this->validarRelacionCarrera($data['carrera_id'], $data['materia_id'], $data['plan_estudio_id'] ?? null);

        if ($request->hasFile('archivo')) {
            if ($isAprobado && !$canReplaceAprobado) {
                return back()
                    ->withErrors(['archivo' => 'No puedes reemplazar el archivo cuando ya está aprobado.'])
                    ->withInput($request->except('archivo'));
            }

            $file = $request->file('archivo');
            $path = $file->store('archivos', 'public');

            $thumbnailPath = $this->generarThumbnail($path, $file->getClientOriginalExtension());

            if ($archivo->file_path) {
                Storage::disk('public')->delete($archivo->file_path);
            }
            if ($archivo->thumbnail_path) {
                Storage::disk('public')->delete($archivo->thumbnail_path);
            }

            unset($data['archivo']);
            $data['file_path'] = $path;
            $data['thumbnail_path'] = $thumbnailPath;
            $data['peso_bytes'] = $file->getSize();
            $fileChanged = true;
        }

        unset($data['carrera_id']);

        $archivo->update($data);

        // Notificación y correo al autor tras la edición solo si cambió el archivo y no está aprobado
        if ($fileChanged && !$isAprobado) {
            $archivo->loadMissing(['autor', 'materia', 'tipo', 'estado', 'planEstudio']);

            NotificacionService::crearParaAutorArchivo($archivo->autor, [
                'actor_id' => $user?->id,
                'archivo_id' => $archivo->id,
                'tipo' => 'archivo_actualizado',
                'titulo' => 'Actualizaste tu archivo',
                'mensaje' => "{$archivo->titulo} fue actualizado.",
            ]);

            if (config('mail.notifications_enabled') && $archivo->autor && $archivo->autor->email) {
                Mail::to($archivo->autor->email)->queue(new ArchivoActualizadoMail($archivo, $user));
            }
        }

        // Notificación a moderadores/superadmin con permiso edit_file_notify cuando cambia el archivo
        if ($fileChanged) {
            $moderadores = User::permission('edit_file_notify')->get();
            foreach ($moderadores as $moderador) {
                NotificacionService::crear([
                    'user_id' => $moderador->id,
                    'actor_id' => $user?->id,
                    'archivo_id' => $archivo->id,
                    'tipo' => 'archivo_actualizado',
                    'titulo' => "Archivo actualizado: {$archivo->titulo}",
                    'mensaje' => "Se reemplazó el archivo \"{$archivo->titulo}\".",
                ]);
            }
        }

        return redirect()
            ->route('archivos.index')
            ->with('success', "Archivo {$archivo->titulo} actualizado correctamente.");
    }

    public function destroy(Archivo $archivo)
    {
        $this->authorize('delete', $archivo);

        if ($archivo->file_path) {
            Storage::disk('public')->delete($archivo->file_path);
        }
        if ($archivo->thumbnail_path) {
            Storage::disk('public')->delete($archivo->thumbnail_path);
        }

        $archivo->delete();

        return redirect()
            ->route('archivos.index')
            ->with('success', "Archivo {$archivo->titulo} eliminado correctamente.");
    }

    public function generateReport(Request $request)
    {
        $sort = $request->input('sort', 'date') === 'title' ? 'title' : 'date';
        $direction = $request->input('direction', 'desc') === 'asc' ? 'asc' : 'desc';

        $archivos = $this->buildFilteredQuery($request)
            ->when($sort === 'title', fn ($q) => $q->orderBy('titulo', $direction))
            ->when($sort !== 'title', fn ($q) => $q->orderBy('created_at', $direction))
            ->get();
        $pdf = Pdf::loadView('pdf.archivos', compact('archivos'));
        return $pdf->stream('archivos.pdf');
    }

    public function generateDetailReport(Archivo $archivo)
    {
        $archivo->load(['autor:id,name', 'materia:id,nombre', 'tipo:id,nombre', 'estado:id,nombre', 'planEstudio:id,nombre']);
        $pdf = Pdf::loadView('pdf.archivo_detalle', compact('archivo'));
        return $pdf->stream("archivo-{$archivo->id}.pdf");
    }

    public function save(Request $request, Archivo $archivo)
    {
        $user = $request->user();
        if (!$user) {
            abort(403);
        }

        $user->savedArchivos()->syncWithoutDetaching([$archivo->id]);

        return back()->with('success', 'Archivo guardado.');
    }

    public function unsave(Request $request, Archivo $archivo)
    {
        $user = $request->user();
        if (!$user) {
            abort(403);
        }

        $user->savedArchivos()->detach($archivo->id);

        return back()->with('success', 'Archivo removido de guardados.');
    }

    private function buildFilteredQuery(Request $request): Builder
    {
        $search = $request->input('search');
        $autor = $request->input('autor');
        $carreraId = $request->input('carrera_id');
        $materiaId = $request->input('materia_id');
        $tipoId = $request->input('tipo_archivo_id');
        $planId = $request->input('plan_estudio_id');
        $estadoId = $request->input('estado_archivo_id');
        $tipoCarreraId = $request->input('tipo_carrera_id');
        $user = $request->user();
        $userId = $user?->id;
        $canViewAllEstados = $user && ($user->can('state_archivo') || $user->can('view_moderacion'));
        $estadoAprobadoId = $this->estadoAprobadoId();

        $query = Archivo::with([
            'autor:id,name',
            'materia:id,nombre',
            'materia.carreras:id,nombre',
            'tipo:id,nombre',
            'estado:id,nombre',
            'planEstudio:id,nombre,carrera_id',
            'planEstudio.carrera:id,nombre',
        ])->withCount(['savers', 'comentarios', 'valoraciones'])
            ->withAvg('valoraciones', 'puntaje');

        if ($search) {
            $query->where('titulo', 'like', '%' . $search . '%');
        }

        if ($autor) {
            $query->whereHas('autor', function ($q) use ($autor) {
                $q->where('name', 'like', '%' . $autor . '%');
            });
        }

        if ($tipoCarreraId) {
            $query->whereHas('materia.carreras', function ($q) use ($tipoCarreraId) {
                $q->where('carreras.tipo_carrera_id', $tipoCarreraId);
            });
        }

        if ($carreraId) {
            $query->whereHas('materia.carreras', function ($q) use ($carreraId) {
                $q->where('carreras.id', $carreraId);
            });
        }

        if ($materiaId) {
            $query->where('materia_id', $materiaId);
        }

        if ($tipoId) {
            $query->where('tipo_archivo_id', $tipoId);
        }

        if ($planId) {
            $query->where('plan_estudio_id', $planId);
        }

        if ($estadoId) {
            $query->where('estado_archivo_id', $estadoId);
        }

        if (!$canViewAllEstados) {
            $query->where(function ($q) use ($estadoAprobadoId, $userId) {
                if ($estadoAprobadoId) {
                    $q->where('estado_archivo_id', $estadoAprobadoId);
                    if ($userId) {
                        $q->orWhere('user_id', $userId);
                    }
                } else {
                    if ($userId) {
                        $q->where('user_id', $userId);
                    } else {
                        $q->whereRaw('1=0');
                    }
                }
            });
        }

        return $query;
    }

    private function generarThumbnail(string $storedPath, string $originalExtension): ?string
    {
        $extension = strtolower($originalExtension);
        $fullPath = storage_path('app/public/' . $storedPath);
        if (!file_exists($fullPath)) {
            return null;
        }

        $baseName = Str::of($storedPath)->afterLast('/')->beforeLast('.');
        $thumbnailRelative = 'archivos/thumbnails/' . $baseName . '.jpg';
        $thumbnailFull = storage_path('app/public/' . $thumbnailRelative);

        Storage::disk('public')->makeDirectory('archivos/thumbnails');

        $imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        $officeExtensions = ['doc', 'docx', 'xls', 'xlsx', 'csv', 'ppt', 'pptx'];

        try {
            if ($extension === 'pdf') {
                return $this->thumbnailFromPdf($fullPath, $thumbnailFull, $thumbnailRelative);
            }

            if (in_array($extension, $imageExtensions, true)) {
                return $this->thumbnailFromImage($fullPath, $thumbnailFull, $thumbnailRelative);
            }

            if (in_array($extension, $officeExtensions, true)) {
                $pdfPath = $this->convertOfficeToPdf($fullPath);
                if ($pdfPath) {
                    $thumb = $this->thumbnailFromPdf($pdfPath, $thumbnailFull, $thumbnailRelative);
                    @unlink($pdfPath);
                    return $thumb;
                }
            }
        } catch (\Throwable $e) {
            return null;
        }

        return null;
    }

    private function thumbnailFromPdf(string $pdfPath, string $thumbnailFull, string $thumbnailRelative): ?string
    {
        try {
            $imagick = new \Imagick();
            $imagick->setResolution(150, 150);
            $imagick->readImage($pdfPath . '[0]');
            // Fondo blanco para evitar artefactos con transparencia en dark mode
            $imagick->setImageBackgroundColor('white');
            if (method_exists($imagick, 'mergeImageLayers')) {
                $imagick = $imagick->mergeImageLayers(\Imagick::LAYERMETHOD_FLATTEN);
            }
            $imagick->setImageFormat('jpg');
            $imagick->setImageCompression(\Imagick::COMPRESSION_JPEG);
            $imagick->setImageCompressionQuality(85);
            $imagick->thumbnailImage(600, 800, true);
            $imagick->writeImage($thumbnailFull);
            $imagick->clear();
            $imagick->destroy();
            return $thumbnailRelative;
        } catch (\Throwable $e) {
            return null;
        }
    }

    private function thumbnailFromImage(string $imagePath, string $thumbnailFull, string $thumbnailRelative): ?string
    {
        try {
            $imagick = new \Imagick($imagePath);
            $imagick->setImageBackgroundColor('white');
            if (method_exists($imagick, 'mergeImageLayers')) {
                $imagick = $imagick->mergeImageLayers(\Imagick::LAYERMETHOD_FLATTEN);
            }
            $imagick->setImageFormat('jpg');
            $imagick->setImageCompression(\Imagick::COMPRESSION_JPEG);
            $imagick->setImageCompressionQuality(85);
            $imagick->thumbnailImage(600, 800, true);
            $imagick->writeImage($thumbnailFull);
            $imagick->clear();
            $imagick->destroy();
            return $thumbnailRelative;
        } catch (\Throwable $e) {
            return null;
        }
    }

    private function convertOfficeToPdf(string $officePath): ?string
    {
        $tmpDir = sys_get_temp_dir();
        $escapedInput = escapeshellarg($officePath);
        $escapedOut = escapeshellarg($tmpDir);

        // Convertimos a PDF con LibreOffice headless
        $command = "soffice --headless --convert-to pdf --outdir {$escapedOut} {$escapedInput}";
        @exec($command);

        $baseName = pathinfo($officePath, PATHINFO_FILENAME);
        $pdfCandidate = $tmpDir . DIRECTORY_SEPARATOR . $baseName . '.pdf';

        return file_exists($pdfCandidate) ? $pdfCandidate : null;
    }

    private function validarRelacionCarrera(int $carreraId, int $materiaId, ?int $planId): void
    {
        $materiaPertenece = DB::table('carrera_materia')
            ->where('carrera_id', $carreraId)
            ->where('materia_id', $materiaId)
            ->exists();

        if (!$materiaPertenece) {
            abort(422, 'La materia no pertenece a la carrera seleccionada.');
        }

        if ($planId) {
            $plan = Plan_Estudio::find($planId);
            if (!$plan || $plan->carrera_id !== $carreraId) {
                abort(422, 'El plan seleccionado no pertenece a la carrera.');
            }
        }
    }

    private function estadoPendienteId(): ?int
    {
        return EstadoArchivo::where('nombre', 'like', '%pend%')->orderBy('id')->value('id')
            ?? EstadoArchivo::orderBy('id')->value('id');
    }

    private function estadoAprobadoId(): ?int
    {
        return EstadoArchivo::where('nombre', 'like', '%aprob%')->orderBy('id')->value('id')
            ?? null;
    }
 
    public function export(Request $request)
    {
        $sort = $request->input('sort', 'date') === 'title' ? 'title' : 'date';
        $direction = $request->input('direction', 'desc') === 'asc' ? 'asc' : 'desc';

        $archivos = $this->buildFilteredQuery($request)
            ->when($sort === 'title', fn ($q) => $q->orderBy('titulo', $direction))
            ->when($sort !== 'title', fn ($q) => $q->orderBy('created_at', $direction))
            ->get();

        return Excel::download(new ArchivosExport($archivos), 'archivos.xlsx');
    }

    private function registrarVisita(Request $request, Archivo $archivo): void
    {
        $sessionKey = 'archivos_vistos';
        $vistos = $request->session()->get($sessionKey, []);

        if (!in_array($archivo->id, $vistos, true)) {
            $archivo->increment('visitas_count');
            $archivo->visitas_count = ($archivo->visitas_count ?? 0) + 1;
            $vistos[] = $archivo->id;
            // Limitar el array para no crecer indefinidamente
            $request->session()->put($sessionKey, array_slice(array_unique($vistos), -50));
        }
    }
}
