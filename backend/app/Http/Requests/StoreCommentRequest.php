<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCommentRequest extends FormRequest
{
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
            'content' => ['required', 'string', 'min:1', 'max:1000'],
            'parent_id' => [
                'sometimes',
                'nullable',
                'integer',
                // parent yang di-soft-delete dianggap tidak ada → 422 bersih
                Rule::exists('comments', 'id')->whereNull('deleted_at'),
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'content.required' => 'Isi komentar tidak boleh kosong.',
            'content.max' => 'Komentar maksimal 1000 karakter.',
            'parent_id.exists' => 'Komentar yang dibalas tidak ditemukan.',
        ];
    }
}
