<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAuditoriaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['nullable', 'exists:users,id'],
            'accion' => ['required', 'string', 'max:100'],
            'entidad_tipo' => ['nullable', 'string', 'max:100'],
            'entidad_id' => ['nullable', 'integer'],
            'payload' => ['nullable', 'array'],
            'ip_address' => ['nullable', 'string', 'max:45'],
            'user_agent' => ['nullable', 'string'],
            'created_at' => ['nullable', 'date'],
        ];
    }
}
