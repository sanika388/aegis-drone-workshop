import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req: Request) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error('Server Missing Keys:', {
        hasKeyId: Boolean(keyId),
        hasKeySecret: Boolean(keySecret),
      });
      return NextResponse.json(
        { error: 'Razorpay keys not configured on server runtime.' },
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
      amount: Math.round(amount * 100), // In paise (30000)
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
    console.error('Order creation error details:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create Razorpay order' },
      { status: 500 }
    );
  }
}