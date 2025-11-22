<?php

namespace App\Exports;

use App\Models\Carrera;
use Maatwebsite\Excel\Concerns\FromCollection;

class CarrerasExport implements FromCollection
{
    public function __construct(private $collection)
    {
    }

    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        return $this->collection;
    }
}
