import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      registrationData,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, error: 'Missing payment signature verification parameters' },
        { status: 400 }
      );
    }

    // 1. Verify HMAC SHA256 Signature
    const secret = process.env.RAZORPAY_KEY_SECRET || '';
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, error: 'Payment signature mismatch / Invalid transaction' },
        { status: 400 }
      );
    }

    // 2. Compute Batch Cohort Number
    const targetWorkshopId = registrationData?.workshop_id || 'aegis-master-workshop';
    
    const { count } = await supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true })
      .eq('workshop_id', targetWorkshopId);

    const currentCount = count || 0;
    const batchNumber = Math.floor(currentCount / 20) + 1;

    // 3. Store Confirmed Registration in Supabase
    const { data: record, error: dbError } = await supabase
      .from('registrations')
      .insert([
        {
          workshop_id: targetWorkshopId,
          full_name: registrationData.full_name,
          email: registrationData.email,
          phone: registrationData.phone,
          college: registrationData.college,
          academic_year: registrationData.academic_year,
          payment_mode: 'online',
          payment_status: 'confirmed',
          payment_id: razorpay_payment_id,
          order_id: razorpay_order_id,
          batch_number: batchNumber,
          amount_paid: registrationData.amount_paid || 300,
        },
      ])
      .select()
      .single();

    if (dbError) {
      console.error('Supabase DB Insert Error:', dbError);
    }

    return NextResponse.json({
      success: true,
      bookingId: record?.id || razorpay_payment_id,
      assignedBatch: `Batch ${batchNumber}`,
      record: record || null,
    });
  } catch (error: any) {
    console.error('Payment verification route error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Verification endpoint failure' },
      { status: 500 }
    );
  }
}