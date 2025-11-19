<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateNotificacionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['required', 'exists:users,id'],
            'tipo' => ['required', 'string', 'max:100'],
            'data' => ['required', 'array'],
            'leido_en' => ['nullable', 'date'],
        ];
    }
}
