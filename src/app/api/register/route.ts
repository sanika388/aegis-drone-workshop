import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { workshopId, fullName, email, phone, college, academicYear } = body;

    if (!workshopId || !fullName || !email || !phone) {
      return NextResponse.json({ error: 'Missing required attendee fields' }, { status: 400 });
    }

    // 1. Fetch workshop rules & batch capacity size
    const { data: workshop, error: workshopError } = await supabase
      .from('workshops')
      .select('*')
      .eq('id', workshopId)
      .single();

    if (workshopError || !workshop) {
      return NextResponse.json({ error: 'Workshop track not found' }, { status: 404 });
    }

    if (workshop.status === 'completed') {
      return NextResponse.json({ error: 'This workshop has concluded.' }, { status: 400 });
    }

    // 2. Count total registered attendees for this core workshop
    const { count, error: countError } = await supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true })
      .eq('workshop_id', workshopId);

    if (countError) throw countError;

    const totalCurrentStudents = count || 0;
    const batchCapacity = workshop.batch_size_limit || workshop.max_capacity || 20;

    // 3. Auto Calculate Batch Number (1-20 -> Batch 1, 21-40 -> Batch 2, etc.)
    const assignedBatchNum = Math.floor(totalCurrentStudents / batchCapacity) + 1;
    const cohortLabel = `Batch ${assignedBatchNum}`;

    // 4. Generate unique Booking ID
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const bookingId = `AEGIS-B${assignedBatchNum}-${randomSuffix}`;

    // 5. Insert registration with auto-assigned batch
    const { data: registration, error: regError } = await supabase
      .from('registrations')
      .insert([
        {
          id: bookingId,
          workshop_id: workshopId,
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          college: college.trim(),
          academic_year: academicYear || 'SE - Second Year',
          amount_paid: workshop.fee,
          payment_status: 'pending',
          email_sent: false,
          batch_number: assignedBatchNum,
          cohort_label: cohortLabel,
        },
      ])
      .select()
      .single();

    if (regError) throw regError;

    return NextResponse.json({
      success: true,
      registration,
      assignedBatch: cohortLabel,
      bookingId,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}