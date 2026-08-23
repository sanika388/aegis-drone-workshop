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

    // Call atomic PostgreSQL procedure
    const { data, error } = await supabase.rpc('register_student_atomic', {
      p_workshop_id: workshopId,
      p_full_name: fullName.trim(),
      p_email: email.trim().toLowerCase(),
      p_phone: phone.trim(),
      p_college: college.trim(),
      p_academic_year: academicYear || 'SE - Second Year',
    });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      bookingId: data.booking_id,
      assignedBatch: data.cohort_label,
      batchNumber: data.batch_number,
      fee: data.fee,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}