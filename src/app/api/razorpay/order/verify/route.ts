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

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing payment signature verification parameters' },
        { status: 400 }
      );
    }

    // 1. Verify HMAC SHA256 Signature
    const secret = process.env.RAZORPAY_KEY_SECRET || '';
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const isAuthentic = generatedSignature === razorpay_signature;

    if (!isAuthentic) {
      return NextResponse.json(
        { error: 'Payment signature mismatch / Invalid transaction' },
        { status: 400 }
      );
    }

    // 2. Determine Next Batch Number
    const targetWorkshopId = registrationData.workshop_id || 'aegis-master-workshop';
    
    // Fetch workshop capacity limit
    const { data: wsConfig } = await supabase
      .from('workshops')
      .select('batch_size_limit')
      .eq('id', targetWorkshopId)
      .single();

    const limit = wsConfig?.batch_size_limit || 20;

    // Count existing confirmed registrations
    const { count } = await supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true })
      .eq('workshop_id', targetWorkshopId);

    const currentCount = count || 0;
    const batchNumber = Math.floor(currentCount / limit) + 1;

    // 3. Insert Record into Supabase
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

    if (dbError) throw dbError;

    return NextResponse.json({
      success: true,
      record: record,
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}