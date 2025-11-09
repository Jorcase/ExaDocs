<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HistorialRevision extends Model
{
    use HasFactory;

    protected $table = 'historial_revision';

    protected $fillable = [
        'archivo_id',
        'revisor_id',
        'estado_previo',
        'estado_nuevo',
        'comentario',
    ];

    public function archivo()
    {
        return $this->belongsTo(Archivo::class);
    }

    public function revisor()
    {
        return $this->belongsTo(User::class, 'revisor_id');
    }
}
