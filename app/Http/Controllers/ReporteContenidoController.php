<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreReporteContenidoRequest;
use App\Http\Requests\UpdateReporteContenidoRequest;
use App\Models\ReporteContenido;
use App\Models\Archivo;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use App\Mail\ReporteContenidoMail;
use Illuminate\Http\Request;
use App\Services\NotificacionService;
use Illuminate\Support\Facades\Auth;

class ReporteContenidoController extends Controller
{
    public function index(Request $request)
    {
        $sort = $request->input('sort', 'id');
        $direction = $request->input('direction', 'desc') === 'asc' ? 'asc' : 'desc';
        $search = $request->input('search');
        $reportante = $request->input('reportante');
        $motivos = (array) $request->input('motivo', []);
        $estados = (array) $request->input('estado', []);

        $table = (new ReporteContenido())->getTable();

        $allowedSorts = [
            'id' => "{$table}.id",
            'archivo' => 'archivos.titulo',
            'reportante' => 'reportantes.name',
            'estado' => "{$table}.estado",
            'motivo' => "{$table}.motivo",
        ];

        $query = ReporteContenido::query()
            ->from("{$table}")
            ->select("{$table}.*")
            ->leftJoin('archivos', 'archivos.id', '=', "{$table}.archivo_id")
            ->leftJoin('users as reportantes', 'reportantes.id', '=', "{$table}.reportante_id")
            ->leftJoin('users as moderadores', 'moderadores.id', '=', "{$table}.resuelto_por")
            ->with([
                'archivo:id,titulo',
                'reportante:id,name',
                'moderador:id,name',
            ]);

        if ($search) {
            $query->where(function ($q) use ($search, $table) {
                $q->where('archivos.titulo', 'like', '%' . $search . '%')
                    ->orWhere('reportantes.name', 'like', '%' . $search . '%')
                    ->orWhere("{$table}.motivo", 'like', '%' . $search . '%')
                    ->orWhere("{$table}.estado", 'like', '%' . $search . '%')
                    ->orWhere("{$table}.detalle", 'like', '%' . $search . '%');
            });
        }

        if ($reportante) {
            $query->where('reportantes.name', 'like', '%' . $reportante . '%');
        }

        if (!empty($motivos)) {
            $query->whereIn("{$table}.motivo", $motivos);
        }

        if (!empty($estados)) {
            $query->whereIn("{$table}.estado", $estados);
        }

        $orderColumn = $allowedSorts[$sort] ?? "{$table}.id";
        $query->orderBy($orderColumn, $direction);

        $motivosEnum = ['spam', 'contenido_incorrecto', 'copyright', 'otro'];
        $estadosEnum = ['pendiente', 'en_revision', 'resuelto'];

        return inertia('reportes/index', [
            'reportes' => $query->paginate(10)->withQueryString(),
            'filters' => [
                'search' => $search,
                'reportante' => $reportante,
                'motivo' => $motivos,
                'estado' => $estados,
                'sort' => $sort,
                'direction' => $direction,
            ],
            'reportantes' => User::select('name')->orderBy('name')->pluck('name'),
            'motivos' => $motivosEnum,
            'estados' => $estadosEnum,
        ]);
    }

    public function create()
    {
        return inertia('reportes/create', [
            'reporte' => new ReporteContenido(),
            'archivos' => Archivo::select('id', 'titulo')->orderBy('titulo')->get(),
            'usuarios' => User::select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    public function store(StoreReporteContenidoRequest $request)
    {
        $reporte = ReporteContenido::create($request->validated());

        $autorArchivo = $reporte->archivo?->autor;
        if (config('mail.notifications_enabled') && $autorArchivo && $autorArchivo->email) {
            Mail::to($autorArchivo->email)->send(new ReporteContenidoMail($reporte));
        }

        // Notificación in-app para autor del archivo
        NotificacionService::crearParaAutorArchivo($autorArchivo, [
            'actor_id' => Auth::id(),
            'archivo_id' => $reporte->archivo_id,
            'tipo' => 'reporte',
            'titulo' => 'Tu archivo fue reportado',
            'mensaje' => $reporte->archivo?->titulo ?? '',
            'data' => [
                'motivo' => $reporte->motivo,
            ],
        ]);

        return redirect()->route('reportes.index')
            ->with('success', "Reporte #{$reporte->id} creado.");
    }

    public function edit(ReporteContenido $reporte)
    {
        return inertia('reportes/edit', [
            'reporte' => $reporte,
            'archivos' => Archivo::select('id', 'titulo')->orderBy('titulo')->get(),
            'usuarios' => User::select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    public function update(UpdateReporteContenidoRequest $request, ReporteContenido $reporte)
    {
        $reporte->update($request->validated());

        return redirect()->route('reportes.index')
            ->with('success', "Reporte #{$reporte->id} actualizado.");
    }

    public function destroy(ReporteContenido $reporte)
    {
        $reporte->delete();

        return redirect()->route('reportes.index')
            ->with('success', "Reporte #{$reporte->id} eliminado.");
    }
}
