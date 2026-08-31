<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * AI Assistant COMIKA (blueprint 27 — optional service).
 *
 * Alat bantu menulis untuk creator: judul, sinopsis, genre & tag,
 * karakter, dan outline episode.
 *
 * Dua mode (opsional — core platform tidak bergantung pada AI):
 * 1. Bila `AI_API_KEY` dikonfigurasi → memanggil LLM lewat endpoint
 *    OpenAI-compatible (/chat/completions). Bekerja dengan OpenAI,
 *    Groq, OpenRouter, dan provider lain dengan format serupa.
 * 2. Bila tidak dikonfigurasi (atau request LLM gagal) → generator
 *    rule-based bawaan (deterministik, tanpa API) agar fitur tetap
 *    berfungsi untuk demo/offline.
 */
class AiService
{
    /** Jumlah hasil default per permintaan. */
    private const DEFAULT_COUNT = 5;

    // ====================================================================
    // Publik
    // ====================================================================

    /** Apakah AI dikonfigurasi (API key tersedia). */
    public function isConfigured(): bool
    {
        return filled(config('services.ai.api_key'));
    }

    /**
     * Generate ide judul komik.
     *
     * @param  array{topic?: string, synopsis?: string, genres?: array<int, string>, keywords?: string, count?: int}  $input
     * @return array{titles: array<int, string>}
     */
    public function generateTitles(array $input = []): array
    {
        $count = $this->count($input, 5);

        if ($this->isConfigured()) {
            $result = $this->chatJson(
                'Kamu adalah asisten penulis komik/webtoon Indonesia yang kreatif.',
                'Buat '.$count.' ide judul komik yang menarik. '.$this->describe($input).
                "\nBalas HANYA dengan JSON: {\"titles\": [\"Judul 1\", \"Judul 2\", ...]}"
            );

            if (is_array($result['titles'] ?? null) && count($result['titles']) > 0) {
                return ['titles' => array_slice(array_values(array_filter(
                    array_map('strval', $result['titles']),
                    fn ($t) => trim($t) !== ''
                )), 0, $count)];
            }
        }

        return ['titles' => $this->fallbackTitles($input, $count)];
    }

    /**
     * Generate sinopsis komik.
     *
     * @param  array{title?: string, topic?: string, genres?: array<int, string>, keywords?: string}  $input
     * @return array{synopsis: string}
     */
    public function generateSynopsis(array $input = []): array
    {
        if ($this->isConfigured()) {
            $result = $this->chatJson(
                'Kamu adalah asisten penulis komik/webtoon Indonesia.',
                'Tulis sinopsis komik yang menarik (3-4 kalimat). '.$this->describe($input).
                "\nBalas HANYA dengan JSON: {\"synopsis\": \"...\"}"
            );

            if (filled($result['synopsis'] ?? null)) {
                return ['synopsis' => trim((string) $result['synopsis'])];
            }
        }

        return ['synopsis' => $this->fallbackSynopsis($input)];
    }

    /**
     * Rekomendasi genre & tag untuk komik.
     *
     * @param  array{title?: string, synopsis?: string, topic?: string}  $input
     * @return array{genres: array<int, string>, tags: array<int, string>}
     */
    public function suggestGenresTags(array $input = []): array
    {
        if ($this->isConfigured()) {
            $result = $this->chatJson(
                'Kamu adalah editor komik/webtoon Indonesia.',
                'Tentukan genre dan tag yang cocok untuk komik berikut. '.$this->describe($input).
                "\nBalas HANYA dengan JSON: {\"genres\": [\"Action\", \"Fantasy\"], \"tags\": [\"petualangan\", \"dunia lain\"]}"
            );

            if (is_array($result['genres'] ?? null) && is_array($result['tags'] ?? null)) {
                return [
                    'genres' => array_values(array_filter(array_map('strval', $result['genres']), fn ($g) => trim($g) !== '')),
                    'tags' => array_values(array_filter(array_map('strval', $result['tags']), fn ($t) => trim($t) !== '')),
                ];
            }
        }

        return $this->fallbackGenresTags($input);
    }

