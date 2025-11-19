<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePlan_EstudioRequest extends FormRequest
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
            'nombre' => ['required', 'string', 'max:150'],
            'anio_plan' => ['required', 'integer', 'digits:4'],
            'estado' => ['required', 'in:vigente,no_vigente,discontinuado'],
            'vigente_desde' => ['nullable', 'date'],
            'vigente_hasta' => ['nullable', 'date', 'after_or_equal:vigente_desde'],
        ];
    }
}
