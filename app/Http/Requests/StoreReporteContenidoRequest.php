<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReporteContenidoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'archivo_id' => ['required', 'exists:archivos,id'],
            'motivo' => ['required', 'in:spam,contenido_incorrecto,copyright,otro'],
            'detalle' => ['nullable', 'string'],
        ];
    }
}
