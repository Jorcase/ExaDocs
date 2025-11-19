<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $nombre
 * @property string $codigo
 * @property string|null $descripcion
 * @property string $estado
 */

class Carrera extends Model
{
    /** @use HasFactory<\Database\Factories\CarreraFactory> */
    use HasFactory;

    protected $fillable = [
        'tipo_carrera_id',
        'nombre',
        'codigo',
        'descripcion',
        'estado',
    ];

    public function planesEstudio()
    {
        return $this->hasMany(Plan_Estudio::class);
    }

    public function materias()
    {
        return $this->belongsToMany(Materia::class, 'carrera_materia')
            ->withPivot(['anio_sugerido', 'cuatrimestre'])
            ->withTimestamps();
    }

    public function perfiles()
    {
        return $this->hasMany(UserProfile::class, 'carrera_principal_id');
    }

    public function tipoCarrera()
    {
        return $this->belongsTo(TipoCarrera::class);
    }
}
