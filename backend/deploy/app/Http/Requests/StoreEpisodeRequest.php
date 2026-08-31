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
            'price_coin' => ['required_if:is_premium,true', 'integer', 'min:1', 'max:10000'],
        ];
    }

    public function messages(): array
    {
        return [
            'price_coin.required_if' => 'Harga koin wajib diisi untuk episode premium.',
        ];
    }
}
