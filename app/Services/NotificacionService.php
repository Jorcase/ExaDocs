<?php

namespace App\Services;

use App\Models\Notificacion;
use App\Models\User;

class NotificacionService
{
    public static function crear(array $data): Notificacion
    {
        // Campos esperados: user_id, actor_id?, archivo_id?, tipo, titulo, mensaje?, data?
        return Notificacion::create([
            'user_id' => $data['user_id'],
            'actor_id' => $data['actor_id'] ?? null,
            'archivo_id' => $data['archivo_id'] ?? null,
            'tipo' => $data['tipo'],
            'titulo' => $data['titulo'],
            'mensaje' => $data['mensaje'] ?? null,
            'data' => $data['data'] ?? null,
        ]);
    }

    public static function crearParaAutorArchivo(?User $autor, array $payload): ?Notificacion
    {
        if (!$autor) {
            return null;
        }

        return self::crear(array_merge($payload, [
            'user_id' => $autor->id,
        ]));
    }
}
