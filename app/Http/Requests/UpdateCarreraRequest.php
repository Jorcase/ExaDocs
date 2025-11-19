<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCarreraRequest extends FormRequest
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
        $carreraId = $this->route('carrera')?->id;

        return [
            'tipo_carrera_id' => ['required', 'integer', 'exists:tipo_carreras,id'],
            'nombre' => ['required', 'string', 'max:150'],
            'codigo' => ['required', 'string', 'max:20', 'unique:carreras,codigo,' . $carreraId],
            'descripcion' => ['nullable', 'string'],
            'estado' => ['required', 'in:activa,inactiva'],
        ];
    }
}
