<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ResetPasswordMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public readonly string $userName,
        public readonly string $resetUrl,
        public readonly int $expiresMinutes = 60,
    ) {
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Atur Ulang Password — COMIKA',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.reset-password',
        );
    }

    /**
     * Buat link reset password ke halaman frontend dengan token broker.
     */
    public static function urlFor(string $email, string $token): string
    {
        return rtrim(config('app.frontend_url'), '/')
            .'/reset-password?email='.rawurlencode($email)
            .'&token='.rawurlencode($token);
    }
}
