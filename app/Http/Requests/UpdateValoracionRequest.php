<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateValoracionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'archivo_id' => ['required', 'exists:archivos,id'],
            'user_id' => ['required', 'exists:users,id'],
            'puntaje' => ['required', 'integer', 'min:1', 'max:5'],
            'comentario' => ['nullable', 'string'],
        ];
    }
}
