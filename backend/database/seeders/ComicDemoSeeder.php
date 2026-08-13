<?php

namespace Database\Seeders;

use App\Models\Comic;
use App\Models\Episode;
use App\Models\EpisodePage;
use App\Models\Genre;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Seeder konten demo untuk pengalaman membaca & monetisasi.
 *
 * 12 komik dengan id 1–12 yang SELARAS dengan data mock frontend
 * (web/src/data/mock.ts) — sehingga kartu mock di Home/Discover
 * menautkan ke konten API yang sama. Setiap komik punya 8 episode
 * (1–5 gratis, 6–8 premium @50 koin) dengan 10 halaman.
 */
class ComicDemoSeeder extends Seeder
{
    private const EPISODE_TITLES = [
        'Awal Perjalanan',
        'Jejak yang Hilang',
        'Pertemuan Tak Terduga',
        'Rahasia Terbongkar',
        'Badai Datang',
        'Pilihan Sulit',
        'Bayangan Lama',
        'Kebangkitan',
    ];

    /**
     * @var array<int, array<string, mixed>>
     */
    private array $definitions;

    public function __construct()
    {
        $this->definitions = [
            ['title' => 'Bulan di Ujung Jari', 'slug' => 'bulan-di-ujung-jari', 'synopsis' => 'Seorang pelukis jalanan menemukan kuas ajaib yang bisa menggambar pintu menuju dunia lain. Setiap malam purnama, dunia yang ia lukis menjadi nyata — dan mulai menginginkannya kembali.', 'genres' => ['fantasy', 'action', 'slice-of-life'], 'status' => 'ongoing', 'rating' => 4.8, 'views' => 1284000, 'likes' => 45200],
            ['title' => 'Naga Terakhir', 'slug' => 'naga-terakhir', 'synopsis' => 'Setelah 500 tahun bersembunyi, naga terakhir bangkit di era modern. Remaja bernama Bima terpilih menjadi penjaganya — padahal ia hanya ingin lulus SMA dengan tenang.', 'genres' => ['action', 'fantasy', 'adventure'], 'status' => 'ongoing', 'rating' => 4.6, 'views' => 982000, 'likes' => 33100],
            ['title' => 'Cinta Tak Berbalas', 'slug' => 'cinta-tak-berbalas', 'synopsis' => 'Setiap hari Laras menulis surat cinta yang tak pernah ia kirim. Suatu hari, semua surat itu menemukan jalannya sendiri — dan sampai ke orang yang salah.', 'genres' => ['romance', 'drama'], 'status' => 'ongoing', 'rating' => 4.5, 'views' => 756000, 'likes' => 28900],
            ['title' => 'Kost Paranormal', 'slug' => 'kost-paranormal', 'synopsis' => 'Kost murah di pinggir kota ternyata dihuni penghuni lain: hantu-hantu baik hati yang butuh bantuan menyelesaikan urusan duniawi mereka. Komedi horor yang menghangatkan hati.', 'genres' => ['horror', 'comedy', 'slice-of-life'], 'status' => 'completed', 'rating' => 4.4, 'views' => 642000, 'likes' => 21000],
            ['title' => 'Rekan Buatan', 'slug' => 'rekan-buatan', 'synopsis' => 'Di tahun 2147, android generasi terbaru diberi satu misi: menjadi sahabat bagi anak-anak yang kesepian. Tapi apa jadinya jika android itu mulai bertanya tentang perasaannya sendiri?', 'genres' => ['sci-fi', 'drama'], 'status' => 'ongoing', 'rating' => 4.7, 'views' => 1105000, 'likes' => 39800],
            ['title' => 'Pedang Senja', 'slug' => 'pedang-senja', 'synopsis' => 'Dunia di ambang kegelapan abadi. Satu-satunya harapan adalah pedang legendaris yang hanya bisa diangkat oleh mereka yang tak punya apa-apa untuk dilindungi.', 'genres' => ['action', 'fantasy', 'thriller'], 'status' => 'hiatus', 'rating' => 4.3, 'views' => 523000, 'likes' => 17400],
            ['title' => 'Secangkir Kenangan', 'slug' => 'secangkir-kenangan', 'synopsis' => 'Kedai kopi kecil di sudut kota menyimpan rahasia: setiap cangkir yang disajikan bisa mengembalikan satu kenangan pelanggannya. Cerita slice-of-life tentang cinta, kehilangan, dan harapan.', 'genres' => ['slice-of-life', 'romance', 'drama'], 'status' => 'completed', 'rating' => 4.9, 'views' => 890000, 'likes' => 41200],
            ['title' => 'Kasus Nol', 'slug' => 'kasus-nol', 'synopsis' => 'Detektif muda yang skeptis dipaksa bekerja sama dengan paranormal jenius untuk memecahkan "kasus nol" — pembunuhan yang terjadi sebelum korban lahir.', 'genres' => ['thriller', 'horror', 'sci-fi'], 'status' => 'ongoing', 'rating' => 4.6, 'views' => 668000, 'likes' => 22500],
            ['title' => 'Menara Tanpa Puncak', 'slug' => 'menara-tanpa-puncak', 'synopsis' => 'Menara misterius muncul di tengah kota setiap 100 tahun. Seorang pendaki bernama Sakura masuk sendirian untuk menemukan jawaban di lantai teratas — yang tak pernah ada.', 'genres' => ['fantasy', 'thriller', 'adventure'], 'status' => 'ongoing', 'rating' => 4.7, 'views' => 745000, 'likes' => 26800],
            ['title' => 'Si Rubah Juga', 'slug' => 'si-rubah-juga', 'synopsis' => 'Rubah berbulu sembilan yang bisa berubah wujud memutuskan menjadi YouTuber agar bisa membeli mahkota surgawi. Petualangan konyol dengan sentuhan mitologi.', 'genres' => ['comedy', 'fantasy'], 'status' => 'ongoing', 'rating' => 4.2, 'views' => 334000, 'likes' => 11900],
            ['title' => 'Jatuh dari Bintang', 'slug' => 'jatuh-dari-bintang', 'synopsis' => 'Bintang jatuh yang menjelma gadis kecil menumpang hidup di rumah seorang penyendiri. Ia mencoba memahami dunia manusia — dan manusia belajar merindukan langit.', 'genres' => ['slice-of-life', 'romance', 'fantasy'], 'status' => 'ongoing', 'rating' => 4.5, 'views' => 587000, 'likes' => 20300],
            ['title' => 'Tengkorak Tertawa', 'slug' => 'tengkorak-tertawa', 'synopsis' => 'Setiap orang yang menerima tengkorak ukiran misterius akan tertawa tanpa henti selama 24 jam. Seorang reporter mengejar asal usulnya — dan menemukan dirinya sebagai target berikutnya.', 'genres' => ['horror', 'thriller'], 'status' => 'hiatus', 'rating' => 4.1, 'views' => 289000, 'likes' => 9800],
        ];
    }