    /**
     * Generate konsep karakter.
     *
     * @param  array{role?: string, genres?: array<int, string>, topic?: string}  $input
     * @return array{character: array{name: string, role: string, personality: string, traits: array<int, string>, backstory: string}}
     */
    public function generateCharacter(array $input = []): array
    {
        $role = (string) ($input['role'] ?? 'protagonis');

        if ($this->isConfigured()) {
            $result = $this->chatJson(
                'Kamu adalah character designer komik/webtoon Indonesia.',
                'Buat konsep karakter dengan peran "'.$role.'". '.$this->describe($input).
                "\nBalas HANYA dengan JSON: {\"character\": {\"name\": \"...\", \"role\": \"...\", \"personality\": \"...\", \"traits\": [\"...\"], \"backstory\": \"...\"}}"
            );

            if (is_array($result['character'] ?? null) && filled($result['character']['name'] ?? null)) {
                $c = $result['character'];

                return [
                    'character' => [
                        'name' => (string) $c['name'],
                        'role' => (string) ($c['role'] ?? $role),
                        'personality' => (string) ($c['personality'] ?? ''),
                        'traits' => array_values(array_filter(array_map('strval', $c['traits'] ?? []), fn ($t) => trim($t) !== '')),
                        'backstory' => (string) ($c['backstory'] ?? ''),
                    ],
                ];
            }
        }

        return ['character' => $this->fallbackCharacter($input)];
    }

    /**
     * Generate outline episode.
     *
     * @param  array{title?: string, synopsis?: string, genres?: array<int, string>, count?: int}  $input
     * @return array{outline: array<int, array{number: int, title: string, summary: string}>}
     */
    public function generateOutline(array $input = []): array
    {
        $count = $this->count($input, 5);

        if ($this->isConfigured()) {
            $result = $this->chatJson(
                'Kamu adalah penulis skenario komik/webtoon Indonesia.',
                'Buat outline untuk '.$count.' episode pertama komik berikut. '.$this->describe($input).
                "\nBalas HANYA dengan JSON: {\"outline\": [{\"number\": 1, \"title\": \"...\", \"summary\": \"...\"}, ...]}"
            );

            if (is_array($result['outline'] ?? null) && count($result['outline']) > 0) {
                $outline = [];
                foreach (array_slice($result['outline'], 0, $count) as $beat) {
                    if (! is_array($beat) || ! filled($beat['title'] ?? null)) {
                        continue;
                    }
                    $outline[] = [
                        'number' => (int) ($beat['number'] ?? count($outline) + 1),
                        'title' => (string) $beat['title'],
                        'summary' => (string) ($beat['summary'] ?? ''),
                    ];
                }

                if (count($outline) > 0) {
                    return ['outline' => $outline];
                }
            }
        }

        return ['outline' => $this->fallbackOutline($input, $count)];
    }

    // ====================================================================
    // Klien LLM (OpenAI-compatible)
    // ====================================================================

    /**
     * Panggil /chat/completions dan parse respons sebagai JSON.
     *
     * @return array<string, mixed>|null  null bila request gagal / tidak valid
     */
    private function chatJson(string $system, string $user): ?array
    {
        try {
            $response = Http::baseUrl(config('services.ai.base_url'))
                ->withToken((string) config('services.ai.api_key'))
                ->timeout(config('services.ai.timeout'))
                ->acceptJson()
                ->post('/chat/completions', [
                    'model' => config('services.ai.model'),
                    'messages' => [
                        ['role' => 'system', 'content' => $system],
                        ['role' => 'user', 'content' => $user],
                    ],
                    'temperature' => 0.9,
                ]);

            if ($response->failed()) {
                Log::warning('AI request gagal', [
                    'status' => $response->status(),
                    'body' => mb_substr($response->body(), 0, 500),
                ]);

                return null;
            }

            $content = (string) ($response->json('choices.0.message.content') ?? '');
            $decoded = json_decode(trim($content), true);

            if (is_array($decoded)) {
                return $decoded;
            }

            // Fallback: beberapa provider membungkus JSON dalam markdown ```json
            if (preg_match('/```(?:json)?\s*([\s\S]*?)```/', $content, $m)) {
                $decoded = json_decode(trim($m[1]), true);
                if (is_array($decoded)) {
                    return $decoded;
                }
            }

            Log::warning('AI response bukan JSON valid', ['content' => mb_substr($content, 0, 500)]);

            return null;
        } catch (\Throwable $e) {
            Log::warning('AI request error', ['error' => $e->getMessage()]);

            return null;
        }
    }

