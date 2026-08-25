import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

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
        { success: false, error: 'Missing payment signature parameters' },
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
        { success: false, error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // 2. Insert atomically via Supabase RPC
    const { data, error: rpcError } = await supabase.rpc('register_student_atomic', {
      p_workshop_id: registrationData?.workshop_id || 'aegis-master-workshop',
      p_full_name: (registrationData?.full_name || '').trim(),
      p_email: (registrationData?.email || '').trim().toLowerCase(),
      p_phone: (registrationData?.phone || '').trim(),
      p_college: (registrationData?.college || '').trim(),
      p_academic_year: registrationData?.academic_year || 'SE - Second Year',
      p_payment_mode: 'online',
      p_payment_status: 'confirmed',
      p_payment_id: razorpay_payment_id,
      p_order_id: razorpay_order_id,
    });

    if (rpcError) {
      throw new Error(rpcError.message || 'Database atomic registration failed.');
    }

    return NextResponse.json({
      success: true,
      clearanceId: data.booking_id,
      assignedBatch: data.cohort_label,
      paymentId: razorpay_payment_id,
      fee: data.fee,
      record: data.record,
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}