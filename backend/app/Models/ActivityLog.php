<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ActivityLog extends Model
{
    use HasFactory;

    /**
     * Kategori aksi yang dicatat ke riwayat aktivitas.
     */
    public const ACTION_COMIC_UPLOAD = 'comic_upload';
    public const ACTION_COMIC_VERIFY = 'comic_verify';
    public const ACTION_COMIC_PUBLISH = 'comic_publish';
    public const ACTION_COMIC_BLOCK = 'comic_block';
    public const ACTION_COMIC_BAN = 'comic_ban';
    public const ACTION_EPISODE_PUBLISH = 'episode_publish';
    public const ACTION_EPISODE_SUBMIT = 'episode_submit';
    public const ACTION_EPISODE_REJECT = 'episode_reject';
    public const ACTION_EPISODE_DELETE = 'episode_delete';
    public const ACTION_COIN_PURCHASE = 'coin_purchase';
    public const ACTION_EPISODE_UNLOCK = 'episode_unlock';
    public const ACTION_SUBSCRIPTION = 'subscription';
    public const ACTION_COMIC_DOWNLOAD = 'comic_download';
    public const ACTION_COMMENT_MODERATE = 'comment_moderate';
    public const ACTION_USER_ROLE = 'user_role';
    public const ACTION_USER_BAN = 'user_ban';
    public const ACTION_USER_UNBAN = 'user_unban';
    public const ACTION_USER_PERMANENT_BAN = 'user_permanent_ban';
    public const ACTION_CREATOR_APPROVE = 'creator_approve';

    protected $fillable = [
        'user_id',
        'action',
        'description',
        'subject_type',
        'subject_id',
        'metadata',
        'ip_address',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function subject(): MorphTo
    {
        return $this->morphTo();
    }
}
