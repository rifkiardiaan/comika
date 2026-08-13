<?php

namespace App\Http\Requests;

use App\Models\Comic;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateComicRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Otorisasi dilakukan via ComicPolicy
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'required', 'string', 'max:120'],
            'synopsis' => ['sometimes', 'required', 'string', 'max:5000'],
            'status' => ['sometimes', Rule::in([Comic::STATUS_ONGOING, Comic::STATUS_COMPLETED, Comic::STATUS_HIATUS])],
            'age_rating' => ['sometimes', Rule::in([Comic::AGE_ALL, Comic::AGE_TEEN, Comic::AGE_ADULT])],
            'genres' => ['sometimes', 'required', 'array', 'min:1', 'max:5'],
            'genres.*' => ['required', 'integer', 'exists:genres,id'],
            'cover' => ['sometimes', 'image', 'mimes:jpeg,png,webp', 'max:2048'],
        ];
    }
}
