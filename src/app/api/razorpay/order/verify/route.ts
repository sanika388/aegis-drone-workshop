import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: Request) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      registrationData,
    } = await req.json();

    // 1. Verify HMAC SHA256 Signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // 2. Save Confirmed Registration in Supabase
    const { data, error } = await supabase.from('registrations').insert([
      {
        ...registrationData,
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
        payment_status: 'confirmed',
        registered_at: new Date().toISOString(),
      },
    ]).select().single();

    if (error) throw error;

    return NextResponse.json({ success: true, record: data });
  } catch (error: any) {
    console.error('Payment verification failed:', error);
    return NextResponse.json({ error: error.message || 'Verification error' }, { status: 500 });
  }
}