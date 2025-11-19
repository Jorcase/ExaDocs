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
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use App\Mail\ArchivoCreadoMail;
use Barryvdh\DomPDF\Facade\Pdf;

class ArchivoController extends Controller
{
    public function index()
    {
        return inertia('archivos/index', [
            'archivos' => Archivo::with([
                'autor:id,name',
                'materia:id,nombre',
                'tipo:id,nombre',
                'estado:id,nombre',
            ])->latest()->paginate(10),
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

        if ($archivo->autor && $archivo->autor->email) {
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
        ]);
    }

    public function edit(Archivo $archivo)
    {
        return inertia('archivos/edit', [
            'archivo' => $archivo,
            'carreras' => Carrera::with(['planesEstudio:id,nombre,carrera_id', 'materias:id,nombre'])
                ->select('id', 'nombre')
                ->orderBy('nombre')
                ->get(),
            'tipos' => TipoArchivo::select('id', 'nombre')->orderBy('nombre')->get(),
            'estados' => EstadoArchivo::select('id', 'nombre')->orderBy('nombre')->get(),
        ]);
    }

    public function update(UpdateArchivoRequest $request, Archivo $archivo)
    {
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

    public function generateReport()
    {
        $archivos = Archivo::with(['autor:id,name', 'materia:id,nombre', 'tipo:id,nombre', 'estado:id,nombre'])
            ->orderBy('created_at', 'desc')
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
}
