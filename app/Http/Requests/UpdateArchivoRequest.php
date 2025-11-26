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
                'mimes:pdf,jpg,jpeg,png,webp,doc,docx,xls,xlsx,csv,ppt,pptx,txt,md',
            ],
            'metadata' => ['nullable', 'array'],
            'observaciones_admin' => ['nullable', 'string'],
        ];
    }

    /**
     * Forzamos defaults de campos no editables si no vienen en la request.
     */
    protected function prepareForValidation(): void
    {
        $archivo = $this->route('archivo');
        if (!$archivo) {
            return;
        }

        $this->merge([
            'carrera_id' => $this->input(
                'carrera_id',
                $archivo->planEstudio?->carrera_id
                    ?? optional($archivo->materia?->carreras?->first())->id
            ),
            'materia_id' => $this->input('materia_id', $archivo->materia_id),
            'plan_estudio_id' => $this->input('plan_estudio_id', $archivo->plan_estudio_id),
            'tipo_archivo_id' => $this->input('tipo_archivo_id', $archivo->tipo_archivo_id),
            'estado_archivo_id' => $this->input('estado_archivo_id', $archivo->estado_archivo_id),
            'titulo' => $this->input('titulo', $archivo->titulo),
            'descripcion' => $this->input('descripcion', $archivo->descripcion),
        ]);
    }
}
