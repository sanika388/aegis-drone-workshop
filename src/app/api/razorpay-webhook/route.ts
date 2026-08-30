import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    // Single source of truth for the secret key
    const secretKey = (
      process.env.RAZORPAY_KEY_SECRET ||
      process.env.RAZORPAY_SECRET ||
      'cFwMi64v17YUQgb34zgxy02D'
    ).trim();

    if (!secretKey || !signature) {
      console.error('Missing key secret or incoming signature header');
      return NextResponse.json(
        { error: 'Server secret key missing or signature unprovided' },
        { status: 400 }
      );
    }

    // 1. Verify webhook HMAC SHA256 Signature using the same Key Secret
    const expectedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.error('Webhook signature mismatch', {
        expected: expectedSignature,
        received: signature,
      });
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);

    // 2. Process captured payment / paid order
    if (payload.event === 'payment.captured' || payload.event === 'order.paid') {
      const payment = payload.payload.payment.entity;
      const notes = payment.notes || {};

      // Check if registration already exists in Supabase
      const { data: existing } = await supabase
        .from('registrations')
        .select('id')
        .eq('razorpay_payment_id', payment.id)
        .maybeSingle();

      if (!existing) {
        // Insert student record directly into Supabase
        const { error: dbError } = await supabase.from('registrations').insert([
          {
            workshop_id: notes.workshop_id || 'aegis-master-workshop',
            full_name: notes.full_name || payment.description || 'Workshop Attendee',
            email: (payment.email || notes.email || '').trim().toLowerCase(),
            phone: payment.contact || notes.phone || '',
            college: notes.college || '',
            academic_year: notes.academic_year || 'SE - Second Year',
            payment_mode: 'online',
            payment_status: 'paid',
            amount_paid: payment.amount ? payment.amount / 100 : 300,
            razorpay_payment_id: payment.id,
            razorpay_order_id: payment.order_id,
            is_deleted: false,
          },
        ]);

        if (dbError) {
          console.error('Supabase auto-insert error:', dbError);
        }
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (err: any) {
    console.error('Webhook processing error:', err);
    return NextResponse.json({ error: err.message || 'Processing failed' }, { status: 500 });
  }
}