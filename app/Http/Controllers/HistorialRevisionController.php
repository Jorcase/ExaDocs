<?php

namespace App\Http\Controllers;

use App\Models\Archivo;
use App\Http\Requests\StoreHistorialRevisionRequest;
use App\Http\Requests\UpdateHistorialRevisionRequest;
use App\Models\EstadoArchivo;
use App\Models\HistorialRevision;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Mail\ArchivoRevisadoMail;
use App\Services\NotificacionService;
use Illuminate\Support\Facades\Auth;

class HistorialRevisionController extends Controller
{
    public function index(Request $request)
    {
        $sort = $request->input('sort', 'id');
        $direction = $request->input('direction', 'desc') === 'asc' ? 'asc' : 'desc';
        $search = $request->input('search');
        $revisor = $request->input('revisor');
        $estadoPrevio = (array) $request->input('estado_previo', []);
        $estadoNuevo = (array) $request->input('estado_nuevo', []);

        $table = (new HistorialRevision())->getTable();

        $allowedSorts = [
            'id' => "{$table}.id",
            'archivo' => 'archivos.titulo',
            'revisor' => 'revisores.name',
            'estado_previo' => "{$table}.estado_previo",
            'estado_nuevo' => "{$table}.estado_nuevo",
        ];

        $query = HistorialRevision::query()
            ->from("{$table}")
            ->select("{$table}.*")
            ->leftJoin('archivos', 'archivos.id', '=', "{$table}.archivo_id")
            ->leftJoin('users as revisores', 'revisores.id', '=', "{$table}.revisor_id")
            ->with(['archivo:id,titulo', 'revisor:id,name']);

        if ($search) {
            $query->where(function ($q) use ($search, $table) {
                $q->where('archivos.titulo', 'like', '%' . $search . '%')
                    ->orWhere('revisores.name', 'like', '%' . $search . '%')
                    ->orWhere("{$table}.estado_previo", 'like', '%' . $search . '%')
                    ->orWhere("{$table}.estado_nuevo", 'like', '%' . $search . '%')
                    ->orWhere("{$table}.comentario", 'like', '%' . $search . '%');
            });
        }

        if ($revisor) {
            $query->where('revisores.name', 'like', '%' . $revisor . '%');
        }

        if (!empty($estadoPrevio)) {
            $query->whereIn("{$table}.estado_previo", $estadoPrevio);
        }

        if (!empty($estadoNuevo)) {
            $query->whereIn("{$table}.estado_nuevo", $estadoNuevo);
        }

        $orderColumn = $allowedSorts[$sort] ?? "{$table}.id";
        $query->orderBy($orderColumn, $direction);

        return inertia('historial-revisiones/index', [
            'revisiones' => $query->paginate(10)->withQueryString(),
            'filters' => [
                'search' => $search,
                'revisor' => $revisor,
                'estado_previo' => $estadoPrevio,
                'estado_nuevo' => $estadoNuevo,
                'sort' => $sort,
        'direction' => $direction,
            ],
            'revisores' => User::select('name')->orderBy('name')->pluck('name'),
            'estados' => EstadoArchivo::select('nombre')->orderBy('nombre')->pluck('nombre'),
        ]);
    }

    public function create(Request $request)
    {
        $archivoId = $request->input('archivo_id');
        $estadoArchivoId = $request->input('estado_archivo_id');
        $archivoSeleccionado = $archivoId ? Archivo::with('estado:id,nombre')->find($archivoId) : null;

        return inertia('historial-revisiones/create', [
            'revision' => new HistorialRevision(),
            'archivos' => Archivo::with('estado:id,nombre')
                ->select('id', 'titulo', 'estado_archivo_id')
                ->orderBy('titulo')
                ->get(),
            'usuarios' => User::select('id', 'name')->orderBy('name')->get(),
            'estados' => EstadoArchivo::select('id', 'nombre')->orderBy('nombre')->get(),
            'prefill' => [
                'archivo_id' => $archivoSeleccionado?->id,
                'estado_previo' => $archivoSeleccionado?->estado?->nombre,
                'estado_nuevo_id' => $estadoArchivoId ?: $archivoSeleccionado?->estado_archivo_id,
            ],
        ]);
    }

