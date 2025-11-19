<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreComentarioRequest;
use App\Http\Requests\UpdateComentarioRequest;
use App\Models\Comentario;
use App\Models\Archivo;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use App\Mail\ComentarioNuevoMail;

class ComentarioController extends Controller
{
    public function index()
    {
        return inertia('comentarios/index', [
            'comentarios' => Comentario::with(['archivo:id,titulo', 'autor:id,name'])
                ->latest()
                ->paginate(10),
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
        if ($autorArchivo && $autorArchivo->email) {
            Mail::to($autorArchivo->email)->send(new ComentarioNuevoMail($comentario));
        }

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
