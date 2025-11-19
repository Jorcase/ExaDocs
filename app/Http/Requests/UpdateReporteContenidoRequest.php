<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateReporteContenidoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'archivo_id' => ['required', 'exists:archivos,id'],
            'reportante_id' => ['required', 'exists:users,id'],
            'motivo' => ['required', 'in:spam,contenido_incorrecto,copyright,otro'],
            'detalle' => ['nullable', 'string'],
            'estado' => ['required', 'in:pendiente,en_revision,resuelto'],
            'resuelto_por' => ['nullable', 'exists:users,id'],
            'resuelto_en' => ['nullable', 'date'],
        ];
    }
}
