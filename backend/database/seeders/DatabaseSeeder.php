<?php

namespace Database\Seeders;

use App\Models\CoinPackage;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(GenreSeeder::class);
        $this->call(AchievementSeeder::class);

        // Demo admin
        User::factory()->admin()->create([
            'name' => 'Admin COMIKA',
            'username' => 'admin',
            'email' => 'admin@comika.test',
        ]);

        // Demo creators
        User::factory()->count(3)->creator()->create([
            'password' => 'password',
        ]);

        // Demo readers
        User::factory()->count(5)->reader()->create([
            'password' => 'password',
        ]);

        // Demo reader account
        User::factory()->reader()->create([
            'name' => 'Budi Pembaca',
            'username' => 'budi',
            'email' => 'budi@comika.test',
            'coin_balance' => 500,
            'password' => 'password',
        ]);

        // Setiap user mendapat wallet koin (konsisten dengan alur register)
        foreach (User::all() as $user) {
            Wallet::firstOrCreate(
                ['user_id' => $user->id],
                ['coin_balance' => $user->coin_balance]
            );
        }

        // Coin packages
        $packages = [
            ['name' => 'Paket 100 Koin', 'coins' => 100, 'price' => 15000],
            ['name' => 'Paket 300 Koin', 'coins' => 300, 'price' => 42000],
            ['name' => 'Paket 700 Koin', 'coins' => 700, 'price' => 90000],
            ['name' => 'Paket 1500 Koin', 'coins' => 1500, 'price' => 175000],
        ];

        foreach ($packages as $package) {
            CoinPackage::updateOrCreate(['coins' => $package['coins']], $package);
        }

        // Konten demo (komik + episode + halaman) untuk pengalaman membaca
        $this->call(ComicDemoSeeder::class);
    }
}
