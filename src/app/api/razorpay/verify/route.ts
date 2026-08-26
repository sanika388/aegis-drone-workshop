import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, registrationData } = await req.json();

    // 1. Verify Razorpay Signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // 2. Fetch workshop data
    const { data: workshop } = await supabase
      .from('workshops')
      .select('*')
      .eq('id', registrationData.workshop_id || 'aegis-master-workshop')
      .single();

    // 3. Save to Supabase
    const { data: inserted, error: dbError } = await supabase
      .from('registrations')
      .insert([
        {
          id: crypto.randomUUID(),
          workshop_id: registrationData.workshop_id || 'aegis-master-workshop',
          full_name: registrationData.full_name.trim(),
          email: registrationData.email.trim().toLowerCase(),
          phone: registrationData.phone.trim(),
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

    if (dbError) throw dbError;

    // 4. Query the re-indexed record for calculated clearance_id & batch
    const { data: registration, error: fetchError } = await supabase
      .from('registrations')
      .select('*')
      .eq('id', inserted.id)
      .single();

    if (fetchError || !registration) throw (fetchError || new Error('Failed to retrieve registration pass'));

    // 5. Dispatch Email with QR
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/send-confirmation`, {
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
      assignedBatch: registration.batch,
    });
  } catch (err: any) {
    console.error('Verify error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}