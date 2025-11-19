<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTipoArchivoRequest extends FormRequest
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
        $tipoArchivoId = $this->route('tipoArchivo')?->id ?? $this->route('tipo_archivo')?->id;

        return [
            'nombre' => ['required', 'string', 'max:100', 'unique:tipos_archivos,nombre,' . $tipoArchivoId],
            'descripcion' => ['nullable', 'string'],
        ];
    }
}
