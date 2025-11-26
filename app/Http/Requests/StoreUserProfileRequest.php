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
            'documento' => ['nullable', 'string', 'max:20'],
            'carrera_principal_id' => ['nullable', 'exists:carreras,id'],
            'telefono' => ['nullable', 'string', 'max:30'],
            'avatar' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'bio' => ['nullable', 'string'],
        ];
    }
}
