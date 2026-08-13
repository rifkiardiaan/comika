<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    /**
     * Registrasi terbuka untuk umum — semua user boleh daftar.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Normalisasi sebelum validasi: email & username disimpan lowercase
     * agar pencarian/login konsisten (validasi `lowercase` hanya memeriksa,
     * tidak mengubah nilai).
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'name' => trim((string) $this->name),
            'username' => mb_strtolower(trim((string) $this->username)),
            'email' => mb_strtolower(trim((string) $this->email)),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'username' => ['required', 'string', 'min:3', 'max:50', 'alpha_dash', Rule::unique('users', 'username')->whereNull('deleted_at')],
            'email' => ['required', 'string', 'email', 'max:255', 'lowercase', Rule::unique('users', 'email')->whereNull('deleted_at')],
            'password' => ['required', 'confirmed', Password::min(8)],
        ];
    }

    public function messages(): array
    {
        return [
            'username.alpha_dash' => 'Username hanya boleh berisi huruf, angka, tanda hubung, dan underscore.',
            'password.confirmed' => 'Konfirmasi password tidak cocok.',
        ];
    }
}
