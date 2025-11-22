<?php

namespace App\Policies;

use App\Models\Archivo;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ArchivoPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Archivo $archivo): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Archivo $archivo): bool
    {
        if ($user->hasRole('SuperAdmin')) {
            return true;
        }

        if ($user->hasRole('Moderador')) {
            return true;
        }

        return $user->hasRole('Estudiante') && $archivo->user_id === $user->id;
    }

    public function delete(User $user, Archivo $archivo): bool
    {
        if ($user->hasRole('SuperAdmin')) {
            return true;
        }

        return $user->hasRole('Estudiante') && $archivo->user_id === $user->id;
    }

    public function restore(User $user, Archivo $archivo): bool
    {
        return false;
    }

    public function forceDelete(User $user, Archivo $archivo): bool
    {
        return false;
    }
}
