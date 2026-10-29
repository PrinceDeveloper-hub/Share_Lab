<?php

namespace App\Http\Requests;

use App\Models\Resource;
use Illuminate\Foundation\Http\FormRequest;

class ResourceUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        $resource = $this->route('resource');

        return $resource instanceof Resource
            && $this->user() !== null
            && (int) $resource->owner_id === (int) $this->user()->getKey();
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'category' => ['sometimes', 'required', 'string', 'max:120'],
            'location' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'rules' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'max_hours_per_booking' => ['sometimes', 'required', 'integer', 'min:1', 'max:24'],
            'weekly_cap_hours' => ['sometimes', 'required', 'integer', 'min:1', 'max:168'],
            'status' => ['sometimes', 'in:active,inactive'],
            'availability_windows' => ['sometimes', 'array'],
            'availability_windows.*.weekday' => ['required_with:availability_windows', 'integer', 'between:1,7'],
            'availability_windows.*.start' => ['required_with:availability_windows', 'date_format:H:i'],
            'availability_windows.*.end' => ['required_with:availability_windows', 'date_format:H:i'],
            'requirements' => ['sometimes', 'array'],
            'requirements.*.name' => ['required_with:requirements', 'string', 'max:255'],
            'requirements.*.requires_verification' => ['sometimes', 'boolean'],
            'image' => ['sometimes', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ];
    }
}
