<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Archivo extends Model
{
    /** @use HasFactory<\Database\Factories\ArchivoFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'materia_id',
        'tipo_archivo_id',
        'plan_estudio_id',
        'estado_archivo_id',
        'titulo',
        'descripcion',
        'file_path',
        'thumbnail_path',
        'peso_bytes',
        'metadata',
        'observaciones_admin',
        'publicado_en',
    ];

    protected $casts = [
        'peso_bytes' => 'integer',
        'metadata' => 'array',
        'publicado_en' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public function autor()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function materia()
    {
        return $this->belongsTo(Materia::class);
    }

    public function tipo()
    {
        return $this->belongsTo(TipoArchivo::class, 'tipo_archivo_id');
    }

    public function estado()
    {
        return $this->belongsTo(EstadoArchivo::class, 'estado_archivo_id');
    }

    public function planEstudio()
    {
        return $this->belongsTo(Plan_Estudio::class, 'plan_estudio_id');
    }

    public function revisiones()
    {
        return $this->hasMany(HistorialRevision::class);
    }

    public function reportes()
    {
        return $this->hasMany(ReporteContenido::class);
    }

    public function comentarios()
    {
        return $this->hasMany(Comentario::class);
    }

    public function valoraciones()
    {
        return $this->hasMany(Valoracion::class);
    }
}
