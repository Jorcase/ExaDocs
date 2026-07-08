<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MateriaUserProgreso extends Model
{
    use HasFactory;

    protected $table = 'materia_user_progreso';

    protected $fillable = [
        'user_id',
        'carrera_id',
        'materia_id',
        'estado',
        'nota',
        'fecha',
    ];

    protected $casts = [
        'fecha' => 'date',
        'nota' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function carrera()
    {
        return $this->belongsTo(Carrera::class);
    }

    public function materia()
    {
        return $this->belongsTo(Materia::class);
    }
}
