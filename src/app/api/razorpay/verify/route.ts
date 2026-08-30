import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, registrationData } = await req.json();

    // 1. Get the Live Key Secret
    const keySecret = (
      process.env.RAZORPAY_KEY_SECRET ||
      process.env.RAZORPAY_SECRET ||
      'cFwMi64v17YUQgb34zgxy02D' // Put your live secret here as fallback
    ).trim();

    if (!keySecret) {
      return NextResponse.json(
        { error: 'Server secret key missing for verification' },
        { status: 500 }
      );
    }

    // 2. Validate Order ID & Payment ID presence
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.error('Missing Razorpay verification payload:', {
        razorpay_order_id,
        razorpay_payment_id,
        hasSignature: !!razorpay_signature,
      });
      return NextResponse.json(
        { error: 'Incomplete payment response payload from gateway' },
        { status: 400 }
      );
    }

    // 3. Verify Razorpay HMAC SHA256 Signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.error('Signature Mismatch:', {
        expected: expectedSignature,
        received: razorpay_signature,
        payloadHashed: body,
      });
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // 4. Fetch workshop data
    const { data: workshop } = await supabase
      .from('workshops')
      .select('*')
      .eq('id', registrationData?.workshop_id || 'aegis-master-workshop')
      .maybeSingle();

    // 5. Save to Supabase
    const { data: inserted, error: dbError } = await supabase
      .from('registrations')
      .insert([
        {
          id: crypto.randomUUID(),
          workshop_id: registrationData?.workshop_id || 'aegis-master-workshop',
          full_name: registrationData.full_name?.trim(),
          email: registrationData.email?.trim().toLowerCase(),
          phone: registrationData.phone?.trim(),
          college: registrationData.college?.trim() || '',
          academic_year: registrationData.academic_year || 'SE - Second Year',
          payment_mode: 'online',
          payment_status: 'paid',
          amount_paid: registrationData.amount_paid || workshop?.fee || 300,
          razorpay_payment_id,
          razorpay_order_id,
          is_deleted: false,
        },
      ])
      .select('id')
      .single();

    if (dbError) {
      console.error('Supabase DB Insert Error:', dbError);
      throw dbError;
    }

    // 6. Query the record for clearance_id & batch
    const { data: registration, error: fetchError } = await supabase
      .from('registrations')
      .select('*')
      .eq('id', inserted.id)
      .single();

    if (fetchError || !registration) {
      throw fetchError || new Error('Failed to retrieve registration pass');
    }

    // 7. Dispatch Email with QR
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
      console.warn('Mail dispatch warning:', mailErr);
    }

    return NextResponse.json({
      success: true,
      clearanceId: registration.clearance_id,
      assignedBatch: registration.batch || registration.assigned_batch || 'Batch 1',
    });
  } catch (err: any) {
    console.error('Verify error:', err);
    return NextResponse.json({ error: err?.message || 'Verification failed' }, { status: 500 });
  }
}