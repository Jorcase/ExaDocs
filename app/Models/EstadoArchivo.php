<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EstadoArchivo extends Model
{
    use HasFactory;

    protected $table = 'estados_archivo';

    protected $fillable = [
        'nombre',
        'descripcion',
        'es_final',
    ];

    protected $casts = [
        'es_final' => 'boolean',
    ];

    public function archivos()
    {
        return $this->hasMany(Archivo::class);
    }
}
