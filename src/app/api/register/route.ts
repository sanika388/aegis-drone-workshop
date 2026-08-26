import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { workshopId, fullName, email, phone, college, academicYear } = await req.json();

    if (!fullName || !email || !phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Fetch workshop details
    const { data: workshop } = await supabase
      .from('workshops')
      .select('*')
      .eq('id', workshopId || 'aegis-master-workshop')
      .single();

    const fee = workshop?.fee || 300;

    // 2. Insert record with explicit UUID fallback
    const { data: registration, error: dbError } = await supabase
      .from('registrations')
      .insert([
        {
          id: crypto.randomUUID(), // Explicit fallback UUID
          workshop_id: workshopId || 'aegis-master-workshop',
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          college: college?.trim() || '',
          academic_year: academicYear || 'SE - Second Year',
          payment_mode: 'cash',
          payment_status: 'pending',
          amount_paid: 0,
        },
      ])
      .select()
      .single();

    if (dbError) throw dbError;

    // 3. Dispatch confirmation pass
    const batchNum = Number(registration.batch?.replace(/\D/g, '') || 1);

    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/send-confirmation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: registration.email,
          name: registration.full_name,
          clearanceId: registration.clearance_id,
          workshopTitle: workshop?.title || 'Aegis Drone Avionics Master Workshop',
          amount: fee,
          venue: workshop?.venue || 'GCOERC Nashik',
          batchSchedule: workshop?.schedule_date || 'September Intake',
          paymentMethod: 'cash',
        }),
      });
    } catch (mailErr) {
      console.warn('Mail dispatch warning:', mailErr);
    }

    return NextResponse.json({
      success: true,
      bookingId: registration.clearance_id,
      assignedBatch: registration.batch,
      batchNumber: batchNum,
      fee,
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return NextResponse.json({ error: err.message || 'Registration failed' }, { status: 500 });
  }
}