    /** Deskripsi input untuk prompt LLM. */
    private function describe(array $input): string
    {
        $parts = [];
        if (filled($input['title'] ?? null)) {
            $parts[] = 'Judul: '.$input['title'];
        }
        if (filled($input['topic'] ?? null)) {
            $parts[] = 'Tema: '.$input['topic'];
        }
        if (filled($input['synopsis'] ?? null)) {
            $parts[] = 'Sinopsis: '.$input['synopsis'];
        }
        if (filled($input['genres'] ?? null)) {
            $parts[] = 'Genre: '.implode(', ', $input['genres']);
        }
        if (filled($input['keywords'] ?? null)) {
            $parts[] = 'Kata kunci: '.$input['keywords'];
        }

        return count($parts) > 0 ? implode(' | ', $parts) : 'Tanpa detail tambahan, bebas berkreasi.';
    }

    /** Jumlah hasil (clamp 1-10). */
    private function count(array $input, int $default = self::DEFAULT_COUNT): int
    {
        $count = (int) ($input['count'] ?? $default);

        return max(1, min(10, $count));
    }

    // ====================================================================
    // Generator rule-based (fallback — tanpa API)
    // ====================================================================

    /** Kata kunci genre → nama genre (untuk deteksi & tag). */
    private const GENRE_KEYWORDS = [
        'action' => ['laga', 'pertarungan', 'pedang', 'prajurit', 'misi', 'bounty', 'tempur', 'kekuatan'],
        'romance' => ['cinta', 'romantis', 'jatuh hati', 'pacar', 'kencan', 'dunia kampus', 'takdir'],
        'fantasy' => ['naga', 'sihir', 'kerajaan', 'dunia lain', 'legenda', 'jin', 'elf', 'pahlawan', 'taktik'],
        'drama' => ['keluarga', 'drama', 'air mata', 'kehilangan', 'persahabatan', 'masa lalu'],
        'comedy' => ['lucu', 'komedi', 'konyol', 'absurd', 'gokil', 'situasi kacau'],
        'horror' => ['hantu', 'horor', 'kuntilanak', 'misteri gelap', 'ketakutan', 'terkutuk', 'mayat'],
        'sci-fi' => ['robot', 'luar angkasa', 'sci-fi', 'masa depan', 'kloning', 'ai', 'teknologi', 'kapsul'],
        'slice-of-life' => ['sehari-hari', 'slice of life', 'santai', 'sekolah', 'kantor', 'kafe'],
        'thriller' => ['thriller', 'psikopat', 'misteri', 'pembunuhan', 'intrik', 'konspirasi', 'investigasi'],
        'adventure' => ['petualangan', 'ekspedisi', 'pulau', 'harta karun', 'dunia', 'jelajah', 'rahasia'],
    ];

    /** Nama genre yang dikenal (urutan stabil). */
    private const GENRE_NAMES = [
        'action' => 'Action',
        'romance' => 'Romance',
        'fantasy' => 'Fantasy',
        'drama' => 'Drama',
        'comedy' => 'Komedi',
        'horror' => 'Horor',
        'sci-fi' => 'Sci-Fi',
        'slice-of-life' => 'Slice of Life',
        'thriller' => 'Thriller',
        'adventure' => 'Petualangan',
    ];

    /** Bank kata per genre untuk judul. */
    private const TITLE_WORDS = [
        'action' => ['Pedang', 'Badai', 'Misi', 'Bayangan', 'Pemberontak', 'Garis Depan', 'Zona Perang'],
        'romance' => ['Cinta', 'Janji', 'Senja', 'Hati', 'Musim Semi', 'Rindu', 'Akhir Pekan'],
        'fantasy' => ['Naga', 'Bintang', 'Gerbang', 'Legenda', 'Jimat', 'Kerajaan', 'Cakrawala'],
        'drama' => ['Jalan', 'Kenangan', 'Rumah', 'Air Mata', 'Harapan', 'Persimpangan', 'Waktu'],
        'comedy' => ['Kacau', 'Gokil', 'Absurd', 'Konyol', 'Berantakan', 'Lelucon', 'Masalah'],
        'horror' => ['Malam', 'Bisikan', 'Gelap', 'Arwah', 'Terkutuk', 'Kubur', 'Bulan Purnama'],
        'sci-fi' => ['Nebula', 'Kode', 'Orbit', 'Kapsul', 'Sinyal', 'Dimensi', 'Mesin Waktu'],
        'slice-of-life' => ['Hari', 'Cangkir', 'Sore', 'Langit', 'Rutinitas', 'Musim Hujan', 'Halaman'],
        'thriller' => ['Jejak', 'Rahasia', 'Konspirasi', 'Titik Nol', 'Sandera', 'Detektif', 'Malam Panjang'],
        'adventure' => ['Ekspedisi', 'Pulau', 'Peta', 'Samudra', 'Horizon', 'Perjalanan', 'Gunung'],
    ];

