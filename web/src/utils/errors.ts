export interface ApiErrorData {
  message?: string
  errors?: Record<string, string[]>
}

/** Ekstrak pesan error dari AxiosError ke bentuk yang aman untuk ditampilkan. */
export function getApiErrorMessage(err: unknown, fallback = 'Terjadi kesalahan. Coba lagi.'): string {
  const anyErr = err as { response?: { data?: ApiErrorData }; message?: string }
  const message = anyErr.response?.data?.message ?? anyErr.message ?? fallback
  // Untuk error validasi (422), tampilkan pesan field pertama (lebih informatif).
  const errors = anyErr.response?.data?.errors
  if (errors && Object.keys(errors).length > 0) {
    const first = Object.values(errors).flat()[0]
    if (first) return first
  }
  return message
}
