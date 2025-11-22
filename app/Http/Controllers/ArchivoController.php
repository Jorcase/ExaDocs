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
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use App\Mail\ArchivoCreadoMail;
use Illuminate\Support\Facades\Gate;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Exports\ArchivosExport;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Builder;


class ArchivoController extends Controller
{
    public function index(Request $request)
    {
        $sort = $request->input('sort', 'date') === 'title' ? 'title' : 'date';
        $direction = $request->input('direction', 'desc') === 'asc' ? 'asc' : 'desc';

        $query = $this->buildFilteredQuery($request);

        $archivos = $query
            ->when($sort === 'title', fn($q) => $q->orderBy('titulo', $direction))
            ->when($sort !== 'title', fn($q) => $q->orderBy('created_at', $direction))
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
            'carreras' => Carrera::select('id', 'nombre')->orderBy('nombre')->get(),
            'materias' => Materia::select('id', 'nombre')->orderBy('nombre')->get(),
            'tipos' => TipoArchivo::select('id', 'nombre')->orderBy('nombre')->get(),
            'planes' => Plan_Estudio::select('id', 'nombre', 'carrera_id')->orderBy('nombre')->get(),
            'estados' => EstadoArchivo::select('id', 'nombre')->orderBy('nombre')->get(),
        ]);
    }

    public function create()
    {
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
            'estados' => EstadoArchivo::select('id', 'nombre')->orderBy('nombre')->get(),
        ]);
    }

    public function store(StoreArchivoRequest $request)
    {
        $data = $request->validated();

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

    public function show(Archivo $archivo)
    {
        return inertia('archivos/show', [
            'archivo' => $archivo->load([
                'autor',
                'materia',
                'tipo',
                'estado',
                'planEstudio',
                'comentarios.autor:id,name',
                'valoraciones.autor:id,name',
            ]),
            'estados' => EstadoArchivo::select('id', 'nombre')->orderBy('nombre')->get(),
            'can_update' => auth()->user() ? Gate::forUser(auth()->user())->allows('update', $archivo) : false,
        ]);
    }

    public function edit(Archivo $archivo)
    {
        $this->authorize('update', $archivo);

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
        ]);
    }

    public function update(UpdateArchivoRequest $request, Archivo $archivo)
    {
        $this->authorize('update', $archivo);

        $data = $request->validated();

        $this->validarRelacionCarrera($data['carrera_id'], $data['materia_id'], $data['plan_estudio_id'] ?? null);

        if ($request->hasFile('archivo')) {
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
        }

        unset($data['carrera_id']);

        $archivo->update($data);

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

    private function buildFilteredQuery(Request $request): Builder
    {
        $search = $request->input('search');
        $autor = $request->input('autor');
        $carreraId = $request->input('carrera_id');
        $materiaId = $request->input('materia_id');
        $tipoId = $request->input('tipo_archivo_id');
        $planId = $request->input('plan_estudio_id');
        $estadoId = $request->input('estado_archivo_id');

        $query = Archivo::with([
            'autor:id,name',
            'materia:id,nombre',
            'tipo:id,nombre',
            'estado:id,nombre',
            'planEstudio:id,nombre',
        ]);

        if ($search) {
            $query->where('titulo', 'like', '%' . $search . '%');
        }

        if ($autor) {
            $query->whereHas('autor', function ($q) use ($autor) {
                $q->where('name', 'like', '%' . $autor . '%');
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

}