    /** Template judul dengan placeholder {word} dan {topic}. */
    private const TITLE_TEMPLATES = [
        '{word} {topic}',
        '{topic}: {word}',
        'Legenda {word}',
        'Sang {word}',
        '{word} Terakhir',
        'Di Balik {word}',
        '{topic} dan {word}',
    ];

    /** Template sinopsis per genre (placeholder: {title}, {topic}). */
    private const SYNOPSIS_TEMPLATES = [
        'action' => 'Ketika dunia di ambang kekacauan, {topic} harus berdiri di garis depan melawan musuh yang jauh lebih kuat. Setiap langkah adalah pertarungan hidup dan mati — dan di balik itu semua, tersimpan rahasia yang bisa mengubah segalanya.',
        'romance' => 'Di antara rutinitas yang monoton, {topic} mempertemukan dua hati yang tak pernah menyangka akan bersatu. Namun cinta tak pernah berjalan mulus: ada masa lalu, perbedaan, dan pilihan yang harus mereka hadapi bersama.',
        'fantasy' => 'Di dunia yang dipenuhi sihir dan legenda, {topic} menjadi awal dari takdir yang telah lama dinubuatkan. Seorang pahlawan yang tak pernah menginginkan kekuasaan justru ditakdirkan memegang kunci keseimbangan dunia.',
        'drama' => 'Melalui {topic}, sekelompok orang belajar bahwa hidup tidak selalu hitam dan putih. Antara harapan dan kenyataan, mereka harus menemukan arti keluarga, persahabatan, dan memaafkan diri sendiri.',
        'comedy' => 'Semua bermula dari {topic} — satu keputusan konyol yang memicu rangkaian kejadian absurd yang tak bisa dikendalikan. Kekacauan demi kekacauan, persahabatan mereka justru semakin solid (walau amburadul).',
        'horror' => 'Di balik {topic} tersembunyi sesuatu yang seharusnya tidak pernah dibangunkan. Semakin dalam mereka menyelidiki, semakin nyata teror itu — dan semakin sedikit dari mereka yang bisa selamat.',
        'sci-fi' => 'Di masa depan yang dikendalikan teknologi, {topic} menjadi kunci dari rahasia yang disembunyikan penguasa dunia. Pilihan mereka akan menentukan apakah umat manusia bebas — atau menjadi mesin tanpa jiwa.',
        'slice-of-life' => 'Melalui {topic}, kisah sehari-hari yang sederhana justru menghangatkan hati. Tentang pertemanan kecil, mimpi sederhana, dan kebahagiaan yang sering terlewatkan di tengah kesibukan.',
        'thriller' => 'Semuanya berawal dari {topic} — sebuah petunjuk kecil yang membuka jaringan konspirasi yang jauh lebih besar. Di setiap sudut ada mata yang mengawasi, dan kepercayaan adalah barang mewah paling mahal.',
        'adventure' => '{topic} mengawali perjalanan yang membawa mereka menyeberangi lautan, gunung, dan peradaban yang terlupakan. Setiap langkah mendekatkan mereka pada harta karun — sekaligus bahaya yang tak pernah mereka bayangkan.',
    ];

