import { NextResponse } from 'next/server';
import { razorpay } from '@/lib/razorpay';

export async function POST(req: Request) {
  try {
    const { amount, receipt } = await req.json();

    const options = {
      amount: Math.round(Number(amount) * 100), // In paise (₹300 -> 30000)
      currency: 'INR',
      receipt: receipt || `rec_${Date.now().toString().slice(-8)}`,
    };

    const order = await razorpay.orders.create(options);
    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error: any) {
    console.error('Razorpay order creation failed:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}