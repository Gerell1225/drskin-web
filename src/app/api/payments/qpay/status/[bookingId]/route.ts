import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { checkQPayInvoice } from '@/lib/qpay';

type RouteContext = {
  params: Promise<{
    bookingId: string;
  }>;
};

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { bookingId } = await context.params;

    const { data: paymentRow, error } = await supabaseAdmin
      .from('qpay_payments')
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !paymentRow) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }

    let checkResponse = null;

    if (paymentRow.payment_status !== 'PAID') {
      try {
        checkResponse = await checkQPayInvoice(paymentRow.invoice_id);

        const paidRow = checkResponse?.rows?.find((row) => row.payment_status === 'PAID');

        if (paidRow) {
          await supabaseAdmin
            .from('qpay_payments')
            .update({
              status: 'PAID',
              payment_status: 'PAID',
              qpay_payment_id: paidRow.payment_id,
              raw_check_response: checkResponse,
              paid_at: new Date().toISOString(),
            })
            .eq('id', paymentRow.id);

          await supabaseAdmin
            .from('bookings')
            .update({
              payment_provider: 'qpay',
              payment_status: 'PAID',
              payment_invoice_id: paymentRow.invoice_id,
              payment_paid_at: new Date().toISOString(),
              status: 'confirmed',
            })
            .eq('id', bookingId);

          return NextResponse.json({
            success: true,
            paid: true,
            status: 'PAID',
            invoiceId: paymentRow.invoice_id,
            paymentId: paidRow.payment_id,
          });
        }
      } catch {
      }
    }

    return NextResponse.json({
      success: true,
      paid: paymentRow.payment_status === 'PAID',
      status: paymentRow.payment_status,
      invoiceId: paymentRow.invoice_id,
      qrImage: paymentRow.qr_image,
      qrText: paymentRow.qr_text,
      qPayShortUrl: paymentRow.qpay_short_url,
      qPayDeeplink: paymentRow.qpay_deeplink ?? [],
      qpayCheck: checkResponse,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Unexpected server error' },
      { status: 500 }
    );
  }
}