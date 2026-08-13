<?php

namespace Database\Seeders;

use App\Models\Achievement;
use App\Services\GamificationService;
use Illuminate\Database\Seeder;

class AchievementSeeder extends Seeder
{
    /**
     * Daftar achievement — code wajib sinkron dengan konstanta
     * ACH_* di App\Services\GamificationService.
     */
    public function run(): void
    {
        $achievements = [
            [
                'code' => GamificationService::ACH_FIRST_READ,
                'name' => 'Pembaca Baru',
                'description' => 'Baca episode pertamamu.',
                'xp_reward' => 20,
            ],
            [
                'code' => GamificationService::ACH_READ_10,
                'name' => 'Pembaca Aktif',
                'description' => 'Baca 10 episode berbeda.',
                'xp_reward' => 50,
            ],
            [
                'code' => GamificationService::ACH_READ_50,
                'name' => 'Kutu Buku',
                'description' => 'Baca 50 episode berbeda.',
                'xp_reward' => 150,
            ],
            [
                'code' => GamificationService::ACH_FINISH_COMIC,
                'name' => 'Tamat',
                'description' => 'Selesaikan semua episode terbit dari sebuah komik.',
                'xp_reward' => 100,
            ],
            [
                'code' => GamificationService::ACH_FIRST_COMMENT,
                'name' => 'Ikut Bicara',
                'description' => 'Kirim komentarmu yang pertama.',
                'xp_reward' => 15,
            ],
            [
                'code' => GamificationService::ACH_COMMENT_10,
                'name' => 'Pendapat Berharga',
                'description' => 'Kirim 10 komentar.',
                'xp_reward' => 40,
            ],
            [
                'code' => GamificationService::ACH_FIRST_FOLLOW,
                'name' => 'Follower Sejati',
                'description' => 'Ikuti komik pertamamu.',
                'xp_reward' => 15,
            ],
            [
                'code' => GamificationService::ACH_FIRST_LIKE,
                'name' => 'Memberi Dukungan',
                'description' => 'Sukai komik pertamamu.',
                'xp_reward' => 10,
            ],
            [
                'code' => GamificationService::ACH_STREAK_3,
                'name' => 'Rutin 3 Hari',
                'description' => 'Baca 3 hari berturut-turut.',
                'xp_reward' => 30,
            ],
            [
                'code' => GamificationService::ACH_STREAK_7,
                'name' => 'Rutin Seminggu',
                'description' => 'Baca 7 hari berturut-turut.',
                'xp_reward' => 100,
            ],
            [
                'code' => GamificationService::ACH_LEVEL_5,
                'name' => 'Level 5',
                'description' => 'Capai level 5.',
                'xp_reward' => 50,
            ],
            [
                'code' => GamificationService::ACH_LEVEL_10,
                'name' => 'Level 10',
                'description' => 'Capai level 10.',
                'xp_reward' => 150,
            ],
        ];

        foreach ($achievements as $achievement) {
            Achievement::updateOrCreate(
                ['code' => $achievement['code']],
                $achievement
            );
        }
    }
}