    /** Template karakter: nama depan per genre. */
    private const CHARACTER_NAMES = [
        'action' => ['Arya', 'Bagas', 'Raka', 'Kirana', 'Dewi', 'Satria'],
        'romance' => ['Alya', 'Rangga', 'Nadia', 'Dimas', 'Salsa', 'Reza'],
        'fantasy' => ['Elara', 'Kael', 'Lyra', 'Darian', 'Sena', 'Vira'],
        'drama' => ['Maya', 'Bimo', 'Sari', 'Andi', 'Laras', 'Fajar'],
        'comedy' => ['Joko', 'Tika', 'Ucok', 'Budi', 'Ningsih', 'Dedi'],
        'horror' => ['Rina', 'Danu', 'Wulan', 'Surya', 'Intan', 'Bayu'],
        'sci-fi' => ['Nova', 'Xavier', 'Orion', 'Zara', 'Kai', 'Vega'],
        'slice-of-life' => ['Putri', 'Rizky', 'Mega', 'Yoga', 'Tasya', 'Gilang'],
        'thriller' => ['Aldo', 'Rara', 'Yudha', 'Sekar', 'Ivan', 'Nina'],
        'adventure' => ['Sam', 'Luna', 'Rai', 'Mira', 'Jaka', 'Nara'],
    ];

    /** Template outline per genre (beat singkat per episode). */
    private const OUTLINE_BEATS = [
        'action' => [
            'Pertemuan pertama {topic} dengan konflik yang mengubah segalanya',
            'Pelarian dan pertarungan pertama melawan musuh',
            'Rekrutmen sekutu baru; rahasia kekuatan mulai terkuak',
            'Pengkhianatan di tengah barisan; kekalahan telak',
            'Kebangkitan kembali: strategi baru untuk pukulan pamungkas',
        ],
        'romance' => [
            'Pertemuan tak sengaja antara dua karakter utama',
            'Momen canggung yang justru mendekatkan mereka',
            'Kesalahpahaman dan konflik dari masa lalu muncul',
            'Perpisahan sementara; kerinduan yang tak terhindarkan',
            'Reuni yang mengharukan dan keputusan bersama',
        ],
        'fantasy' => [
            'Penemuan awal bahwa dunia {topic} tidak seperti yang terlihat',
            'Perjalanan menuju tempat sakral; ujian pertama sang pahlawan',
            'Munculnya antagonis sejati dan kutukan kuno',
            'Pengorbanan besar demi menyelamatkan sekutu',
            'Pertarungan klimaks untuk menyeimbangkan dunia',
        ],
        'drama' => [
            'Pengenalan keluarga/sahabat dan masalah yang menggantung',
            'Konflik kecil yang memicu pertengkaran besar',
            'Kebenaran yang selama ini disembunyikan mulai muncul',
            'Titik terendah: keputusan yang menyakitkan',
            'Proses memaafkan dan babak baru kehidupan',
        ],
        'comedy' => [
            'Ide konyol {topic} yang memicu kekacauan pertama',
            'Rencana "sempurna" yang berakhir bencana',
            'Salah paham berantai yang semakin absurd',
            'Situasi terburuk yang ternyata membawa pelajaran',
            'Rencana pamungkas yang berhasil dengan cara tak terduga',
        ],
        'horror' => [
            'Kejadian aneh pertama yang diabaikan semua orang',
            'Penyelidikan awal: semakin tahu semakin takut',
            'Teror nyata dimulai; salah satu karakter hilang',
            'Kebenaran tentang kutukan {topic} terungkap',
            'Pertempuran terakhir untuk bertahan hidup',
        ],
        'sci-fi' => [
            'Penemuan {topic} yang melanggar aturan dunia',
            'Investigasi rahasia; bayang-bayang penguasa mulai terlihat',
            'Ujian kepercayaan di antara kru/pemberontak',
            'Pengorbanan teknologi melawan kemanusiaan',
            'Klimaks: pilihan yang menentukan masa depan umat manusia',
        ],
        'slice-of-life' => [
            'Hari biasa yang membawa pertemuan baru',
            'Kebiasaan kecil yang ternyata berarti',
            'Sedikit konflik harian dan cara mereka menghadapinya',
            'Momen refleksi: apa yang sebenarnya mereka cari',
            'Penutup hangat yang menandai babak baru',
        ],
        'thriller' => [
            'Petunjuk pertama yang mengarah pada konspirasi',
            'Saksi kunci hilang; tekanan meningkat',
            'Jejak palsu dan identitas ganda mulai terkuak',
            'Sandera/konfrontasi di titik paling berbahaya',
            'Pengungkapan dalang di balik {topic}',
        ],
        'adventure' => [
            'Panggilan petualangan: {topic} membuka peta lama',
            'Perjalanan pertama: rintangan alam yang mematikan',
            'Peradaban tersembunyi dan ujian keberanian',
            'Perpecahan kelompok saat harta karun semakin dekat',
            'Pencapaian tujuan dan rahasia di balik harta itu',
        ],
    ];

