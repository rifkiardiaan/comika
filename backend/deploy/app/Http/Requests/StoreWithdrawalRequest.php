<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreWithdrawalRequest extends FormRequest
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
            'amount' => ['required', 'numeric', 'min:1', 'max:100000000'],
            'bank_name' => ['required', 'string', 'max:60'],
            'bank_account' => ['required', 'string', 'max:40'],
            'bank_holder' => ['required', 'string', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'amount.required' => 'Nominal penarikan wajib diisi.',
            'amount.numeric' => 'Nominal penarikan harus berupa angka.',
            'amount.min' => 'Nominal penarikan minimal Rp 1.',
            'bank_name.required' => 'Nama bank wajib diisi.',
            'bank_account.required' => 'Nomor rekening wajib diisi.',
            'bank_holder.required' => 'Nama pemilik rekening wajib diisi.',
        ];
    }
}
