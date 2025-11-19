<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreComentarioRequest extends FormRequest
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
            'cuerpo' => ['required', 'string'],
            'destacado' => ['sometimes', 'boolean'],
        ];
    }
}