    /** Deteksi genre dari input (nama genre atau kata kunci). */
    private function detectGenre(array $input): string
    {
        $text = strtolower(
            implode(' ', array_filter([
                $input['genres'] ?? null ? implode(' ', $input['genres']) : null,
                $input['topic'] ?? null,
                $input['synopsis'] ?? null,
                $input['title'] ?? null,
            ]))
        );

        // Genre yang disebut eksplisit menang lebih dulu
        foreach (self::GENRE_NAMES as $slug => $name) {
            if (str_contains($text, strtolower($name))) {
                return $slug;
            }
        }

        // Skor kata kunci
        $best = 'slice-of-life';
        $bestScore = 0;
        foreach (self::GENRE_KEYWORDS as $slug => $keywords) {
            $score = 0;
            foreach ($keywords as $kw) {
                if (str_contains($text, $kw)) {
                    $score++;
                }
            }
            if ($score > $bestScore) {
                $best = $slug;
                $bestScore = $score;
            }
        }

        return $best;
    }

    /** Topik singkat dari input (untuk placeholder). */
    private function topic(array $input): string
    {
        if (filled($input['topic'] ?? null)) {
            return trim((string) $input['topic']);
        }
        if (filled($input['title'] ?? null)) {
            return trim((string) $input['title']);
        }
        if (filled($input['keywords'] ?? null)) {
            return trim((string) $input['keywords']);
        }
        $synopsis = (string) ($input['synopsis'] ?? '');
        $first = strtok($synopsis, '.!?');
        if ($first) {
            return mb_substr(trim($first), 0, 60);
        }

        return 'Takdir';
    }

    /**
     * @return array<int, string>
     */
    private function fallbackTitles(array $input, int $count): array
    {
        $genre = $this->detectGenre($input);
        $words = self::TITLE_WORDS[$genre] ?? self::TITLE_WORDS['slice-of-life'];
        $topic = $this->topic($input);
        $seed = crc32($genre.'|'.$topic);

        $titles = [];
        $i = 0;
        while (count($titles) < $count) {
            $word = $words[($seed + $i) % count($words)];
            $template = self::TITLE_TEMPLATES[($seed + $i * 3) % count(self::TITLE_TEMPLATES)];
            $title = str_replace(
                ['{word}', '{topic}'],
                [$word, ucfirst($topic)],
                $template
            );
            $title = trim(preg_replace('/\s+/', ' ', $title) ?? '');
            if (! in_array($title, $titles, true)) {
                $titles[] = $title;
            }
            $i++;
        }

        return $titles;
    }

    private function fallbackSynopsis(array $input): string
    {
        $genre = $this->detectGenre($input);
        $template = self::SYNOPSIS_TEMPLATES[$genre] ?? self::SYNOPSIS_TEMPLATES['slice-of-life'];

        return trim(str_replace(
            ['{title}', '{topic}'],
            [trim((string) ($input['title'] ?? '')), $this->topic($input)],
            $template
        ));
    }

    /**
     * @return array{genres: array<int, string>, tags: array<int, string>}
     */
    private function fallbackGenresTags(array $input): array
    {
        $genre = $this->detectGenre($input);
        $text = strtolower((string) ($input['synopsis'] ?? '').' '.(string) ($input['title'] ?? ''));

        // Genre: utama + genre lain yang kata kuncinya cocok
        $genres = [self::GENRE_NAMES[$genre]];
        foreach (self::GENRE_KEYWORDS as $slug => $keywords) {
            if ($slug === $genre) {
                continue;
            }
            foreach ($keywords as $kw) {
                if (str_contains($text, $kw)) {
                    $genres[] = self::GENRE_NAMES[$slug];
                    break;
                }
            }
        }

        // Tag: turunan genre + kata kunci yang muncul
        $tags = ['komik indonesia', 'webtoon'];
        $tagMap = [
            'action' => 'pertarungan epik',
            'romance' => 'romansa',
            'fantasy' => 'dunia fantasi',
            'drama' => 'emosional',
            'comedy' => 'lucu',
            'horror' => 'menegangkan',
            'sci-fi' => 'futuristik',
            'slice-of-life' => 'sehari-hari',
            'thriller' => 'penuh intrik',
            'adventure' => 'eksplorasi',
        ];
        $tags[] = $tagMap[$genre] ?? 'menarik';
        foreach (self::GENRE_KEYWORDS as $keywords) {
            foreach ($keywords as $kw) {
                if (str_contains($text, $kw)) {
                    $tags[] = $kw;
                }
            }
        }

        return [
            'genres' => array_values(array_unique(array_slice($genres, 0, 5))),
            'tags' => array_values(array_unique(array_slice($tags, 0, 8))),
        ];
    }

