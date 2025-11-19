<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEstadoArchivoRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $estadoId = $this->route('estadoArchivo')?->id ?? $this->route('estado_archivo')?->id;

        return [
            'nombre' => ['required', 'string', 'max:50', 'unique:estados_archivo,nombre,' . $estadoId],
            'descripcion' => ['nullable', 'string'],
            'es_final' => ['required', 'boolean'],
        ];
    }
}
