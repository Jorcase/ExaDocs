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
            'documento' => ['nullable', 'string', 'regex:/^[0-9]{6,8}$/'],
            'carrera_principal_id' => ['nullable', 'exists:carreras,id'],
            'telefono' => ['nullable', 'string', 'regex:/^[0-9]{10,15}$/'],
            'avatar' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'bio' => ['nullable', 'string'],
            'nombre_completo' => ['nullable', 'string', 'max:255'],
            'carreras_secundarias' => ['nullable', 'array'],
            'carreras_secundarias.*' => ['exists:carreras,id'],
            'remove_avatar' => ['nullable', 'boolean'],
        ];
    }
}