    public function store(StoreHistorialRevisionRequest $request)
    {
        $data = $request->validated();

        $revision = DB::transaction(function () use ($data) {
            $archivo = Archivo::with('estado:id,nombre')->findOrFail($data['archivo_id']);
            $estadoNuevo = EstadoArchivo::findOrFail($data['estado_nuevo_id']);

            $data['estado_previo'] = $archivo->estado->nombre ?? 'Sin estado';
            $data['estado_nuevo'] = $estadoNuevo->nombre;
            unset($data['estado_nuevo_id']);

            // Actualizamos el estado del archivo
            $archivo->estado_archivo_id = $estadoNuevo->id;
            $archivo->save();

            return HistorialRevision::create($data);
        });

        if (config('mail.notifications_enabled') && $revision->archivo->autor && $revision->archivo->autor->email) {
            Mail::to($revision->archivo->autor->email)->send(new ArchivoRevisadoMail($revision->archivo, $revision->estado_nuevo));
        }

        // Notificación in-app
        NotificacionService::crearParaAutorArchivo($revision->archivo->autor, [
            'actor_id' => Auth::id(),
            'archivo_id' => $revision->archivo_id,
            'tipo' => 'revision',
            'titulo' => "Tu archivo fue {$revision->estado_nuevo}",
            'mensaje' => "Estado previo: {$revision->estado_previo}",
            'data' => [
                'estado_previo' => $revision->estado_previo,
                'estado_nuevo' => $revision->estado_nuevo,
            ],
        ]);

        return redirect()->route('historial-revisiones.index')
            ->with('success', "Revisión #{$revision->id} creada.");
    }

    public function edit(HistorialRevision $historialRevision)
    {
        return inertia('historial-revisiones/edit', [
            'revision' => $historialRevision,
            'archivos' => Archivo::with('estado:id,nombre')
                ->select('id', 'titulo', 'estado_archivo_id')
                ->orderBy('titulo')
                ->get(),
            'usuarios' => User::select('id', 'name')->orderBy('name')->get(),
            'estados' => EstadoArchivo::select('id', 'nombre')->orderBy('nombre')->get(),
        ]);
    }

    public function update(UpdateHistorialRevisionRequest $request, HistorialRevision $historialRevision)
    {
        $data = $request->validated();

        DB::transaction(function () use ($data, $historialRevision) {
            $archivo = Archivo::with('estado:id,nombre')->findOrFail($data['archivo_id']);
            $estadoNuevo = EstadoArchivo::findOrFail($data['estado_nuevo_id']);

            $data['estado_previo'] = $archivo->estado->nombre ?? 'Sin estado';
            $data['estado_nuevo'] = $estadoNuevo->nombre;
            unset($data['estado_nuevo_id']);

            // Actualizamos el estado del archivo
            $archivo->estado_archivo_id = $estadoNuevo->id;
            $archivo->save();

            $historialRevision->update($data);
        });

        if (config('mail.notifications_enabled') && $historialRevision->archivo->autor && $historialRevision->archivo->autor->email) {
            Mail::to($historialRevision->archivo->autor->email)->send(new ArchivoRevisadoMail($historialRevision->archivo, $historialRevision->estado_nuevo));
        }

        NotificacionService::crearParaAutorArchivo($historialRevision->archivo->autor, [
            'actor_id' => Auth::id(),
            'archivo_id' => $historialRevision->archivo_id,
            'tipo' => 'revision',
            'titulo' => "Tu archivo fue {$historialRevision->estado_nuevo}",
            'mensaje' => "Estado previo: {$historialRevision->estado_previo}",
            'data' => [
                'estado_previo' => $historialRevision->estado_previo,
                'estado_nuevo' => $historialRevision->estado_nuevo,
            ],
        ]);

        return redirect()->route('historial-revisiones.index')
            ->with('success', "Revisión #{$historialRevision->id} actualizada.");
    }

    public function destroy(HistorialRevision $historialRevision)
    {
        $historialRevision->delete();

        return redirect()->route('historial-revisiones.index')
            ->with('success', "Revisión #{$historialRevision->id} eliminada.");
    }
}
