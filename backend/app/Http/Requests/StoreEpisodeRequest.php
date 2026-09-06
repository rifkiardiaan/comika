<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEpisodeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Otorisasi via EpisodePolicy
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:140'],
            'number' => ['sometimes', 'integer', 'min:1'],
            'is_premium' => ['sometimes', 'boolean'],
            // Episode gratis boleh tanpa harga koin (atau 0). Minimal 1 koin
            // hanya diberlakukan saat episode premium.
            'price_coin' => [
                'nullable',
                'required_if:is_premium,true',
                'integer',
                'max:10000',
                function ($attribute, $value, $fail) {
                    if ($this->boolean('is_premium') && (int) $value < 1) {
                        $fail('Harga koin minimal 1 untuk episode premium.');
                    }
                },
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'price_coin.required_if' => 'Harga koin wajib diisi untuk episode premium.',
        ];
    }
}
