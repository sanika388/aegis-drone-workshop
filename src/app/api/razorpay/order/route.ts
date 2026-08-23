import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req: Request) {
  try {
    const { amount, receipt } = await req.json();

    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
      key_secret: process.env.RAZORPAY_KEY_SECRET || '',
    });

    const options = {
      amount: Math.round(Number(amount) * 100), // Amount in paise
      currency: 'INR',
      receipt: receipt || `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error('Razorpay Order Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}