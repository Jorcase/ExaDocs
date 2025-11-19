<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMateriaRequest extends FormRequest
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
        $materiaId = $this->route('materia')?->id;

        return [
            'nombre' => ['required', 'string', 'max:150'],
            'codigo' => ['required', 'string', 'max:20', 'unique:materias,codigo,' . $materiaId],
            'descripcion' => ['nullable', 'string'],
            'tipo' => ['required', 'in:obligatoria,optativa,taller'],
            'asignaciones' => ['array'],
            'asignaciones.*.carrera_id' => ['required', 'exists:carreras,id'],
            'asignaciones.*.plan_estudio_id' => ['nullable', 'exists:plan_estudios,id'],
        ];
    }
}
