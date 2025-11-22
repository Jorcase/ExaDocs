<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notificacion extends Model
{
    use HasFactory;

    protected $table = 'notificaciones';

    protected $fillable = [
        'user_id',
        'actor_id',
        'archivo_id',
        'tipo',
        'titulo',
        'mensaje',
        'data',
        'leido_en',
    ];

    protected $casts = [
        'data' => 'array',
        'leido_en' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function actor()
    {
        return $this->belongsTo(User::class, 'actor_id');
    }

    public function archivo()
    {
        return $this->belongsTo(Archivo::class);
    }
}
