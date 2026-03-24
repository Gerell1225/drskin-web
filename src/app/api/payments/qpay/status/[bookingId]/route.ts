import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { checkQPayInvoice } from '@/lib/qpay';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const bookingId = url.searchParams.get('bookingId');

    if (!bookingId) {
      return NextResponse.json(
        { success: false, message: 'bookingId is required' },
        { status: 400 },
      );
    }

    const { data: paymentRow, error } = await supabaseAdmin
      .from('qpay_payments')
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !paymentRow) {
      return NextResponse.json(
        { success: false, message: 'Payment not found' },
        { status: 404 },
      );
    }

    if (paymentRow.payment_status === 'PAID') {
      return NextResponse.json({
        success: true,
        paid: true,
        status: 'PAID',
        bookingId,
        invoiceId: paymentRow.invoice_id,
        paymentId: paymentRow.qpay_payment_id,
      });
    }

    let checkResponse: any = null;

    try {
      checkResponse = await checkQPayInvoice(paymentRow.invoice_id);
      const paidRow = (checkResponse?.rows || []).find(
        (row: any) => row.payment_status === 'PAID',
      );

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
            status: 'confirmed',
            payment_status: 'PAID',
            payment_provider: 'qpay',
            payment_invoice_id: paymentRow.invoice_id,
            payment_paid_at: new Date().toISOString(),
          })
          .eq('id', bookingId);

        return NextResponse.json({
          success: true,
          paid: true,
          status: 'PAID',
          bookingId,
          invoiceId: paymentRow.invoice_id,
          paymentId: paidRow.payment_id,
        });
      }
    } catch {
    }

    return NextResponse.json({
      success: true,
      paid: false,
      status: paymentRow.payment_status || 'NEW',
      bookingId,
      invoiceId: paymentRow.invoice_id,
      qrImage: paymentRow.qr_image,
      qrText: paymentRow.qr_text,
      qPayShortUrl: paymentRow.qpay_short_url,
      qPayDeeplink: paymentRow.qpay_deeplink || [],
      checkResponse,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Unexpected server error',
      },
      { status: 500 },
    );
  }
}