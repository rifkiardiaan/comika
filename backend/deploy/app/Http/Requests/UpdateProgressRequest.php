<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProgressRequest extends FormRequest
{
    /**
     * Hanya user yang sudah login (middleware auth:sanctum).
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'episode_id' => ['required', 'integer', 'exists:episodes,id'],
            'last_page' => ['required', 'integer', 'min:1'],
            'progress' => ['sometimes', 'numeric', 'min:0', 'max:100'],
            'is_completed' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'episode_id.required' => 'Episode wajib diisi.',
            'episode_id.exists' => 'Episode tidak ditemukan.',
            'last_page.required' => 'Halaman terakhir wajib diisi.',
            'last_page.min' => 'Halaman terakhir minimal 1.',
            'progress.min' => 'Progress minimal 0.',
            'progress.max' => 'Progress maksimal 100.',
        ];
    }
}
