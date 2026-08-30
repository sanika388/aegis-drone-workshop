import Razorpay from 'razorpay';

export const getRazorpayInstance = () => {
  const key_id = (
    process.env.RAZORPAY_KEY_ID ||
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
    ''
  ).trim();

  // Server-only key secret (never expose via NEXT_PUBLIC)
  const key_secret = (
    process.env.RAZORPAY_KEY_SECRET ||
    process.env.RAZORPAY_SECRET ||
    ''
  ).trim();

  if (!key_id || !key_secret) {
    throw new Error('Razorpay API keys are missing in environment variables.');
  }

  return new Razorpay({
    key_id,
    key_secret,
  });
};

export const razorpay = new Proxy({} as Razorpay, {
  get(_target, prop) {
    const instance = getRazorpayInstance();
    return (instance as any)[prop];
  },
});