/**
 * RealProxy Payment Gateway API Client
 * Connects directly to the dedicated payment engine (pay.realhostbd.com / real-payment-api)
 */

export interface CreatePaymentSessionParams {
  sourceApp?: string;
  userId: number;
  amount: number;
  currency?: string;
  gatewayProvider?: string;
  customerEmail: string;
  customerPhone?: string;
  customerName?: string;
  callbackUrl: string;
  itemCategory?: string;
  externalReference?: string;
}

export interface PaymentSessionResult {
  success: boolean;
  invoiceNumber?: string;
  paymentUrl?: string;
  hostedInvoiceUrl?: string;
  message?: string;
  errorCode?: string;
}

export interface PaymentStatusResult {
  success: boolean;
  invoiceNumber: string;
  status: 'Pending' | 'Paid' | 'SUCCESS' | 'FAILED' | 'EXPIRED' | string;
  amount: number;
  currency: string;
  gatewayTrxId?: string;
  paymentMethod?: string;
  paidAt?: string;
  failureReason?: string;
  callbackUrl?: string;
}

export const PAYMENT_API_BASE_URL =
  process.env.NEXT_PUBLIC_PAYMENT_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:5182'
    : 'https://pay.realhostbd.com');

/**
 * Extracts userId and email from JWT auth_token stored in localStorage
 */
export function getUserFromToken(): { userId: number; email: string } | null {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('auth_token');
  if (!token) return null;

  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    const userId = Number(payload.nameid || payload.sub || payload.userId || 1);
    const email = payload.email || localStorage.getItem('user_email') || '';
    return { userId, email };
  } catch (err) {
    console.error('Failed to parse JWT token:', err);
    return null;
  }
}

/**
 * Initializes a secure payment session with the payment engine
 */
export async function createPaymentSession(
  params: CreatePaymentSessionParams
): Promise<PaymentSessionResult> {
  const payload = {
    sourceApp: params.sourceApp || 'REALPROXY',
    userId: params.userId,
    amount: params.amount,
    currency: params.currency || 'BDT',
    gatewayProvider: params.gatewayProvider || 'PayStation',
    customerEmail: params.customerEmail,
    customerPhone: params.customerPhone || '01700000000',
    customerName: params.customerName || 'RealProxy Valued Customer',
    callbackUrl: params.callbackUrl,
    itemCategory: params.itemCategory || 'WalletTopup',
    externalReference: params.externalReference || '',
  };

  try {
    const res = await fetch(`${PAYMENT_API_BASE_URL}/api/v1/payment/create-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        message: data.message || `Payment session error (${res.status})`,
        errorCode: data.errorCode || 'HTTP_ERROR',
      };
    }

    return data as PaymentSessionResult;
  } catch (err: any) {
    console.error('Failed to communicate with payment API:', err);
    return {
      success: false,
      message: err?.message || 'Could not connect to payment gateway server.',
      errorCode: 'NETWORK_ERROR',
    };
  }
}

/**
 * Fetches real-time status and settlement info of an invoice
 */
export async function getPaymentStatus(
  invoiceNumber: string
): Promise<PaymentStatusResult | null> {
  try {
    const res = await fetch(
      `${PAYMENT_API_BASE_URL}/api/v1/payment/status/${encodeURIComponent(invoiceNumber)}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data as PaymentStatusResult;
  } catch (err) {
    console.error('Failed to get payment status:', err);
    return null;
  }
}
