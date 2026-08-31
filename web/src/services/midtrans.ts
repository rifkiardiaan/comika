import api from './api'

// Midtrans Snap JS types
declare global {
  interface Window {
    snap?: {
      pay: (token: string, options: SnapPayOptions) => void
      hide: () => void
      show: () => void
    }
  }
}

interface SnapPayOptions {
  onSuccess?: (result: SnapResult) => void
  onPending?: (result: SnapResult) => void
  onError?: (result: SnapResult) => void
  onClose?: () => void
}

interface SnapResult {
  order_id: string
  status_code: string
  status_message: string
  transaction_id: string
  transaction_status: string
  fraud_status: string
  payment_type: string
  gross_amount: string
}

export interface SnapTokenResponse {
  snap_token: string
  redirect_url: string
  order_id: string
  transaction_id?: number
  subscription_id?: number
  days_added?: number
}

/**
 * Load Midtrans Snap JS SDK.
 */
export function loadSnapSdk(clientKey: string, isProduction = false): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.snap) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = isProduction
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js'
    script.setAttribute('data-client-key', clientKey)
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Gagal memuat Midtrans Snap SDK'))
    document.head.appendChild(script)
  })
}

/**
 * Open Midtrans Snap payment popup.
 */
export function openSnapPayment(
  snapToken: string,
  options: {
    onSuccess?: (result: SnapResult) => void
    onPending?: (result: SnapResult) => void
    onError?: (result: SnapResult) => void
    onClose?: () => void
  },
): void {
  if (!window.snap) {
    throw new Error('Midtrans Snap SDK belum dimuat')
  }

  window.snap.pay(snapToken, {
    onSuccess: options.onSuccess,
    onPending: options.onPending,
    onError: options.onError,
    onClose: options.onClose,
  })
}

/**
 * Midtrans payment API calls.
 */
export const midtrans = {
  /** Get Snap Token for coin package purchase. */
  async getCoinPackageSnapToken(packageId: number): Promise<SnapTokenResponse> {
    const { data } = await api.post<{ data: SnapTokenResponse }>(
      `/coin-packages/${packageId}/purchase`,
    )
    return data.data
  },

  /** Get Snap Token for subscription. */
  async getSubscriptionSnapToken(plan: string): Promise<SnapTokenResponse> {
    const { data } = await api.post<{ data: SnapTokenResponse }>(
      '/subscription/subscribe',
      { plan },
    )
    return data.data
  },

  /** Check payment status. */
  async getPaymentStatus(orderId: string): Promise<{
    order_id: string
    transaction_status: string
    payment_type: string
  }> {
    const { data } = await api.get<{ data: { order_id: string; transaction_status: string; payment_type: string } }>(
      `/midtrans/status/${orderId}`,
    )
    return data.data
  },
}
