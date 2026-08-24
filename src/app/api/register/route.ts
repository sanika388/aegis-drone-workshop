import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { workshopId, fullName, email, phone, college, academicYear } = body;

    const cleanWorkshopId = workshopId || 'aegis-master-workshop';
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanFullName = (fullName || '').trim();
    const cleanPhone = (phone || '').trim();
    const cleanCollege = (college || '').trim();
    const cleanYear = academicYear || 'SE - Second Year';

    if (!cleanFullName || !cleanEmail || !cleanPhone) {
      return NextResponse.json(
        { error: 'Missing required attendee fields (Name, Email, Phone).' },
        { status: 400 }
      );
    }

    // 1. Check if attendee is already registered to prevent duplicate IDs on network stutter
    const { data: existingReg, error: checkError } = await supabase
      .from('registrations')
      .select('*')
      .eq('workshop_id', cleanWorkshopId)
      .eq('email', cleanEmail)
      .maybeSingle();

    if (checkError) {
      console.warn('Existing registration lookup warning:', checkError.message);
    }

    if (existingReg) {
      return NextResponse.json({
        success: true,
        bookingId: existingReg.id,
        assignedBatch: existingReg.cohort_label || `Batch ${existingReg.batch_number || 1}`,
        batchNumber: existingReg.batch_number || 1,
        fee: existingReg.amount_paid || 300,
        alreadyRegistered: true,
      });
    }

    // 2. Execute Atomic SQL Sequential Procedure in Supabase
    const { data, error: rpcError } = await supabase.rpc('register_student_atomic', {
      p_workshop_id: cleanWorkshopId,
      p_full_name: cleanFullName,
      p_email: cleanEmail,
      p_phone: cleanPhone,
      p_college: cleanCollege,
      p_academic_year: cleanYear,
    });

    if (rpcError) {
      console.error('Database RPC register_student_atomic error:', rpcError);
      throw new Error(rpcError.message || 'Database registration procedure failed.');
    }

    return NextResponse.json({
      success: true,
      bookingId: data.booking_id,
      assignedBatch: data.cohort_label,
      batchNumber: data.batch_number,
      fee: data.fee,
      alreadyRegistered: false,
    });
  } catch (err: any) {
    console.error('Registration route error:', err);
    return NextResponse.json(
      { error: err.message || 'An unexpected error occurred during registration.' },
      { status: 500 }
    );
  }
}