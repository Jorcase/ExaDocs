<?php

namespace App\Exports;

use App\Models\Materia;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class MateriasExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize
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
            'ID',
            'Nombre',
            'Código',
            'Tipo',
            'Descripción',
            'Carreras',
            'Planes de estudio',
        ];
    }

    /**
     * @param Materia $materia
     */
    public function map($materia): array
    {
        $carreras = $materia->carreras?->pluck('nombre')->filter()->implode(', ');
        $planes = $materia->planesEstudio?->pluck('nombre')->filter()->implode(', ');

        return [
            $materia->id,
            $materia->nombre,
            $materia->codigo,
            $materia->tipo,
            $materia->descripcion,
            $carreras,
            $planes,
        ];
    }
}
