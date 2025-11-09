<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReporteContenido extends Model
{
    use HasFactory;

    protected $table = 'reporte_contenidos';

    protected $fillable = [
        'archivo_id',
        'reportante_id',
        'motivo',
        'detalle',
        'estado',
        'resuelto_por',
        'resuelto_en',
    ];

    protected $casts = [
        'resuelto_en' => 'datetime',
    ];

    public function archivo()
    {
        return $this->belongsTo(Archivo::class);
    }

    public function reportante()
    {
        return $this->belongsTo(User::class, 'reportante_id');
    }

    public function moderador()
    {
        return $this->belongsTo(User::class, 'resuelto_por');
    }
}
