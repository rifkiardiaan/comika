<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEpisodeRequest extends FormRequest
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
            'title' => ['sometimes', 'required', 'string', 'max:140'],
            'is_premium' => ['sometimes', 'boolean'],
            'price_coin' => ['required_if:is_premium,true', 'integer', 'min:1', 'max:10000'],
        ];
    }
}
