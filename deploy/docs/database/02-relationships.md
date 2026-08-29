# Relasi Eloquent COMIKA

| Model | Relasi | Tipe |
|-------|--------|------|
| `User` → `CreatorProfile` | `hasOne` | 1:1 |
| `User` → `Comic` (creator) | `hasMany` (`creator_id`) | 1:N |
| `User` → `Comment` | `hasMany` | 1:N |
| `User` → `Like` | `hasMany` | 1:N |
| `User` → `Bookmark` | `hasMany` | 1:N |
| `User` → `ReadingHistory` | `hasMany` | 1:N |
| `User` → `Rating` | `hasMany` | 1:N |
| `User` → `Follow` | `hasMany` | 1:N |
| `User` → `Comic` (followed) | `belongsToMany` via `follows` | N:M |
| `User` → `Wallet` | `hasOne` | 1:1 |
| `User` → `Transaction` | `hasMany` | 1:N |
| `User` → `EpisodeUnlock` | `hasMany` | 1:N |
| `User` → `CreatorEarning` | `hasMany` (`creator_id`) | 1:N |
| `User` → `Withdrawal` | `hasMany` (`creator_id`) | 1:N |
| `User` → `UserXp` | `hasOne` | 1:1 |
| `User` → `Achievement` | `belongsToMany` via `user_achievements` | N:M |
| `User` → `ReadingStreak` | `hasOne` | 1:1 |
| `User` → `Notification` | `hasMany` | 1:N |
| `Comic` → `User` (creator) | `belongsTo` | N:1 |
| `Comic` → `Genre` | `belongsToMany` via `comic_genres` | N:M |
| `Comic` → `Episode` | `hasMany` | 1:N |
| `Comic` → `Comment` | `hasMany` | 1:N |
| `Comic` → `Like` | `morphMany` (`likeable`) | 1:N poly |
| `Comic` → `Rating` | `hasMany` | 1:N |
| `Episode` → `Comic` | `belongsTo` | N:1 |
| `Episode` → `EpisodePage` | `hasMany` | 1:N |
| `Episode` → `Comment` | `hasMany` | 1:N |
| `Episode` → `Like` | `morphMany` | 1:N poly |
| `Episode` → `EpisodeUnlock` | `hasMany` | 1:N |
| `Comment` → `Comment` (parent) | `belongsTo` self | 1:N |
| `Report` → `reportable` | `morphTo` | poly |

Semua relasi didefinisikan di model (`backend/app/Models/`) dan siap dipakai
oleh API Resources di fase selanjutnya.
