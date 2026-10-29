<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ResourceUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        // Only owners and admins can update resources
        return $this->user() && in_array($this->user()->role, ['owner', 'manager', 'admin']);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|nullable|string',
            'category' => 'sometimes|required|string|in:3d-printer,oscilloscope,camera-kit,pcr-cycler,laser-cutter,meeting-room',
            'status' => 'sometimes|required|in:available,booked,maintenance',
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.string' => 'The resource name must be a string.',
            'category.in' => 'The category must be one of the available types.',
            'status.in' => 'The status must be one of: available, booked, or maintenance.',
        ];
    }
}