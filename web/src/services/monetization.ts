import api from './api'
import type {
  CoinPackage,
  CreatorEarning,
  EarningsSummary,
  EpisodeUnlockRecord,
  PaginationMeta,
  Transaction,
  WalletSummary,
  Withdrawal,
} from '../types'

export const monetization = {
  /** Ringkasan dompet koin user yang login. */
  async wallet(): Promise<WalletSummary> {
    const { data } = await api.get<{ data: WalletSummary }>('/me/wallet')
    return data.data
  },

  /** Paket koin yang tersedia (publik). */
  async packages(): Promise<CoinPackage[]> {
    const { data } = await api.get<{ data: CoinPackage[] }>('/coin-packages')
    return data.data
  },

  /** Beli paket koin (MVP: pembayaran disimulasikan sukses). */
  async purchase(packageId: number): Promise<{ transaction: Transaction; balance: number }> {
    const { data } = await api.post<{ data: { transaction: Transaction; balance: number } }>(
      `/coin-packages/${packageId}/purchase`,
    )
    return data.data
  },

  /** Unlock episode premium dengan koin (idempotent). */
  async unlock(episodeId: number): Promise<{
    is_unlocked: boolean
    balance: number
    unlock: EpisodeUnlockRecord | null
  }> {
    const { data } = await api.post<{
      data: { is_unlocked: boolean; balance: number; unlock: EpisodeUnlockRecord | null }
    }>(`/episodes/${episodeId}/unlock`)
    return data.data
  },

  /** Riwayat transaksi user (terbaru dulu). */
  async transactions(page = 1): Promise<{ data: Transaction[]; meta: PaginationMeta }> {
    const { data } = await api.get<{ data: Transaction[]; meta: PaginationMeta }>('/me/transactions', {
      params: { page },
    })
    return data
  },

  /** Episode premium yang sudah di-unlock. */
  async unlocks(page = 1): Promise<{ data: EpisodeUnlockRecord[]; meta: PaginationMeta }> {
    const { data } = await api.get<{ data: EpisodeUnlockRecord[]; meta: PaginationMeta }>('/me/unlocks', {
      params: { page },
    })
    return data
  },

  /** Ringkasan pendapatan + riwayat earning creator. */
  async earnings(
    page = 1,
  ): Promise<{ summary: EarningsSummary; earnings: CreatorEarning[]; meta: PaginationMeta }> {
    const { data } = await api.get<{
      data: { summary: EarningsSummary; earnings: CreatorEarning[] }
      meta: PaginationMeta
    }>('/creator/earnings', { params: { page } })
    return { summary: data.data.summary, earnings: data.data.earnings, meta: data.meta }
  },

  /** Riwayat penarikan dana creator. */
  async withdrawals(page = 1): Promise<{ data: Withdrawal[]; meta: PaginationMeta }> {
    const { data } = await api.get<{ data: Withdrawal[]; meta: PaginationMeta }>('/creator/withdrawals', {
      params: { page },
    })
    return data
  },

  /** Ajukan penarikan dana (menunggu persetujuan admin). */
  async requestWithdrawal(payload: {
    amount: number
    bank_name: string
    bank_account: string
    bank_holder: string
  }): Promise<Withdrawal> {
    const { data } = await api.post<{ data: Withdrawal }>('/creator/withdrawals', payload)
    return data.data
  },

  /** Transfer saldo affiliate earnings ke dompet koin. */
  async transferToWallet(amount: number): Promise<{ coins_added: number; amount_deducted: number; balance: number }> {
    const { data } = await api.post<{ data: { coins_added: number; amount_deducted: number; balance: number } }>(
      '/creator/earnings/transfer-to-wallet',
      { amount },
    )
    return data.data
  },
}
