import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req: Request) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error('Environment variable mismatch in API route:', {
        hasKeyId: Boolean(keyId),
        hasKeySecret: Boolean(keySecret),
      });
      return NextResponse.json(
        { error: 'Razorpay API keys are missing in environment variables.' },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const body = await req.json();
    const { amount, receipt } = body;

    const options = {
      amount: Math.round(Number(amount || 300) * 100), // In paise (₹300 -> 30000)
      currency: 'INR',
      receipt: receipt || `rec_${Date.now().toString().slice(-8)}`,
      payment_capture: true,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: keyId, // <--- Passes the key directly to frontend
    });
  } catch (error: any) {
    console.error('Razorpay order creation failed:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}