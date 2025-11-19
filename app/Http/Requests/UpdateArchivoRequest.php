<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateArchivoRequest extends FormRequest
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
        return [
            'carrera_id' => ['required', 'exists:carreras,id'],
            'materia_id' => ['required', 'exists:materias,id'],
            'tipo_archivo_id' => ['required', 'exists:tipos_archivos,id'],
            'plan_estudio_id' => ['nullable', 'exists:plan_estudios,id'],
            'estado_archivo_id' => ['required', 'exists:estados_archivo,id'],
            'titulo' => ['required', 'string', 'max:150'],
            'descripcion' => ['nullable', 'string'],
            'archivo' => [
                'nullable',
                'file',
                'max:51200', // 50MB
                'mimes:pdf,jpg,jpeg,png,webp,doc,docx,xls,xlsx,csv',
            ],
            'metadata' => ['nullable', 'array'],
            'observaciones_admin' => ['nullable', 'string'],
        ];
    }
}
