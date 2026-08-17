<x-mail::message>
# Halo, {{ $userName }}! 👋

Terima kasih sudah mendaftar di **COMIKA**. Satu langkah lagi untuk mengaktifkan akunmu — verifikasi alamat email kamu.

@if($verificationCode)
## 🔢 Kode Verifikasi Kamu

Masukkan kode 6 digit berikut di halaman verifikasi:

<x-mail::panel>
# {{ $verificationCode }}
</x-mail::panel>

Kode ini berlaku selama **60 menit**.
@endif

## Atau Klik Link Berikut

<x-mail::button :url="$verificationUrl">
Verifikasi Email Saya
</x-mail::button>

Jika tombol tidak berfungsi, salin dan buka link ini di browser:

{{ $verificationUrl }}

Jika kamu tidak mendaftar di COMIKA, abaikan email ini.

Salam,
Tim COMIKA
</x-mail::message>
