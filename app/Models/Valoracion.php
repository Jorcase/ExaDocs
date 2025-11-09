<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Valoracion extends Model
{
    use HasFactory;

    protected $table = 'valoraciones';

    protected $fillable = [
        'archivo_id',
        'user_id',
        'puntaje',
        'comentario',
    ];

    protected $casts = [
        'puntaje' => 'integer',
    ];

    public function archivo()
    {
        return $this->belongsTo(Archivo::class);
    }

    public function autor()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
