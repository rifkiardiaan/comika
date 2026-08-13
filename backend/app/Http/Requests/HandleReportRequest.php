<?php

namespace App\Http\Requests;

use App\Models\Report;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class HandleReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'status' => [
                'required',
                Rule::in([Report::STATUS_RESOLVED, Report::STATUS_DISMISSED]),
            ],
            'admin_note' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
