import api from './api'
import type { User } from '../types'

interface AuthResponse {
  success: boolean
  message: string
  data: {
    user: User
    token: string
    token_type: string
  }
}

const TOKEN_KEY = 'comika_token'
const USER_KEY = 'comika_user'

export const auth = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  },

  getStoredUser(): User | null {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    try {
      return JSON.parse(raw) as User
    } catch {
      return null
    }
  },

  async register(payload: {
    name: string
    username: string
    email: string
    password: string
    password_confirmation: string
  }): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/register', payload)
    this.setSession(data.data.token, data.data.user)
    return data
  },

  async login(payload: { email: string; password: string }): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', payload)
    this.setSession(data.data.token, data.data.user)
    return data
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout')
    } catch {
      // abaikan error jaringan — token tetap dibersihkan lokal
    }
    this.clearSession()
  },

  async me(): Promise<User> {
    const { data } = await api.get<{ data: User }>('/auth/me')
    localStorage.setItem(USER_KEY, JSON.stringify(data.data))
    return data.data
  },

  // ============ Email verification ============

  /** Kirim ulang link verifikasi email (harus login). */
  async sendVerificationEmail(): Promise<string> {
    const { data } = await api.post<{ message: string }>('/auth/email/verification-notification')
    return data.message
  },

  // ============ Password reset ============

  /** Kirim link reset password ke email. */
  async forgotPassword(email: string): Promise<string> {
    const { data } = await api.post<{ message: string }>('/auth/forgot-password', { email })
    return data.message
  },

  /** Reset password memakai token dari email. */
  async resetPassword(payload: {
    email: string
    token: string
    password: string
    password_confirmation: string
  }): Promise<string> {
    const { data } = await api.post<{ message: string }>('/auth/reset-password', payload)
    return data.message
  },

  /** Ganti password akun (butuh password saat ini). */
  async changePassword(payload: {
    current_password: string
    password: string
    password_confirmation: string
  }): Promise<string> {
    const { data } = await api.put<{ message: string }>('/auth/me/password', payload)
    return data.message
  },

  /** Ubah profil dasar: nama tampilan & avatar. */
  async updateProfile(payload: { name: string; avatar?: File | null }): Promise<User> {
    const form = new FormData()
    form.append('name', payload.name)
    if (payload.avatar) form.append('avatar', payload.avatar)

    const { data } = await api.put<{ data: User }>('/auth/me/profile', form)
    // Perbarui user tersimpan agar Navbar & halaman lain ikut sinkron
    const stored = this.getStoredUser()
    this.setSession(this.getToken() ?? '', { ...stored, ...data.data })
    return data.data
  },

  setSession(token: string, user: User): void {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    // Beri tahu komponen lain (Navbar, dll.) bahwa data user berubah
    window.dispatchEvent(new Event('comika:user'))
  },

  clearSession(): void {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },
}
