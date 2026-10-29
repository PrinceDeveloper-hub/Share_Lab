<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AssignManagerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'email', 'exists:users,email'],
        ];
    }
}
