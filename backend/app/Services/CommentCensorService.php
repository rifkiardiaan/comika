<?php

namespace App\Services;

/**
 * Service untuk sensor kata kotor pada komentar.
 *
 * Mengganti kata-kata yang tidak pantas dengan *** otomatis
 * saat komentar dikirim atau diupdate.
 */
class CommentCensorService
{
    /**
     * Daftar kata kotor yang akan disensor (case-insensitive).
     * Bisa ditambah/dikurangi sesuai kebutuhan.
     */
    private const BAD_WORDS = [
        // Indonesian bad words
        'anjing', 'bangsat', 'babi', 'goblok', 'goblog', 'tolol', 'bodoh',
        'kontol', 'memek', 'vagina', 'penis', 'konthol', 'meki',
        'asu', 'asw', 'anjir', 'anjay', 'bangke', 'bego', 'bego',
        'sialan', 'sial', 'sialang', 'tai', 'taik', 'kampret',
        'kampungan', 'keparat', 'lacur', 'laknat', 'lonte', 'pelacur',
        'prostitusi', 'setan', 'syaitan', 'iblis',
        'jancuk', 'cuk', 'cukimay', 'nyet', 'monyet', 'bangsat',
        'peler', 'tempek', 'temol', 'nenen', 'toket',
        'ngentot', 'ngewe', 'colmek', 'colme', 'sepong', 'sepon',
        'muncrat', 'klimaks', 'horny', 'telanjang', 'bugil',
        'sex', 'seks', 'ngaceng', 'turn on', 'turn-on',
        'homo', 'lesbi', 'gay', 'lgbt',
        'bangsad', 'bangsadt', 'bangsat', 'bngst',
        'gblg', 'gbl', 'gblok', 'tolll', 'tll',
        'ajg', 'anj', 'bgst', 'kntol', 'mmk',
        'fuck', 'shit', 'bitch', 'ass', 'dick', 'pussy', 'cock',
        'bastard', 'damn', 'hell', 'crap', 'dumbass',
        'stfu', 'wtf', 'lmao', 'rofl',
        'pantat', 'bokong', 'peju', 'sperma',
    ];

    /**
     * Sensor kata kotor dalam teks.
     * Mengganti karakter tengah dengan * tetapi tetap mempertahankan
     * panjang kata asli agar tetap terbaca.
     *
     * Contoh: "anjing" → "a*****g" (tetap panjang 6)
     *          "goblok" → "g*****k" (tetap panjang 6)
     */
    public function censor(string $text): string
    {
        $censored = $text;

        foreach (self::BAD_WORDS as $word) {
            // Buat regex pattern yang case-insensitive untuk kata lengkap
            $pattern = '/\b' . preg_quote($word, '/') . '\b/i';

            if (preg_match($pattern, $censored)) {
                $censored = preg_replace_callback($pattern, function ($matches) {
                    $bad = $matches[0];
                    $len = mb_strlen($bad);

                    // Pertahankan huruf pertama dan terakhir, sisanya ganti *
                    if ($len <= 2) {
                        return str_repeat('*', $len);
                    }

                    return $bad[0] . str_repeat('*', $len - 2) . $bad[$len - 1];
                }, $censored);
            }
        }

        return $censored;
    }

    /**
     * Cek apakah teks mengandung kata kotor.
     */
    public function containsBadWords(string $text): bool
    {
        foreach (self::BAD_WORDS as $word) {
            $pattern = '/\b' . preg_quote($word, '/') . '\b/i';
            if (preg_match($pattern, $text)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Jumlah kata kotor yang ditemukan dalam teks.
     */
    public function countBadWords(string $text): int
    {
        $count = 0;

        foreach (self::BAD_WORDS as $word) {
            $pattern = '/\b' . preg_quote($word, '/') . '\b/i';
            preg_match_all($pattern, $text, $matches);
            $count += count($matches[0]);
        }

        return $count;
    }
}
