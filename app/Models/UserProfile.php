<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'documento',
        'carrera_principal_id',
        'telefono',
        'avatar_path',
        'bio',
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