    public function run(): void
    {
        $creators = User::where('role', User::ROLE_CREATOR)->pluck('id')->all();

        if (empty($creators)) {
            $this->command?->warn('Tidak ada user creator — komik demo dilewati.');

            return;
        }

        foreach ($this->definitions as $index => $definition) {
            $comic = $this->upsertComic($index, $definition, $creators);
            $this->upsertEpisodes($comic, $definition);
        }
    }

    /**
     * @param  array<string, mixed>  $definition
     * @param  array<int, int>  $creators
     */
    private function upsertComic(int $index, array $definition, array $creators): Comic
    {
        $comic = Comic::updateOrCreate(
            ['slug' => $definition['slug']],
            [
                'id' => $index + 1,
                'creator_id' => $creators[$index % count($creators)],
                'title' => $definition['title'],
                'slug' => $definition['slug'],
                'synopsis' => $definition['synopsis'],
                'status' => $definition['status'],
                'age_rating' => Comic::AGE_TEEN,
                'rating_avg' => $definition['rating'],
                'rating_count' => (int) round($definition['likes'] / 3),
                'like_count' => $definition['likes'],
                'view_count' => $definition['views'],
                'published_at' => now()->subDays(count($this->definitions) - $index),
            ]
        );

        $genreIds = Genre::whereIn('slug', $definition['genres'])->pluck('id')->all();
        $comic->genres()->sync($genreIds);

        return $comic;
    }

    /**
     * @param  array<string, mixed>  $definition
     */
    private function upsertEpisodes(Comic $comic, array $definition): void
    {
        foreach (self::EPISODE_TITLES as $number => $subtitle) {
            $episodeNumber = $number + 1;
            $isPremium = $episodeNumber > 5;

            $episode = Episode::updateOrCreate(
                ['comic_id' => $comic->id, 'number' => $episodeNumber],
                [
                    'title' => "Episode {$episodeNumber}: {$subtitle}",
                    'status' => Episode::STATUS_PUBLISHED,
                    'is_premium' => $isPremium,
                    'price_coin' => $isPremium ? 50 : 0,
                    'view_count' => (int) round($definition['views'] / (12 - $episodeNumber) * 0.4),
                    'like_count' => (int) round($definition['likes'] / (12 - $episodeNumber) * 0.35),
                    'published_at' => now()->subDays((count(self::EPISODE_TITLES) - $episodeNumber) * 2 + 1),
                ]
            );

            $this->upsertPages($episode);
        }
    }

    private function upsertPages(Episode $episode): void
    {
        for ($page = 1; $page <= 10; $page++) {
            EpisodePage::updateOrCreate(
                ['episode_id' => $episode->id, 'page_number' => $page],
                [
                    'image_url' => "demo-pages/comic-{$episode->comic_id}/episode-{$episode->id}/p{$page}.png",
                ]
            );
        }
    }
}
