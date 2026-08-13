<x-mail::message>
# Halo, {{ $userName }}! 👋

Terima kasih sudah mendaftar di **COMIKA**. Satu langkah lagi untuk mengaktifkan akunmu — verifikasi alamat email kamu dengan mengklik tombol di bawah.

<x-mail::button :url="$verificationUrl">
Verifikasi Email Saya
</x-mail::button>

Jika tombol tidak berfungsi, salin dan buka link ini di browser:

{{ $verificationUrl }}

Link ini berlaku selama **60 menit**. Jika kamu tidak mendaftar di COMIKA, abaikan email ini.

Salam,
Tim COMIKA
</x-mail::message>
