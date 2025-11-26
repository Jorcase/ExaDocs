<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'nombre_completo',
        'documento',
        'carrera_principal_id',
        'telefono',
        'avatar_path',
        'bio',
        'perfil_completo',
        'perfil_completado_en',
    ];

    protected $appends = [
        'avatar_url',
    ];

    protected $casts = [
        'perfil_completo' => 'boolean',
        'perfil_completado_en' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function carrera()
    {
        return $this->belongsTo(Carrera::class, 'carrera_principal_id');
    }

    public function getAvatarUrlAttribute(): ?string
    {
        return $this->avatar_path ? asset('storage/' . $this->avatar_path) : null;
    }
}
