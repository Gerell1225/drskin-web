import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getQPayPayment } from '@/lib/qpay';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const qpayPaymentId = url.searchParams.get('qpay_payment_id');

  if (!qpayPaymentId) {
    return new NextResponse('SUCCESS', { status: 200 });
  }

  try {
    const payment = await getQPayPayment(qpayPaymentId);
    const invoiceId = payment.object_id;

    if (!invoiceId) {
      return new NextResponse('SUCCESS', { status: 200 });
    }

    const { data: paymentRow } = await supabaseAdmin
      .from('qpay_payments')
      .select('*')
      .eq('invoice_id', invoiceId)
      .maybeSingle();

    if (!paymentRow) {
      return new NextResponse('SUCCESS', { status: 200 });
    }

    const paymentStatus = payment.payment_status || 'NEW';

    await supabaseAdmin
      .from('qpay_payments')
      .update({
        status: paymentStatus === 'PAID' ? 'PAID' : 'UPDATED',
        payment_status: paymentStatus,
        qpay_payment_id: payment.payment_id,
        paid_at:
          paymentStatus === 'PAID'
            ? payment.payment_date || new Date().toISOString()
            : null,
        raw_payment_response: payment,
        raw_callback_query: Object.fromEntries(url.searchParams.entries()),
      })
      .eq('id', paymentRow.id);

    if (paymentStatus === 'PAID') {
      await supabaseAdmin
        .from('bookings')
        .update({
          status: 'confirmed',
          payment_status: 'PAID',
          payment_provider: 'qpay',
          payment_invoice_id: invoiceId,
          payment_paid_at: payment.payment_date || new Date().toISOString(),
        })
        .eq('id', paymentRow.booking_id);
    } else if (paymentStatus === 'FAILED') {
      await supabaseAdmin
        .from('bookings')
        .update({
          payment_status: 'FAILED',
        })
        .eq('id', paymentRow.booking_id);
    }

    return new NextResponse('SUCCESS', { status: 200 });
  } catch {
    return new NextResponse('SUCCESS', { status: 200 });
  }
}