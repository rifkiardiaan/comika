<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Validasi input untuk semua tool AI assistant (blueprint 27).
 *
 * Semua field opsional — tool berbeda memakai kombinasi field berbeda,
 * dan generator rule-based tetap bisa bekerja tanpa input detail.
 */
class AiGenerateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isCreator() ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'topic' => ['nullable', 'string', 'max:255'],
            'title' => ['nullable', 'string', 'max:120'],
            'synopsis' => ['nullable', 'string', 'max:5000'],
            'keywords' => ['nullable', 'string', 'max:500'],
            'role' => ['nullable', 'string', 'max:50'],
            'genres' => ['nullable', 'array', 'max:10'],
            'genres.*' => ['nullable', 'string', 'max:50'],
            'count' => ['nullable', 'integer', 'min:1', 'max:10'],
        ];
    }
}
