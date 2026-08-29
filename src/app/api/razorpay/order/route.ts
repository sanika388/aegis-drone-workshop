import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req: Request) {
  try {
    const keyId = (process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '').trim();
    const keySecret = (process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_SECRET || '').trim();

    if (!keyId || !keySecret) {
      return NextResponse.json(
        {
          error: `Missing Keys on Server: [KEY_ID: ${keyId ? 'PRESENT' : 'MISSING'}] | [KEY_SECRET: ${keySecret ? 'PRESENT' : 'MISSING'}]`,
        },
        { status: 500 }
      );
    }

    const instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const body = await req.json().catch(() => ({}));
    const amount = Number(body?.amount) || 300;

    const options = {
      amount: Math.round(amount * 100), // convert ₹300 -> 30000 paise
      currency: 'INR',
      receipt: `rcpt_${Date.now().toString().slice(-8)}`,
      payment_capture: true,
    };

    const order = await instance.orders.create(options);

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: keyId,
    });
  } catch (error: any) {
    console.error('Razorpay Order Creation Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Razorpay order creation failed' },
      { status: 500 }
    );
  }
}