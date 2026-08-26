<?php

namespace Database\Seeders;

use App\Models\Comic;
use App\Models\Episode;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

/**
 * Seeder untuk membuat gambar demo SVG untuk semua halaman episode.
 * Gambar disimpan di storage/app/public/demo-pages/
 */
class DemoPageSeeder extends Seeder
{
    /** Warna gradient untuk setiap komik */
    private const COMIC_COLORS = [
        1  => ['#667eea', '#764ba2'], // Bulan di Ujung Jari - purple
        2  => ['#f093fb', '#f5576c'], // Naga Terakhir - pink
        3  => ['#4facfe', '#00f2fe'], // Cinta Tak Berbalas - blue
        4  => ['#43e97b', '#38f9d7'], // Kost Paranormal - green
        5  => ['#fa709a', '#fee140'], // Rekan Buatan - yellow-pink
        6  => ['#a18cd1', '#fbc2eb'], // Pedang Senja - lavender
        7  => ['#fccb90', '#d57eeb'], // Secangkir Kenangan - orange-purple
        8  => ['#e0c3fc', '#8ec5fc'], // Kasus Nol - light purple-blue
        9  => ['#f5576c', '#ff9a9e'], // Menara Tanpa Puncak - red-pink
        10 => ['#667eea', '#764ba2'], // Si Rubah Juga - purple
        11 => ['#89f7fe', '#66a6ff'], // Jatuh dari Bintang - cyan-blue
        12 => ['#fbc2eb', '#a6c1ee'], // Tengkorak Tertawa - pink-blue
    ];

    private const EPISODE_SUBTITLES = [
        'Awal Perjalanan',
        'Jejak yang Hilang',
        'Pertemuan Tak Terduga',
        'Rahasia Terbongkar',
        'Badai Datang',
        'Pilihan Sulit',
        'Bayangan Lama',
        'Kebangkitan',
    ];

    public function run(): void
    {
        $comics = Comic::all();

        foreach ($comics as $comic) {
            $episodes = $comic->episodes()->orderBy('number')->get();
            $colors = self::COMIC_COLORS[$comic->id] ?? ['#667eea', '#764ba2'];

            foreach ($episodes as $episode) {
                $this->generatePages($comic, $episode, $colors);
            }
        }

        $this->command?->info('Demo page images generated successfully.');
    }

    private function generatePages(Comic $comic, Episode $episode, array $colors): void
    {
        for ($page = 1; $page <= 10; $page++) {
            $svg = $this->createPageSvg(
                comicTitle: $comic->title,
                episodeTitle: $episode->title,
                pageNumber: $page,
                totalPages: 10,
                colors: $colors,
                comicId: $comic->id,
                episodeNumber: $episode->number,
            );

            $path = "demo-pages/comic-{$comic->id}/episode-{$episode->id}/p{$page}.svg";
            Storage::disk('public')->put($path, $svg);
        }
    }

