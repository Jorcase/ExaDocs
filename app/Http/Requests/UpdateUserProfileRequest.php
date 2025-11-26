<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['sometimes', 'exists:users,id'],
            'documento' => ['nullable', 'string', 'max:20'],
            'carrera_principal_id' => ['nullable', 'exists:carreras,id'],
            'telefono' => ['nullable', 'string', 'max:30'],
            'avatar' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'bio' => ['nullable', 'string'],
            'nombre_completo' => ['nullable', 'string', 'max:255'],
        ];
    }
}
