<?php

namespace App\Http\Requests;

use App\Enums\Role;
use Illuminate\Foundation\Http\FormRequest;

class ResourceCreateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === Role::Owner;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:120'],
            'location' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'rules' => ['nullable', 'string', 'max:5000'],
            'max_hours_per_booking' => ['required', 'integer', 'min:1', 'max:24'],
            'weekly_cap_hours' => ['required', 'integer', 'min:1', 'max:168'],
            'status' => ['sometimes', 'in:active,inactive'],
            'availability_windows' => ['sometimes', 'array'],
            'availability_windows.*.weekday' => ['required_with:availability_windows', 'integer', 'between:1,7'],
            'availability_windows.*.start' => ['required_with:availability_windows', 'date_format:H:i'],
            'availability_windows.*.end' => ['required_with:availability_windows', 'date_format:H:i'],
            'requirements' => ['sometimes', 'array'],
            'requirements.*.name' => ['required_with:requirements', 'string', 'max:255'],
            'requirements.*.requires_verification' => ['sometimes', 'boolean'],
            'image' => ['sometimes', 'image', 'mimes:jpg,jpeg,png,webp', 'max:'.config('sharelab.max_upload_kb')],
        ];
    }
}
