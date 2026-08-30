import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    // Webhook secret support with fallback to key secret
    const secretKey = (
      process.env.RAZORPAY_WEBHOOK_SECRET ||
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

    // 1. Verify webhook HMAC SHA256 Signature
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

      // Check if registration already exists
      const { data: existing } = await supabase
        .from('registrations')
        .select('id')
        .eq('razorpay_payment_id', payment.id)
        .maybeSingle();

      if (!existing) {
        const workshopId = notes.workshop_id || 'aegis-master-workshop';

        const { data: workshop } = await supabase
          .from('workshops')
          .select('*')
          .eq('id', workshopId)
          .maybeSingle();

        // Insert student record and fetch generated trigger details
        const { data: registration, error: dbError } = await supabase
          .from('registrations')
          .insert([
            {
              workshop_id: workshopId,
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
          ])
          .select('*')
          .single();

        if (dbError) {
          console.error('Supabase webhook auto-insert error:', dbError);
        } else if (registration) {
          // Send pass email backup in case client disconnected early
          try {
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aegis-drone-workshop.vercel.app';
            await fetch(`${appUrl}/api/send-confirmation`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: registration.email,
                name: registration.full_name,
                clearanceId: registration.clearance_id,
                workshopTitle: workshop?.title || 'Aegis Drone Avionics Master Workshop',
                amount: registration.amount_paid,
                venue: workshop?.venue || 'GCOERC Nashik',
                batchSchedule: workshop?.schedule_date || 'September Intake',
                paymentMethod: 'online',
              }),
            });
          } catch (mailErr) {
            console.warn('Webhook mail dispatch warning:', mailErr);
          }
        }
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (err: any) {
    console.error('Webhook processing error:', err);
    return NextResponse.json({ error: err.message || 'Processing failed' }, { status: 500 });
  }
}