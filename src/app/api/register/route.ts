import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

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
      .maybeSingle();

    const fee = Number(workshop?.fee ?? 300);

    // 2. Insert record and fetch generated trigger data in one query
    const { data: registration, error: dbError } = await supabase
      .from('registrations')
      .insert([
        {
          id: crypto.randomUUID(),
          workshop_id: workshopId || 'aegis-master-workshop',
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          college: college?.trim() || '',
          academic_year: academicYear || 'SE - Second Year',
          payment_mode: 'cash',
          payment_status: 'pending',
          amount_paid: 0,
          is_deleted: false,
        },
      ])
      .select('*')
      .single();

    if (dbError || !registration) {
      console.error('Registration Insert Error:', dbError);
      throw dbError || new Error('Failed to record cash reservation');
    }

    const assignedBatch = registration.batch || registration.assigned_batch || 'Batch 1';
    const batchNum = Number(assignedBatch.replace(/\D/g, '') || 1);

    // 3. Dispatch confirmation pass email
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
  amount: fee,
  venue: workshop?.venue || 'GCOERC Nashik',
  batchSchedule: workshop?.schedule_date || 'September Intake',
  paymentMethod: 'cash',
  workshopId: workshopId || 'aegis-master-workshop',
  assignedBatch: registration.batch || registration.assigned_batch || 'Batch 1',
  batchNumber: Number((registration.batch || registration.assigned_batch || '1').replace(/\D/g, '')),
}),
      });
    } catch (mailErr) {
      console.warn('Mail dispatch warning:', mailErr);
    }

    return NextResponse.json({
      success: true,
      bookingId: registration.clearance_id,
      assignedBatch,
      batchNumber: batchNum,
      fee,
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return NextResponse.json({ error: err.message || 'Registration failed' }, { status: 500 });
  }
}