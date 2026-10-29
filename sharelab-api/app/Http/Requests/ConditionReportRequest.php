<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ConditionReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'condition' => ['required', 'in:excellent,good,fair,damaged'],
            'notes' => ['nullable', 'string', 'max:3000'],
            'checklist' => ['nullable', 'array'],
            'checklist.*' => ['string', 'max:255'],
            'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:'.config('sharelab.max_upload_kb')],
        ];
    }
}
