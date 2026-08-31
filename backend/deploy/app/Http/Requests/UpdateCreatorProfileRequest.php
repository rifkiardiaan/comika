<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCreatorProfileRequest extends FormRequest
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
            'display_name' => ['required', 'string', 'max:100'],
            'bio' => ['nullable', 'string', 'max:1000'],
            'banner' => ['nullable', 'image', 'mimes:jpeg,png,webp', 'max:2048'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'display_name.required' => 'Nama tampilan wajib diisi.',
            'display_name.max' => 'Nama tampilan maksimal 100 karakter.',
            'bio.max' => 'Bio maksimal 1000 karakter.',
            'banner.image' => 'Banner harus berupa gambar.',
            'banner.mimes' => 'Banner harus berformat jpeg, png, atau webp.',
            'banner.max' => 'Ukuran banner maksimal 2MB.',
        ];
    }
}
