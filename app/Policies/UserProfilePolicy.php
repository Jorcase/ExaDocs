<?php

namespace App\Policies;

use App\Models\User;
use App\Models\UserProfile;

class UserProfilePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view_perfiles');
    }

    public function view(User $user, UserProfile $perfil): bool
    {
        // Todos pueden ver perfiles (según requerimiento actual)
        return true;
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('view_perfiles');
    }

    public function update(User $user, UserProfile $perfil): bool
    {
        if ($user->hasRole('SuperAdmin') || $user->hasRole('Moderador')) {
            return true;
        }

        // Cualquier usuario puede editar su propio perfil; permisos para otros casos.
        if ($perfil->user_id === $user->id) {
            return true;
        }

        return $user->hasPermissionTo('edit_perfiles');
    }

    public function delete(User $user, UserProfile $perfil): bool
    {
        // Solo quienes tengan delete_perfiles (en la práctica solo SuperAdmin)
        return $user->hasPermissionTo('delete_perfiles');
    }
}
