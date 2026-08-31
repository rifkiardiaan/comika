<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEpisodePageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Otorisasi via EpisodePolicy::uploadPages
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'pages' => ['required', 'array', 'min:1', 'max:60'],
            'pages.*' => ['required', 'image', 'mimes:jpeg,png,webp', 'max:3072'],
        ];
    }

    public function messages(): array
    {
        return [
            'pages.required' => 'Minimal 1 halaman wajib diunggah.',
            'pages.*.max' => 'Ukuran setiap halaman maksimal 3MB.',
            'pages.*.image' => 'File harus berupa gambar (jpeg/png/webp).',
        ];
    }
}
