<?php

namespace App\Exports;

use App\Models\Materia;
use Maatwebsite\Excel\Concerns\FromCollection;

class MateriasExport implements FromCollection
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
