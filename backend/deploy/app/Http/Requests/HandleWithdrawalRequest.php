<?php

namespace App\Http\Requests;

use App\Models\Withdrawal;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class HandleWithdrawalRequest extends FormRequest
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
                Rule::in([Withdrawal::STATUS_APPROVED, Withdrawal::STATUS_REJECTED, Withdrawal::STATUS_PAID]),
            ],
            'admin_note' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'status.required' => 'Status wajib diisi.',
            'status.in' => 'Status tidak valid.',
        ];
    }
}
