type QPayTokenResponse = {
  token_type: string;
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
};

type QPayCreateInvoicePayload = {
  invoice_code: string;
  sender_invoice_no: string;
  invoice_receiver_code: string;
  invoice_description: string;
  sender_branch_code?: string;
  sender_staff_code?: string;
  amount: number;
  callback_url: string;
  allow_partial?: boolean;
  allow_exceed?: boolean;
  note?: string | null;
  invoice_receiver_data?: {
    register?: string;
    name?: string;
    email?: string;
    phone?: string;
  };
  lines?: Array<{
    line_description: string;
    line_quantity: string;
    line_unit_price: string;
    note?: string;
  }>;
};

type QPayCreateInvoiceResponse = {
  invoice_id: string;
  qr_text?: string;
  qr_image?: string;
  qPay_shortUrl?: string;
  qPay_deeplink?: Array<{
    name: string;
    description: string;
    logo: string;
    link: string;
  }>;
};

type QPayPaymentCheckResponse = {
  count?: number;
  paid_amount?: number;
  rows?: Array<{
    payment_id: string;
    payment_status: 'NEW' | 'FAILED' | 'PAID' | 'PARTIAL' | 'REFUNDED';
    payment_amount: number;
    payment_currency?: string;
    payment_wallet?: string;
    payment_type?: string;
  }>;
};

type QPayPaymentResponse = {
  payment_id: string;
  payment_status: 'NEW' | 'FAILED' | 'PAID' | 'PARTIAL' | 'REFUNDED';
  payment_amount: number;
  payment_fee?: number;
  payment_currency?: string;
  payment_date?: string;
  payment_wallet?: string;
  transaction_type?: string;
  object_type?: string;
  object_id?: string;
};

const baseUrl = process.env.QPAY_BASE_URL!;
const clientId = process.env.QPAY_CLIENT_ID!;
const clientSecret = process.env.QPAY_CLIENT_SECRET!;
const invoiceCode = process.env.QPAY_INVOICE_CODE!;

if (!baseUrl || !clientId || !clientSecret || !invoiceCode) {
  throw new Error('Missing QPay environment variables');
}

let cachedAccessToken: string | null = null;
let cachedTokenExpiresAt = 0;

function getBasicAuthHeader() {
  return (
    'Basic ' +
    Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  );
}

export function getQPayInvoiceCode() {
  return invoiceCode;
}

export async function getQPayAccessToken() {
  const now = Date.now();

  if (cachedAccessToken && now < cachedTokenExpiresAt) {
    return cachedAccessToken;
  }

  const res = await fetch(`${baseUrl}/v2/auth/token`, {
    method: 'POST',
    headers: {
      Authorization: getBasicAuthHeader(),
    },
    cache: 'no-store',
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(`QPay token failed: ${res.status} ${text}`);
  }

  const data = JSON.parse(text) as QPayTokenResponse;

  if (!data.access_token) {
    throw new Error('QPay token response missing access_token');
  }

  cachedAccessToken = data.access_token;

  const expiresInSeconds = Number(data.expires_in || 3600);
  cachedTokenExpiresAt = Date.now() + Math.max(60_000, (expiresInSeconds - 120) * 1000);

  return cachedAccessToken;
}

export async function createQPayInvoice(payload: QPayCreateInvoicePayload) {
  const accessToken = await getQPayAccessToken();

  const res = await fetch(`${baseUrl}/v2/invoice`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(`QPay invoice create failed: ${res.status} ${text}`);
  }

  return JSON.parse(text) as QPayCreateInvoiceResponse;
}

export async function checkQPayInvoice(invoiceId: string) {
  const accessToken = await getQPayAccessToken();

  const res = await fetch(`${baseUrl}/v2/payment/check`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      object_type: 'INVOICE',
      object_id: invoiceId,
      offset: {
        page_number: 1,
        page_limit: 100,
      },
    }),
    cache: 'no-store',
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(`QPay payment check failed: ${res.status} ${text}`);
  }

  return JSON.parse(text) as QPayPaymentCheckResponse;
}

export async function getQPayPayment(paymentId: string) {
  const accessToken = await getQPayAccessToken();

  const res = await fetch(`${baseUrl}/v2/payment/${paymentId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(`QPay payment get failed: ${res.status} ${text}`);
  }

  return JSON.parse(text) as QPayPaymentResponse;
}