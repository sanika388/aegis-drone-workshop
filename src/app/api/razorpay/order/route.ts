import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const keyId = (
      process.env.RAZORPAY_KEY_ID ||
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
      'rzp_live_TU0S8UUkdBmnWc'
    ).trim();

    // Direct fallback to ensure zero runtime drops
    const keySecret = (
      process.env.RAZORPAY_KEY_SECRET ||
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET ||
      process.env.RAZORPAY_SECRET ||
      'cFwMi64v17YUQgb34zgxy0Xk' // <- Put your exact full Razorpay Live Secret Key string here
    ).trim();

    if (!keyId || !keySecret) {
      return NextResponse.json(
        {
          error: `Server Missing Keys: [KEY_ID: ${keyId ? 'PRESENT' : 'MISSING'}] | [KEY_SECRET: ${keySecret ? 'PRESENT' : 'MISSING'}]`,
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
      amount: Math.round(amount * 100), // paise (₹300 -> 30000)
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