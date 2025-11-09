<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Plan_Estudio extends Model
{
    /** @use HasFactory<\Database\Factories\PlanEstudioFactory> */
    use HasFactory;

    protected $table = 'plan_estudios';

    protected $fillable = [
        'carrera_id',
        'nombre',
        'version',
        'anio_plan',
        'estado',
        'vigente_desde',
        'vigente_hasta',
    ];

    protected $casts = [
        'vigente_desde' => 'date',
        'vigente_hasta' => 'date',
        'anio_plan' => 'integer',
    ];

    public function carrera()
    {
        return $this->belongsTo(Carrera::class);
    }

    public function materias()
    {
        return $this->belongsToMany(Materia::class, 'plan_materia', 'plan_id', 'materia_id')
            ->withPivot(['tipo_asignatura', 'correlativas'])
            ->withTimestamps();
    }

    public function archivos()
    {
        return $this->hasMany(Archivo::class, 'plan_estudio_id');
    }
}
