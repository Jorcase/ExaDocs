<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TipoArchivo extends Model
{
    use HasFactory;

    protected $table = 'tipos_archivos';

    protected $fillable = [
        'nombre',
        'descripcion',
    ];

    public function archivos()
    {
        return $this->hasMany(Archivo::class);
    }
}
