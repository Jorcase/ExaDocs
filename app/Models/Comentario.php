<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Comentario extends Model
{
    use HasFactory;

    protected $fillable = [
        'archivo_id',
        'user_id',
        'cuerpo',
        'destacado',
    ];

    protected $casts = [
        'destacado' => 'boolean',
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
