<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ResourceCreateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check() && (auth()->user()->role->isOwner() || auth()->user()->role->isManager() || auth()->user()->role->isAdmin());
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:255'],
            'location' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'rules' => ['nullable', 'string'],
            'max_hours_per_booking' => ['required', 'integer', 'min:1'],
            'weekly_cap_hours' => ['required', 'integer', 'min:1'],
            'status' => ['nullable', 'in:active,inactive'],
        ];
    }