    /**
     * @return array{name: string, role: string, personality: string, traits: array<int, string>, backstory: string}
     */
    private function fallbackCharacter(array $input): array
    {
        $genre = $this->detectGenre($input);
        $names = self::CHARACTER_NAMES[$genre] ?? self::CHARACTER_NAMES['slice-of-life'];
        $role = (string) ($input['role'] ?? 'protagonis');
        $seed = crc32($genre.'|'.$role);

        $name = $names[$seed % count($names)];
        $traits = $this->traitsForRole($role);

        $roleLabel = match ($role) {
            'antagonis' => 'Antagonis',
            'pendukung' => 'Karakter Pendukung',
            default => 'Protagonis',
        };

        $backstory = match ($role) {
            'antagonis' => 'Masa lalu yang kelam membuatnya memilih jalan gelap — namun di balik kebenciannya, tersimpan luka yang belum pernah sembuh.',
            'pendukung' => 'Sahabat setia yang selalu ada di sisi tokoh utama. Ceria di luar, namun menyimpan beban yang jarang diceritakan.',
            default => 'Kehidupan biasa yang tiba-tiba berubah ketika sebuah peristiwa tak terduga menyeretnya ke tengah konflik besar.',
        };

        return [
            'name' => $name,
            'role' => $roleLabel,
            'personality' => $this->personalityFor($genre, $role),
            'traits' => $traits,
            'backstory' => $backstory,
        ];
    }

    /** @return array<int, string> */
    private function traitsForRole(string $role): array
    {
        return match ($role) {
            'antagonis' => ['Licik', 'Karismatik', 'Tanpa ampun', 'Cerdas'],
            'pendukung' => ['Setia', 'Humoris', 'Perhatian', 'Berani'],
            default => ['Berani', 'Pemikir', 'Tekad kuat', 'Peka'],
        };
    }

    private function personalityFor(string $genre, string $role): string
    {
        $base = match ($role) {
            'antagonis' => 'Tenang dan penuh perhitungan, dengan aura yang membuat orang lain cemas.',
            'pendukung' => 'Ramah dan mudah bergaul, selalu mencairkan suasana dengan lelucon.',
            default => 'Tegas dan pantang menyerah, meski sering menyembunyikan keraguannya di balik senyum.',
        };

        return match ($genre) {
            'comedy' => $base.' Kepribadiannya yang absurd justru menjadi sumber kekacauan yang menghibur.',
            'horror' => $base.' Terbiasa sendirian, dan memiliki kepekaan terhadap hal-hal yang tak terlihat.',
            'thriller' => $base.' Teliti dan skeptis — hampir tidak pernah percaya pada kebetulan.',
            'romance' => $base.' Romantis dalam diam, lebih banyak bertindak daripada berkata-kata.',
            default => $base,
        };
    }

    /**
     * @return array<int, array{number: int, title: string, summary: string}>
     */
    private function fallbackOutline(array $input, int $count): array
    {
        $genre = $this->detectGenre($input);
        $beats = self::OUTLINE_BEATS[$genre] ?? self::OUTLINE_BEATS['slice-of-life'];
        $topic = $this->topic($input);

        $outline = [];
        for ($i = 0; $i < $count; $i++) {
            $summary = str_replace('{topic}', $topic, $beats[$i % count($beats)]);
            $outline[] = [
                'number' => $i + 1,
                'title' => 'Bab '.($i + 1),
                'summary' => trim($summary),
            ];
        }

        return $outline;
    }
}
