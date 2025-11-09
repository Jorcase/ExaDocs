<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Materia extends Model
{
    /** @use HasFactory<\Database\Factories\MateriaFactory> */
    use HasFactory;

    protected $fillable = [
        'nombre',
        'codigo',
        'descripcion',
        'tipo',
    ];

    public function carreras()
    {
        return $this->belongsToMany(Carrera::class, 'carrera_materia')
            ->withPivot(['anio_sugerido', 'cuatrimestre'])
            ->withTimestamps();
    }

    public function planesEstudio()
    {
        return $this->belongsToMany(Plan_Estudio::class, 'plan_materia', 'materia_id', 'plan_id')
            ->withPivot(['tipo_asignatura', 'correlativas'])
            ->withTimestamps();
    }

    public function archivos()
    {
        return $this->hasMany(Archivo::class);
    }
}
