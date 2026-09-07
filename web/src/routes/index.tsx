import { createBrowserRouter } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import AdminLayout from '../components/admin/AdminLayout'
import AdminGuard from '../components/admin/AdminGuard'
import HomePage from '../pages/HomePage'
import DiscoverPage from '../pages/DiscoverPage'
import SearchPage from '../pages/SearchPage'
import ComicDetailPage from '../pages/ComicDetailPage'
import CreatorPublicPage from '../pages/CreatorPublicPage'
import EpisodeReaderPage from '../pages/EpisodeReaderPage'
import LibraryPage from '../pages/LibraryPage'
import HistoryPage from '../pages/HistoryPage'
import GamificationPage from '../pages/GamificationPage'
import NotificationsPage from '../pages/NotificationsPage'
import ProfilePage from '../pages/ProfilePage'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import ForgotPasswordPage from '../pages/ForgotPasswordPage'
import ResetPasswordPage from '../pages/ResetPasswordPage'
import WalletPage from '../pages/WalletPage'
import CreatorEarningsPage from '../pages/CreatorEarningsPage'
import CreatorDashboardPage from '../pages/creator/CreatorDashboardPage'
import CreatorComicsPage from '../pages/creator/CreatorComicsPage'
import CreatorComicDetailPage from '../pages/creator/CreatorComicDetailPage'
import CreatorAnalyticsPage from '../pages/creator/CreatorAnalyticsPage'
import ComingSoonPage from '../pages/ComingSoonPage'
import BantuanPage from '../pages/BantuanPage'
import KomunitasPage from '../pages/KomunitasPage'
import BecomeCreatorPage from '../pages/BecomeCreatorPage'
import PremiumPage from '../pages/PremiumPage'
import DownloadPage from '../pages/DownloadPage'
import KomikOfflinePage from '../pages/KomikOfflinePage'
import PublicUserProfilePage from '../pages/PublicUserProfilePage'
import AdminDashboardPage from '../pages/admin/AdminDashboardPage'
import AdminUsersPage from '../pages/admin/AdminUsersPage'
import AdminCreatorsPage from '../pages/admin/AdminCreatorsPage'
import AdminComicsPage from '../pages/admin/AdminComicsPage'
import AdminEpisodesPage from '../pages/admin/AdminEpisodesPage'
import AdminReadingReportPage from '../pages/admin/AdminReadingReportPage'
import AdminCommentsPage from '../pages/admin/AdminCommentsPage'
import AdminReportsPage from '../pages/admin/AdminReportsPage'
import AdminGenresPage from '../pages/admin/AdminGenresPage'
import AdminTransactionsPage from '../pages/admin/AdminTransactionsPage'
import AdminCreatorApplicationsPage from '../pages/admin/AdminCreatorApplicationsPage'
import AdminActivityLogPage from '../pages/admin/AdminActivityLogPage'
import AdminVvipPage from '../pages/admin/AdminVvipPage'
import AdminRevenuePage from '../pages/admin/AdminRevenuePage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'discover', element: <DiscoverPage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'comic/:id', element: <ComicDetailPage /> },
      { path: 'comic/:id/episode/:episodeId', element: <EpisodeReaderPage /> },
      { path: 'creators/:id', element: <CreatorPublicPage /> },
      { path: 'library', element: <LibraryPage /> },
      { path: 'history', element: <HistoryPage /> },
      { path: 'gamification', element: <GamificationPage /> },
      { path: 'notifications', element: <NotificationsPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'wallet', element: <WalletPage /> },
      { path: 'creator', element: <CreatorDashboardPage /> },
      { path: 'creator/comics', element: <CreatorComicsPage /> },
      { path: 'creator/comics/:id', element: <CreatorComicDetailPage /> },
      { path: 'creator/comics/:id/analytics', element: <CreatorAnalyticsPage /> },
      { path: 'creator/earnings', element: <CreatorEarningsPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },
      { path: 'bantuan', element: <BantuanPage /> },
      { path: 'komunitas', element: <KomunitasPage /> },
      { path: 'become-creator', element: <BecomeCreatorPage /> },
      { path: 'premium', element: <PremiumPage /> },
      { path: 'download', element: <DownloadPage /> },
      { path: 'komik-offline', element: <KomikOfflinePage /> },
      { path: 'user/:id', element: <PublicUserProfilePage /> },
      { path: '*', element: <ComingSoonPage title="Halaman Tidak Ditemukan" /> },
    ],
  },
  {
    path: '/admin',
    element: (
      <AdminGuard>
        <AdminLayout />
      </AdminGuard>
    ),
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'users', element: <AdminUsersPage /> },
      { path: 'creators', element: <AdminCreatorsPage /> },
      { path: 'comics', element: <AdminComicsPage /> },
      { path: 'reading', element: <AdminReadingReportPage /> },
      { path: 'comics/:comicId/episodes', element: <AdminEpisodesPage /> },
      { path: 'comments', element: <AdminCommentsPage /> },
      { path: 'reports', element: <AdminReportsPage /> },
      { path: 'genres', element: <AdminGenresPage /> },
      { path: 'transactions', element: <AdminTransactionsPage /> },
      { path: 'activities', element: <AdminActivityLogPage /> },
      { path: 'revenue', element: <AdminRevenuePage /> },
      { path: 'vvip', element: <AdminVvipPage /> },
      { path: 'creator-applications', element: <AdminCreatorApplicationsPage /> },
    ],
  },
])
