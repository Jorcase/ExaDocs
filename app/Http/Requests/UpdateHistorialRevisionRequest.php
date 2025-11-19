<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateHistorialRevisionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'archivo_id' => ['required', 'exists:archivos,id'],
            'revisor_id' => ['required', 'exists:users,id'],
            'estado_nuevo_id' => ['required', 'exists:estados_archivo,id'],
            'estado_previo' => ['nullable', 'string', 'max:50'],
            'estado_nuevo' => ['nullable', 'string', 'max:50'],
            'comentario' => ['nullable', 'string'],
        ];
    }
}
