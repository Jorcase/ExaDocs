<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreValoracionRequest;
use App\Http\Requests\UpdateValoracionRequest;
use App\Models\Valoracion;
use App\Models\Archivo;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use App\Mail\ValoracionNuevaMail;
use Illuminate\Http\Request;
use App\Services\NotificacionService;
use Illuminate\Support\Facades\Auth;

class ValoracionController extends Controller
{
    public function index(Request $request)
    {
        $sort = $request->input('sort', 'id');
        $direction = $request->input('direction', 'desc') === 'asc' ? 'asc' : 'desc';
        $search = $request->input('search');
        $autor = $request->input('autor');
        $puntajes = (array) $request->input('puntaje', []);

        $table = (new Valoracion())->getTable();

        $allowedSorts = [
            'id' => "{$table}.id",
            'archivo' => 'archivos.titulo',
            'autor' => 'autores.name',
            'puntaje' => "{$table}.puntaje",
        ];

        $query = Valoracion::query()
            ->from("{$table}")
            ->select("{$table}.*")
            ->leftJoin('archivos', 'archivos.id', '=', "{$table}.archivo_id")
            ->leftJoin('users as autores', 'autores.id', '=', "{$table}.user_id")
            ->with(['archivo:id,titulo', 'autor:id,name']);

        if ($search) {
            $query->where(function ($q) use ($search, $table) {
                $q->where('archivos.titulo', 'like', '%' . $search . '%')
                    ->orWhere('autores.name', 'like', '%' . $search . '%')
                    ->orWhere("{$table}.comentario", 'like', '%' . $search . '%');
            });
        }

        if ($autor) {
            $query->where('autores.name', 'like', '%' . $autor . '%');
        }

        if (!empty($puntajes)) {
            $query->whereIn("{$table}.puntaje", $puntajes);
        }

        $orderColumn = $allowedSorts[$sort] ?? "{$table}.id";
        $query->orderBy($orderColumn, $direction);

        return inertia('valoraciones/index', [
            'valoraciones' => $query->paginate(10)->withQueryString(),
            'filters' => [
                'search' => $search,
                'autor' => $autor,
                'puntaje' => $puntajes,
                'sort' => $sort,
                'direction' => $direction,
            ],
            'autores' => User::select('name')->orderBy('name')->pluck('name'),
        ]);
    }

    public function create()
    {
        return inertia('valoraciones/create', [
            'valoracion' => new Valoracion(),
            'archivos' => Archivo::select('id', 'titulo')->orderBy('titulo')->get(),
            'usuarios' => User::select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    public function store(StoreValoracionRequest $request)
    {
        $data = $request->validated();
        $data['user_id'] = Auth::id();

        $valoracion = Valoracion::where('archivo_id', $data['archivo_id'])
            ->where('user_id', $data['user_id'])
            ->first();

        if ($valoracion) {
            $valoracion->update([
                'puntaje' => $data['puntaje'],
                'comentario' => $data['comentario'] ?? null,
            ]);
        } else {
            $valoracion = Valoracion::create($data);
        }

        $autorArchivo = $valoracion->archivo?->autor;
        if (config('mail.notifications_enabled') && $autorArchivo && $autorArchivo->email) {
            Mail::to($autorArchivo->email)->send(new ValoracionNuevaMail($valoracion));
        }

        // Notificación in-app para autor del archivo
        NotificacionService::crearParaAutorArchivo($autorArchivo, [
            'actor_id' => Auth::id(),
            'archivo_id' => $valoracion->archivo_id,
            'tipo' => 'valoracion',
            'titulo' => 'Tu archivo fue valorado',
            'mensaje' => $valoracion->archivo?->titulo ?? '',
            'data' => [
                'puntaje' => $valoracion->puntaje,
                'autor' => $valoracion->autor?->name,
            ],
        ]);

        return redirect()->back()->with('success', "Valoración guardada.");
    }

    public function edit(Valoracion $valoracion)
    {
        return inertia('valoraciones/edit', [
            'valoracion' => $valoracion,
            'archivos' => Archivo::select('id', 'titulo')->orderBy('titulo')->get(),
            'usuarios' => User::select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    public function update(UpdateValoracionRequest $request, Valoracion $valoracion)
    {
        $data = $request->validated();
        $data['user_id'] = Auth::id();

        $valoracion->update($data);

        return redirect()->back()->with('success', "Valoración #{$valoracion->id} actualizada.");
    }

    public function destroy(Valoracion $valoracion)
    {
        $valoracion->delete();

        return redirect()->back()->with('success', "Valoración #{$valoracion->id} eliminada.");
    }
}