    private function createPageSvg(
        string $comicTitle,
        string $episodeTitle,
        int $pageNumber,
        int $totalPages,
        array $colors,
        int $comicId,
        int $episodeNumber,
    ): string {
        $color1 = $colors[0];
        $color2 = $colors[1];

        // Variasi pola berdasarkan nomor halaman
        $patterns = [
            1  => '<circle cx="400" cy="300" r="150" fill="white" opacity="0.1"/>
                   <circle cx="200" cy="500" r="100" fill="white" opacity="0.08"/>
                   <circle cx="600" cy="200" r="80" fill="white" opacity="0.12"/>',
            2  => '<rect x="100" y="100" width="600" height="400" rx="20" fill="white" opacity="0.1"/>
                   <rect x="150" y="550" width="500" height="150" rx="10" fill="white" opacity="0.08"/>',
            3  => '<polygon points="400,50 750,600 50,600" fill="white" opacity="0.08"/>
                   <polygon points="400,150 650,550 150,550" fill="white" opacity="0.06"/>',
            4  => '<line x1="50" y1="200" x2="750" y2="200" stroke="white" stroke-width="2" opacity="0.15"/>
                   <line x1="50" y1="400" x2="750" y2="400" stroke="white" stroke-width="2" opacity="0.15"/>
                   <line x1="50" y1="600" x2="750" y2="600" stroke="white" stroke-width="2" opacity="0.15"/>',
            5  => '<ellipse cx="400" cy="400" rx="300" ry="200" fill="white" opacity="0.08"/>
                   <ellipse cx="400" cy="400" rx="200" ry="130" fill="white" opacity="0.06"/>',
            6  => '<path d="M0,300 Q200,100 400,300 T800,300" stroke="white" stroke-width="3" fill="none" opacity="0.15"/>
                   <path d="M0,500 Q200,300 400,500 T800,500" stroke="white" stroke-width="3" fill="none" opacity="0.12"/>',
            7  => '<rect x="50" y="50" width="150" height="150" rx="10" fill="white" opacity="0.1"/>
                   <rect x="250" y="50" width="150" height="150" rx="10" fill="white" opacity="0.08"/>
                   <rect x="450" y="50" width="150" height="150" rx="10" fill="white" opacity="0.1"/>
                   <rect x="650" y="50" width="150" height="150" rx="10" fill="white" opacity="0.08"/>',
            8  => '<circle cx="200" cy="300" r="120" fill="white" opacity="0.1"/>
                   <circle cx="600" cy="300" r="120" fill="white" opacity="0.1"/>
                   <circle cx="400" cy="500" r="120" fill="white" opacity="0.08"/>',
            9  => '<path d="M400,100 L500,350 L750,350 L550,500 L620,750 L400,600 L180,750 L250,500 L50,350 L300,350 Z" fill="white" opacity="0.08"/>',
            10 => '<rect x="100" y="100" width="600" height="600" rx="30" fill="white" opacity="0.06"/>
                   <rect x="150" y="150" width="500" height="500" rx="20" fill="white" opacity="0.04"/>',
        ];

        $pattern = $patterns[$pageNumber] ?? $patterns[1];

        // Deskripsi panel komik
        $panelDescriptions = [
            1 => 'Panel pembuka',
            2 => 'Dialog karakter',
            3 => 'Adegan aksi',
            4 => 'Close-up wajah',
            5 => 'Suasana hati',
            6 => 'Tensi meningkat',
            7 => 'Plot twist',
            8 => 'Resolusi',
            9 => 'Cliffhanger',
            10 => 'Penutup',
        ];

        $description = $panelDescriptions[$pageNumber] ?? 'Panel komik';

        return <<<SVG
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1200" width="800" height="1200">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:{$color1};stop-opacity:1" />
      <stop offset="100%" style="stop-color:{$color2};stop-opacity:1" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.3"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="800" height="1200" fill="url(#bg)"/>

  <!-- Pattern -->
  {$pattern}

  <!-- Comic panel border -->
  <rect x="30" y="30" width="740" height="1140" rx="15" fill="none" stroke="white" stroke-width="4" opacity="0.3"/>

  <!-- Inner panels -->
  <rect x="50" y="50" width="340" height="350" rx="10" fill="white" opacity="0.15" filter="url(#shadow)"/>
  <rect x="410" y="50" width="340" height="350" rx="10" fill="white" opacity="0.12" filter="url(#shadow)"/>
  <rect x="50" y="420" width="700" height="250" rx="10" fill="white" opacity="0.1" filter="url(#shadow)"/>
  <rect x="50" y="690" width="340" height="230" rx="10" fill="white" opacity="0.12" filter="url(#shadow)"/>
  <rect x="410" y="690" width="340" height="230" rx="10" fill="white" opacity="0.15" filter="url(#shadow)"/>

  <!-- Title -->
  <text x="400" y="980" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="white" text-anchor="middle" opacity="0.9">
    {$comicTitle}
  </text>

  <!-- Episode -->
  <text x="400" y="1020" font-family="Arial, sans-serif" font-size="20" fill="white" text-anchor="middle" opacity="0.7">
    {$episodeTitle}
  </text>

  <!-- Panel description -->
  <text x="400" y="1070" font-family="Arial, sans-serif" font-size="16" fill="white" text-anchor="middle" opacity="0.5">
    {$description}
  </text>

  <!-- Page number -->
  <text x="400" y="1150" font-family="Arial, sans-serif" font-size="14" fill="white" text-anchor="middle" opacity="0.4">
    Halaman {$pageNumber} dari {$totalPages}
  </text>

  <!-- Decorative elements -->
  <circle cx="100" cy="1100" r="30" fill="white" opacity="0.1"/>
  <circle cx="700" cy="1100" r="30" fill="white" opacity="0.1"/>
</svg>
SVG;
    }
}
