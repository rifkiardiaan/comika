<x-mail::message>
# Halo, {{ $userName }}!

Kami menerima permintaan untuk mengatur ulang password akun COMIKA kamu. Klik tombol di bawah untuk membuat password baru.

<x-mail::button :url="$resetUrl">
Atur Ulang Password
</x-mail::button>

Jika tombol tidak berfungsi, salin dan buka link ini di browser:

{{ $resetUrl }}

Link ini berlaku selama **{{ $expiresMinutes }} menit**. Jika kamu tidak meminta reset password, abaikan email ini dan password kamu tidak akan berubah.

Salam,
Tim COMIKA
</x-mail::message>
