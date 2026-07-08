<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreUserProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['required', 'exists:users,id', 'unique:user_profiles,user_id'],
            'nombre_completo' => ['nullable', 'string', 'max:255'],
            'documento' => ['nullable', 'string', 'regex:/^[0-9]{6,8}$/'],
            'carrera_principal_id' => ['nullable', 'exists:carreras,id'],
            'telefono' => ['nullable', 'string', 'regex:/^[0-9]{10,15}$/'],
            'avatar' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'bio' => ['nullable', 'string'],
            'carreras_secundarias' => ['nullable', 'array'],
            'carreras_secundarias.*' => ['exists:carreras,id'],
            'remove_avatar' => ['nullable', 'boolean'],
        ];
    }
}
