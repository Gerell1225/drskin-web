export function buildQPayCallbackUrl() {
  const appBaseUrl = process.env.APP_BASE_URL!;
  const callbackPath =
    process.env.QPAY_CALLBACK_PATH || '/api/payments/qpay/callback';

  if (!appBaseUrl) {
    throw new Error('Missing APP_BASE_URL');
  }

  return `${appBaseUrl}${callbackPath}`;
}

export function generateSenderInvoiceNo(bookingId: string) {
  const cleanBookingId = bookingId.replace(/[^a-zA-Z0-9]/g, '');
  return `BOOK${cleanBookingId}${Date.now()}`;
}

export function normalizeAmount(value: unknown) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Invalid amount');
  }
  return Number(amount.toFixed(2));
}

export function normalizePeopleCount(value: unknown) {
  const count = Number(value);
  if (!Number.isFinite(count) || count < 1) return 1;
  if (count > 6) return 6;
  return Math.floor(count);
}

export function buildInvoiceReceiverCode(customerId?: string | null, bookingId?: string | null) {
  const raw = customerId || bookingId || `guest-${Date.now()}`;
  return raw.replace(/[^a-zA-Z0-9]/g, '').slice(0, 45);
}

export function hhmmToMinutes(time: string) {
  const [h, m] = time.split(':').map((x) => parseInt(x || '0', 10));
  return h * 60 + m;
}

export function isValidTimeSlot(time: string) {
  const valid: string[] = [];
  for (let hour = 11; hour <= 19; hour++) {
    const h = hour.toString().padStart(2, '0');
    valid.push(`${h}:00`);
    if (hour !== 19) valid.push(`${h}:30`);
  }
  return valid.includes(time);
}