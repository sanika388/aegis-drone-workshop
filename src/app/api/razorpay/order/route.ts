import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req: Request) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Detailed check
    if (!keyId || !keySecret) {
      return NextResponse.json(
        { 
          error: `Missing Keys on Server: [RAZORPAY_KEY_ID: ${Boolean(keyId) ? 'FOUND' : 'MISSING'}] | [RAZORPAY_KEY_SECRET: ${Boolean(keySecret) ? 'FOUND' : 'MISSING'}]` 
        },
        { status: 500 }
      );
    }

    const instance = new Razorpay({
      key_id: keyId.trim(),
      key_secret: keySecret.trim(),
    });

    const body = await req.json().catch(() => ({}));
    const amount = Number(body?.amount) || 300;

    const options = {
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `rcpt_${Date.now().toString().slice(-8)}`,
      payment_capture: true,
    };

    const order = await instance.orders.create(options);

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: keyId.trim(),
    });
  } catch (error: any) {
    console.error('Razorpay Order Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Razorpay order creation failed' },
      { status: 500 }
    );
  }
}