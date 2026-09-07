/* ------------------------------------------------------------------ */
/* COMIKA — Shared TypeScript types (mirrors backend API resources)    */
/* ------------------------------------------------------------------ */

export type Role = 'reader' | 'creator' | 'admin'

export interface User {
  id: number
  name: string
  username: string
  email: string
  avatar_url: string | null
  role: Role
  coin_balance: number
  is_premium: boolean
  premium_until: string | null
  is_vvip: boolean
  vvip_until: string | null
  email_verified_at: string | null
  is_email_verified: boolean
  is_banned: boolean
  is_permanently_banned: boolean
  ban_reason: string | null
  can_upload: boolean
  created_at: string
}

export interface CreatorProfile {
  id: number
  user_id: number
  display_name: string
  bio: string
  banner_url: string | null
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface Genre {
  id: number
  slug: string
  name: string
}

export type ComicStatus = 'ongoing' | 'completed' | 'hiatus'
export type ComicAgeRating = 'semua_umur' | 'remaja' | 'dewasa'
export type VerificationStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'blocked'

export interface Comic {
  id: number
  title: string
  slug: string
  synopsis: string
  cover_url: string | null
  status: ComicStatus
  age_rating: ComicAgeRating
  rating_avg: number
  rating_count: number
  like_count: number
  view_count: number
  creator: { id: number; name: string; avatar_url: string | null }
  genres: Genre[]
  episode_count: number
  created_at: string
}

export type EpisodeStatus = 'draft' | 'pending' | 'published'

export interface Episode {
  id: number
  comic_id: number
  title: string
  number: number
  status: EpisodeStatus
  is_premium: boolean
  price_coin: number
  view_count: number
  like_count: number
  page_count?: number
  thumbnail_url?: string | null
  /** Status premium (diisi API saat user login): true bila episode bisa dibaca. */
  is_unlocked?: boolean
  /** Status premium: true bila episode terkunci dan butuh unlock. */
  is_locked?: boolean
  published_at: string | null
  created_at: string
}

export interface EpisodeDetail extends Episode {
  pages: EpisodePage[]
  prev: { id: number; number: number; title: string } | null
  next: { id: number; number: number; title: string } | null
}

export interface ComicDetail extends Comic {
  episodes: Episode[]
  user_actions?: {
    is_bookmarked: boolean
    is_followed: boolean
    is_liked: boolean
    user_rating: number | null
  }
  user_progress?: {
    episode_id: number
    episode_number: number
    episode_title: string
    last_page: number
    progress: number
    is_completed: boolean
    updated_at: string
  } | null
}

/** Profil creator publik (halaman /creators/:id). */
export interface PublicCreator {
  id: number
  username: string
  display_name: string
  bio: string | null
  avatar_url: string | null
  banner_url: string | null
  is_verified: boolean
  stats: {
    total_comics: number
    total_episodes: number
    total_views: number
    total_likes: number
    follower_count: number
  }
  comics: Comic[]
}

/* ------------------------------------------------------------------ */
/* Monetization (Phase 09) — mirrors backend monetization resources    */
/* ------------------------------------------------------------------ */

export interface CoinPackage {
  id: number
  name: string
  coins: number
  price: number
}

export type TransactionType = 'coin_purchase' | 'episode_unlock' | 'earning' | 'withdrawal'
export type TransactionStatus = 'pending' | 'success' | 'failed' | 'refunded'

export interface Transaction {
  id: number
  reference: string
  type: TransactionType
  status: TransactionStatus
  amount: number
  coins: number
  payment_method: string | null
  paid_at: string | null
  created_at: string
  episode?: {
    id: number
    number: number
    title: string
    comic_title: string
  }
}

export interface WalletSummary {
  balance: number
  total_spent: number
  unlocks_count: number
  purchases_count: number
}

export interface EpisodeUnlockRecord {
  id: number
  episode_id: number
  coins_spent: number
  unlocked_at: string
  episode: {
    id: number
    number: number
    title: string
    comic_id: number
    comic_title: string
    cover_url: string | null
  }
}

export interface EpisodePage {
  id: number
  episode_id: number
  page_number: number
  image_url: string
}

export type CreatorEarningStatus = 'pending' | 'paid'

/** Pengaturan pembagian pendapatan penjualan komik berbayar. */
export interface RevenueShareSettings {
  /** Bagian pendapatan untuk creator (0.0 – 1.0). */
  creator_share: number
  /** Bagian pendapatan untuk platform/admin (0.0 – 1.0). */
  admin_share: number
  /** Nilai nominal 1 koin dalam rupiah. */
  coin_value: number
  updated_at: string | null
}

export interface CreatorEarning {
  id: number
  amount: number
  status: CreatorEarningStatus
  episode: {
    id: number
    number: number
    title: string
    comic_id: number
    comic_title: string
  }
  reference: string | null
  paid_at: string | null
  created_at: string
}

export interface EarningsSummary {
  pending: number
  paid: number
  total: number
  available: number
  pending_withdrawals: number
  revenue_share?: RevenueShareSettings
}

export type WithdrawalStatus = 'pending' | 'approved' | 'rejected' | 'paid'

export interface Withdrawal {
  id: number
  amount: number
  status: WithdrawalStatus
  bank_name: string
  bank_account: string
  bank_holder: string
  admin_note: string | null
  processed_at: string | null
  created_at: string
}

export interface Comment {
  id: number
  comic_id: number
  episode_id: number | null
  parent_id: number | null
  user: { id: number; name: string; username: string | null; avatar_url: string | null; is_vvip?: boolean }
  content: string
  like_count: number
  created_at: string
  replies?: Comment[]
  parent_user?: { id: number; name: string } | null
}

/* ------------------------------------------------------------------ */
/* Gamification (Phase 11) — XP, level, streak & achievement           */
/* ------------------------------------------------------------------ */

export interface GamificationAchievement {
  code: string
  name: string
  description: string
  xp_reward: number
  earned: boolean
  earned_at: string | null
}

export interface GamificationProfile {
  level: number
  total_xp: number
  xp_into_level: number
  xp_to_next_level: number
  level_progress: number
  last_login_at: string | null
  streak: {
    current: number
    longest: number
    last_read_at: string | null
  }
  stats: {
    episodes_read: number
    comics_finished: number
    comments: number
    likes: number
    follows: number
    streak: number
    level: number
  }
  achievements: GamificationAchievement[]
}

export interface Paginated<T> {
  current_page: number
  data: T[]
  first_page_url: string
  from: number
  last_page: number
  last_page_url: string
  next_page_url: string | null
  path: string
  per_page: number
  prev_page_url: string | null
  to: number
  total: number
}

export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

/* ------------------------------------------------------------------ */
/* Notifications (blueprint 24) — in-app database notifications        */
/* ------------------------------------------------------------------ */

export type AppNotificationType =
  | 'new_episode'
  | 'comic_update'
  | 'comment_reply'
  | 'transaction'
  | 'system'
  | 'creator_application_approved'
  | 'creator_application_rejected'

export interface AppNotificationData {
  comic_id?: number
  comic_title?: string
  comic_slug?: string
  episode_id?: number
  episode_number?: number
  episode_title?: string
  comment_id?: number
  reply_snippet?: string
  withdrawal_id?: number
  status?: string
  amount?: number
  transaction_id?: number
  coins?: number
  [key: string]: unknown
}

export interface AppNotification {
  id: string
  type: AppNotificationType
  data: AppNotificationData
  read_at: string | null
  created_at: string
}

/* ------------------------------------------------------------------ */
/* Reader (Phase 05) — riwayat baca & progress                         */
/* ------------------------------------------------------------------ */

export interface ReadingHistory {
  id: number
  comic_id: number
  episode_id: number
  last_page: number
  progress: number
  is_completed: boolean
  updated_at: string
  comic?: Comic
  episode?: Episode
}

export interface BookmarkItem {
  id: number
  comic_id: number
  episode_id: number | null
  created_at: string
  comic: Comic
}

export interface FollowItem {
  id: number
  comic_id: number
  created_at: string
  comic: Comic
}

/* ------------------------------------------------------------------ */
/* Creator (Phase 07) — dashboard, komik, analytics                    */
/* ------------------------------------------------------------------ */

export interface CreatorComic extends Comic {
  published_episodes_count: number
  draft_episodes_count: number
  pending_episodes_count: number
  followers_count: number
  comments_count: number
  bookmarks_count: number
  verification_status: VerificationStatus
  rejection_reason: string | null
  published_at: string | null
  episodes?: CreatorEpisode[]
}

export interface CreatorEpisode extends Episode {
  comments_count?: number
  pages?: EpisodePage[]
  /** Diisi saat admin menolak episode — episode kembali ke draft & creator harus perbaiki. */
  rejection_reason?: string | null
}

export interface CreatorDashboard {
  comics_count: number
  published_comics_count: number
  episodes_count: number
  published_episodes_count: number
  total_views: number
  total_likes: number
  total_followers: number
  total_comments: number
  rating_avg: number
  earnings: { pending: number; paid: number; total: number; revenue_share?: RevenueShareSettings }
  reading_report?: {
    free_reads: number
    paid_reads: number
    total_coins_from_paid: number
    free_vs_paid_ratio: string
  }
  recent_episodes: Array<{
    id: number
    comic_id: number
    comic_title: string
    number: number
    title: string
    status: EpisodeStatus
    view_count: number
    published_at: string | null
  }>
  recent_comments: Array<{
    id: number
    comic_id: number
    comic_title: string
    content: string
    user: { id: number; name: string; username: string; avatar_url: string | null }
    created_at: string
  }>
}

export interface ComicAnalytics {
  comic: { id: number; title: string; slug: string; status: ComicStatus }
  summary: {
    views: number
    likes: number
    rating_avg: number
    rating_count: number
    followers: number
    bookmarks: number
    comments: number
    episodes: number
    published_episodes: number
    draft_episodes: number
    pending_episodes: number
  }
  episodes: Array<{
    id: number
    number: number
    title: string
    status: EpisodeStatus
    is_premium: boolean
    price_coin: number
    view_count: number
    like_count: number
    page_count: number
    comments_count: number
    published_at: string | null
  }>
}

/* ------------------------------------------------------------------ */
/* AI Assistant (Phase 11 — blueprint 27) — alat bantu menulis creator */
/* ------------------------------------------------------------------ */

export interface AiTitleResult {
  titles: string[]
}

export interface AiSynopsisResult {
  synopsis: string
}

export interface AiGenresTagsResult {
  genres: string[]
  tags: string[]
}

export interface AiCharacterResult {
  character: {
    name: string
    role: string
    personality: string
    traits: string[]
    backstory: string
  }
}

export interface AiOutlineResult {
  outline: Array<{
    number: number
    title: string
    summary: string
  }>
}

/* ------------------------------------------------------------------ */
/* Admin (Phase 09) — transaksi & withdrawal                           */
/* ------------------------------------------------------------------ */

export interface AdminTransaction extends Transaction {
  user: { id: number; name: string; username: string; email: string; avatar_url: string | null } | null
}

export interface AdminWithdrawal extends Withdrawal {
  creator: { id: number; name: string; username: string; email: string; avatar_url: string | null } | null
}

/* ------------------------------------------------------------------ */
/* Admin (Phase 08) — mirrors backend admin API resources              */
/* ------------------------------------------------------------------ */

export interface AdminUser extends User {
  comics_count: number
  is_premium: boolean
  premium_until: string | null
  is_vvip: boolean
  vvip_until: string | null
}

export interface AdminCreator {
  id: number
  name: string
  username: string
  email: string
  avatar_url: string | null
  display_name: string | null
  bio: string | null
  banner_url: string | null
  is_verified: boolean
  comics_count: number
  published_comics_count: number
  total_views: number
  created_at: string
}

export interface AdminComic {
  id: number
  title: string
  slug: string
  synopsis: string
  cover_url: string | null
  status: ComicStatus
  age_rating: ComicAgeRating
  verification_status: VerificationStatus
  rejection_reason: string | null
  rating_avg: number
  rating_count: number
  like_count: number
  view_count: number
  episode_count: number
  creator: { id: number; name: string | null }
  published_at: string | null
  created_at: string
}

export type CommentModerationStatus = 'active' | 'hidden'

export interface AdminComment {
  id: number
  content: string
  status: CommentModerationStatus
  like_count: number
  parent_id: number | null
  user: { id: number; name: string; avatar_url: string | null }
  comic: { id: number; title: string } | null
  episode: { id: number; number: number; title: string } | null
  created_at: string
}

/* ------------------------------------------------------------------ */
/* Riwayat Aktivitas (feature 13) — activity logs                      */
/* ------------------------------------------------------------------ */

export type ActivityLogAction =
  | 'comic_upload'
  | 'comic_verify'
  | 'comic_publish'
  | 'comic_block'
  | 'comic_ban'
  | 'episode_submit'
  | 'episode_publish'
  | 'episode_reject'
  | 'episode_delete'
  | 'coin_purchase'
  | 'episode_unlock'
  | 'subscription'
  | 'comic_download'
  | 'comment_moderate'
  | 'user_role'
  | 'user_ban'
  | 'user_unban'
  | 'user_permanent_ban'
  | 'creator_approve'

export interface ActivityLogItem {
  id: number
  action: ActivityLogAction | string
  description: string | null
  user: { id: number; name: string; username: string; avatar_url: string | null } | null
  subject_type: string | null
  subject_id: number | null
  metadata: Record<string, unknown> | null
  ip_address: string | null
  created_at: string | null
}

export interface ActivityLogListResponse {
  success: boolean
  message: string
  data: ActivityLogItem[]
  meta: PaginationMeta
  available_actions: string[]
}

export type ReportStatus = 'pending' | 'resolved' | 'dismissed'

export interface AdminReport {
  id: number
  reason: string
  description: string | null
  status: ReportStatus
  admin_note: string | null
  reporter: { id: number; name: string; username: string; avatar_url: string | null } | null
  reportable_type: string
  reportable_id: number
  reportable: { type: string; id: number; title: string } | null
  handled_by: { id: number; name: string } | null
  handled_at: string | null
  created_at: string
}

export interface DashboardStats {
  users: {
    total: number
    readers: number
    creators: number
    admins: number
    new_today: number
    new_week: number
  }
  comics: { total: number; published: number; draft: number }
  episodes: { total: number; published: number }
  comments: number
  reports: { pending: number }
  engagement: { total_views: number; total_likes: number }
  revenue: {
    total: number
    monthly: number
    total_unlocks: number
    coin_value: number
    creator_share: number
    admin_share: number
  }
  pending_verification: number
  activities: {
    total: number
    today: number
    last_7_days: number
    by_action: Array<{ action: string; count: number }>
    recent: Array<{
      id: number
      action: string
      description: string | null
      user_name: string | null
      created_at: string | null
    }>
  }
  recent_users: Array<{
    id: number
    name: string
    username: string
    email: string
    avatar_url: string | null
    role: Role
    created_at: string
  }>
  recent_comics: Array<{
    id: number
    title: string
    slug: string
    cover_url: string | null
    status: ComicStatus
    creator_name: string | null
    view_count: number
    like_count: number
    rating_avg: number
    created_at: string
  }>
  recent_reports: Array<{
    id: number
    reason: string
    status: ReportStatus
    reporter_name: string | null
    created_at: string
  }>
}
