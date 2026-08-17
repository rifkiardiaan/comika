<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Minishlink\WebPush\VAPID;

class GenerateWebPushKeys extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'webpush:keys';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate pasangan kunci VAPID untuk web push notification (isi ke .env)';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        try {
            $keys = VAPID::createVapidKeys();
        } catch (\Throwable $e) {
            $this->error('Gagal membuat kunci VAPID: '.$e->getMessage());
            $this->newLine();
            $this->line('Di Windows, pastikan variabel OPENSSL_CONF menunjuk ke openssl.cnf yang valid, misalnya:');
            $this->line('  set OPENSSL_CONF=C:\\laragon\\bin\\php\\php-8.1.10-Win32-vs16-x64\\extras\\ssl\\openssl.cnf');
            $this->line('lalu jalankan ulang perintah ini.');

            return self::FAILURE;
        }

        $this->info('Pasangan kunci VAPID berhasil dibuat — salin ke .env:');
        $this->newLine();
        $this->line('VAPID_SUBJECT=mailto:noreply@comika.app');
        $this->line('VAPID_PUBLIC_KEY='.$keys['publicKey']);
        $this->line('VAPID_PRIVATE_KEY='.$keys['privateKey']);
        $this->newLine();
        $this->warn('Simpan private key dengan aman. Kunci dipakai selamanya — jangan generate ulang setelah production.');

        return self::SUCCESS;
    }
}
