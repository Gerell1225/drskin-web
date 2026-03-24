import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { buildQPayCallbackUrl, buildInvoiceReceiverCode, generateSenderInvoiceNo, normalizeAmount } from '@/lib/paymentHelpers';
import { createQPayInvoice, getQPayInvoiceCode } from '@/lib/qpay';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const bookingId = String(body.bookingId || '').trim();
    const customerId = body.customerId ? String(body.customerId) : null;
    const customerName = String(body.customerName || 'Customer').trim();
    const customerEmail = body.customerEmail ? String(body.customerEmail) : '';
    const customerPhone = body.customerPhone ? String(body.customerPhone) : '';
    const serviceName = body.serviceName ? String(body.serviceName) : 'Appointment';
    const branchCode = body.branchCode ? String(body.branchCode) : 'ONLINE';
    const amount = normalizeAmount(body.amount);

    if (!bookingId) {
      return NextResponse.json({ success: false, error: 'bookingId is required' }, { status: 400 });
    }

    const callbackUrl = buildQPayCallbackUrl();
    const senderInvoiceNo = generateSenderInvoiceNo(bookingId);
    const invoiceReceiverCode = buildInvoiceReceiverCode(customerId, bookingId);
    const invoiceDescription = `DrSkin booking ${bookingId} - ${serviceName}`;

    const qpayPayload = {
      invoice_code: getQPayInvoiceCode(),
      sender_invoice_no: senderInvoiceNo,
      invoice_receiver_code: invoiceReceiverCode,
      invoice_description: invoiceDescription,
      sender_branch_code: branchCode,
      amount,
      callback_url: callbackUrl,
      allow_partial: false,
      allow_exceed: false,
      invoice_receiver_data: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
      },
      lines: [
        {
          line_description: invoiceDescription,
          line_quantity: '1.00',
          line_unit_price: amount.toFixed(2),
          note: serviceName,
        },
      ],
    };

    const invoice = await createQPayInvoice(qpayPayload);

    const { error: insertError } = await supabaseAdmin
      .from('qpay_payments')
      .insert({
        booking_id: bookingId,
        customer_id: customerId,
        provider: 'qpay',
        status: 'INVOICE_CREATED',
        payment_status: 'NEW',
        sender_invoice_no: senderInvoiceNo,
        invoice_id: invoice.invoice_id,
        invoice_code: getQPayInvoiceCode(),
        amount,
        currency: 'MNT',
        invoice_description: invoiceDescription,
        callback_url: callbackUrl,
        qr_text: invoice.qr_text ?? null,
        qr_image: invoice.qr_image ?? null,
        qpay_short_url: invoice.qPay_shortUrl ?? null,
        qpay_deeplink: invoice.qPay_deeplink ?? null,
        raw_create_response: invoice,
      });

    if (insertError) {
      return NextResponse.json(
        { success: false, error: insertError.message },
        { status: 500 }
      );
    }

    const { error: bookingUpdateError } = await supabaseAdmin
      .from('bookings')
      .update({
        payment_provider: 'qpay',
        payment_status: 'PENDING',
        payment_amount: amount,
        payment_invoice_id: invoice.invoice_id,
        status: 'awaiting_payment',
      })
      .eq('id', bookingId);

    if (bookingUpdateError) {
      return NextResponse.json(
        { success: false, error: bookingUpdateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      bookingId,
      invoiceId: invoice.invoice_id,
      senderInvoiceNo,
      qrText: invoice.qr_text ?? null,
      qrImage: invoice.qr_image ?? null,
      qPayShortUrl: invoice.qPay_shortUrl ?? null,
      qPayDeeplink: invoice.qPay_deeplink ?? [],
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Unexpected server error',
      },
      { status: 500 }
    );
  }
}