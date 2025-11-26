<?php

namespace App\Exports;

use App\Models\Carrera;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class CarrerasExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize
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
            'Tipo de carrera',
        ];
    }

    /**
     * @param Carrera $carrera
     */
    public function map($carrera): array
    {
        return [
            $carrera->id,
            $carrera->nombre,
            $carrera->codigo,
            $carrera->tipoCarrera?->nombre,
        ];
    }
}
