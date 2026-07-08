<?php

namespace App\Exports;

use App\Models\Archivo;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class ArchivosExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize
{
    public function __construct(private Collection $collection)
    {
    }

    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        return $this->collection;
    }

    public function headings(): array
    {
        return [
            'Título',
            'Autor',
            'Código Carrera',
            'Materia',
            'Plan de estudio',
            'Tipo de archivo',
            'Estado',
            'Publicado en',
            'Creado',
            'Visitas',
            'Guardados',
            'Comentarios',
            'Valoraciones',
            'Promedio puntaje',
        ];
    }

    /**
     * @param Archivo $archivo
     */
    public function map($archivo): array
    {
        $carreraCodigo = $archivo->planEstudio?->carrera?->codigo
            ?? optional($archivo->materia?->carreras?->first())->codigo;

        return [
            $archivo->titulo,
            $archivo->autor?->name,
            $carreraCodigo,
            $archivo->materia?->nombre,
            $archivo->planEstudio?->nombre,
            $archivo->tipo?->nombre,
            $archivo->estado?->nombre,
            optional($archivo->publicado_en)->format('Y-m-d'),
            optional($archivo->created_at)->format('Y-m-d H:i'),
            $archivo->visitas_count ?? 0,
            $archivo->savers_count ?? 0,
            $archivo->comentarios_count ?? 0,
            $archivo->valoraciones_count ?? 0,
            $archivo->valoraciones_avg_puntaje ? number_format((float) $archivo->valoraciones_avg_puntaje, 2) : null,
        ];
    }
}
