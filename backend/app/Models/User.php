<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    public const ROLE_READER = 'reader';
    public const ROLE_CREATOR = 'creator';
    public const ROLE_ADMIN = 'admin';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */    protected $fillable = [
        'name', 'username', 'email', 'password', 'role',
        'avatar_url', 'coin_balance', 'is_premium', 'premium_until',
        'is_vvip', 'vvip_until',
    ];

    // Kolom is_banned, is_permanently_banned, ban_reason di-add via migration.
    // Tidak dimasukkan ke $fillable agar model tetap aman saat
    // migration belum dijalankan di production.

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'email_verification_code_expires_at' => 'datetime',
        'premium_until' => 'datetime',
        'is_premium' => 'boolean',
        'is_vvip' => 'boolean',
        'vvip_until' => 'datetime',
        'is_banned' => 'boolean',
        'is_permanently_banned' => 'boolean',
        'can_upload' => 'boolean',
        'password' => 'hashed',
    ];

    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    public function isCreator(): bool
    {
        return $this->role === self::ROLE_CREATOR;
    }

    public function isBanned(): bool
    {
        try {
            return $this->is_banned || $this->is_permanently_banned;
        } catch (\Throwable $e) {
            return false;
        }
    }

    /**
     * Izin mengupload konten (komik baru, episode, & halaman).
     * Dinonaktifkan admin saat komik milik creator diblokir.
     * Creator tetap bisa login, hanya tidak bisa upload lagi.
     */
    public function canUpload(): bool
    {
        try {
            return ($this->can_upload ?? true) === true;
        } catch (\Throwable $e) {
            return true;
        }
    }

    public function isPremium(): bool
    {
        return $this->is_premium && $this->premium_until && $this->premium_until->isFuture();
    }

    public function isVvip(): bool
    {
        return $this->is_vvip && $this->vvip_until && $this->vvip_until->isFuture();
    }

    public function creatorProfile(): HasOne
    {
        return $this->hasOne(CreatorProfile::class);
    }

    public function comics(): HasMany
    {
        return $this->hasMany(Comic::class, 'creator_id');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    public function likes(): HasMany
    {
        return $this->hasMany(Like::class);
    }

    public function bookmarks(): HasMany
    {
        return $this->hasMany(Bookmark::class);
    }

    public function readingHistories(): HasMany
    {
        return $this->hasMany(ReadingHistory::class);
    }

    public function follows(): HasMany
    {
        return $this->hasMany(Follow::class);
    }

    public function followedComics(): BelongsToMany
    {
        return $this->belongsToMany(Comic::class, 'follows');
    }

    public function ratings(): HasMany
    {
        return $this->hasMany(Rating::class);
    }

    public function reports(): HasMany
    {
        return $this->hasMany(Report::class, 'reporter_id');
    }

    public function wallet(): HasOne
    {
        return $this->hasOne(Wallet::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function episodeUnlocks(): HasMany
    {
        return $this->hasMany(EpisodeUnlock::class);
    }

    public function creatorEarnings(): HasMany
    {
        return $this->hasMany(CreatorEarning::class, 'creator_id');
    }

    public function withdrawals(): HasMany
    {
        return $this->hasMany(Withdrawal::class, 'creator_id');
    }

    public function xp(): HasOne
    {
        return $this->hasOne(UserXp::class);
    }

    public function achievements(): BelongsToMany
    {
        return $this->belongsToMany(Achievement::class, 'user_achievements')
            ->withPivot('earned_at');
    }

    public function readingStreak(): HasOne
    {
        return $this->hasOne(ReadingStreak::class);
    }

    /**
     * Notifikasi kustom COMIKA.
     * Dinamakan appNotifications agar tidak menimpa relasi `notifications()`
     * dari trait Notifiable yang dipakai Laravel untuk mengirim notifikasi.
     */
    public function appNotifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    /**
     * Subscription web push (Web Push API) — untuk notifikasi browser.
     * Satu user bisa punya banyak device/browser.
     */
    public function pushSubscriptions(): HasMany
    {
        return $this->hasMany(PushSubscription::class);
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }
}
