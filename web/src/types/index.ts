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
  email_verified_at: string | null
  is_email_verified: boolean
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

export type EpisodeStatus = 'draft' | 'published'

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
  user: { id: number; name: string; username: string | null; avatar_url: string | null }
  content: string
  like_count: number
  created_at: string
  replies?: Comment[]
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
  followers_count: number
  comments_count: number
  bookmarks_count: number
  episodes?: CreatorEpisode[]
}

export interface CreatorEpisode extends Episode {
  comments_count?: number
  pages?: EpisodePage[]
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
  earnings: { pending: number; paid: number; total: number }
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
