<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreComentarioRequest;
use App\Http\Requests\UpdateComentarioRequest;
use App\Models\Comentario;
use App\Models\Archivo;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use App\Mail\ComentarioNuevoMail;
use Illuminate\Http\Request;
use App\Services\NotificacionService;
use Illuminate\Support\Facades\Auth;

class ComentarioController extends Controller
{
    public function index(Request $request)
    {
        $sort = $request->input('sort', 'id');
        $direction = $request->input('direction', 'desc') === 'asc' ? 'asc' : 'desc';
        $search = $request->input('search');
        $autor = $request->input('autor');
        $destacadoInput = $request->input('destacado');
        $destacado = null;
        if ($destacadoInput !== null && $destacadoInput !== '') {
            $destacado = filter_var($destacadoInput, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        }

        $table = (new Comentario())->getTable();

        $allowedSorts = [
            'id' => "{$table}.id",
            'archivo' => 'archivos.titulo',
            'autor' => 'autores.name',
            'destacado' => "{$table}.destacado",
        ];

        $query = Comentario::query()
            ->from("{$table}")
            ->select("{$table}.*")
            ->leftJoin('archivos', 'archivos.id', '=', "{$table}.archivo_id")
            ->leftJoin('users as autores', 'autores.id', '=', "{$table}.user_id")
            ->with(['archivo:id,titulo', 'autor:id,name']);

        if ($search) {
            $query->where(function ($q) use ($search, $table) {
                $q->where('archivos.titulo', 'like', '%' . $search . '%')
                    ->orWhere('autores.name', 'like', '%' . $search . '%')
                    ->orWhere("{$table}.cuerpo", 'like', '%' . $search . '%');
            });
        }

        if ($autor) {
            $query->where('autores.name', 'like', '%' . $autor . '%');
        }

        if (!is_null($destacado)) {
            $query->where("{$table}.destacado", $destacado);
        }

        $orderColumn = $allowedSorts[$sort] ?? "{$table}.id";
        $query->orderBy($orderColumn, $direction);

        return inertia('comentarios/index', [
            'comentarios' => $query->paginate(10)->withQueryString(),
            'filters' => [
                'search' => $search,
                'autor' => $autor,
                'destacado' => $destacado,
                'sort' => $sort,
                'direction' => $direction,
            ],
            'autores' => User::select('name')->orderBy('name')->pluck('name'),
        ]);
    }

    public function create()
    {
        return inertia('comentarios/create', [
            'comentario' => new Comentario(),
            'archivos' => Archivo::select('id', 'titulo')->orderBy('titulo')->get(),
            'usuarios' => User::select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    public function store(StoreComentarioRequest $request)
    {
        $comentario = Comentario::create($request->validated());

        $autorArchivo = $comentario->archivo?->autor;
        if (config('mail.notifications_enabled') && $autorArchivo && $autorArchivo->email) {
            Mail::to($autorArchivo->email)->send(new ComentarioNuevoMail($comentario));
        }

        // Notificación in-app para autor del archivo
        NotificacionService::crearParaAutorArchivo($autorArchivo, [
            'actor_id' => Auth::id(),
            'archivo_id' => $comentario->archivo_id,
            'tipo' => 'comentario',
            'titulo' => 'Nuevo comentario en tu archivo',
            'mensaje' => $comentario->archivo?->titulo ?? '',
            'data' => [
                'comentario_id' => $comentario->id,
                'autor' => $comentario->autor?->name,
            ],
        ]);

        return redirect()->route('comentarios.index')
            ->with('success', "Comentario #{$comentario->id} creado.");
    }

    public function edit(Comentario $comentario)
    {
        return inertia('comentarios/edit', [
            'comentario' => $comentario,
            'archivos' => Archivo::select('id', 'titulo')->orderBy('titulo')->get(),
            'usuarios' => User::select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    public function update(UpdateComentarioRequest $request, Comentario $comentario)
    {
        $comentario->update($request->validated());

        return redirect()->route('comentarios.index')
            ->with('success', "Comentario #{$comentario->id} actualizado.");
    }

    public function destroy(Comentario $comentario)
    {
        $comentario->delete();

        return redirect()->route('comentarios.index')
            ->with('success', "Comentario #{$comentario->id} eliminado.");
    }
}
