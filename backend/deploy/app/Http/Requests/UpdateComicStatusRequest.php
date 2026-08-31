<?php

namespace App\Http\Requests;

use App\Models\Comic;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateComicStatusRequest extends FormRequest
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
                Rule::in([Comic::STATUS_ONGOING, Comic::STATUS_COMPLETED, Comic::STATUS_HIATUS]),
            ],
        ];
    }
}
