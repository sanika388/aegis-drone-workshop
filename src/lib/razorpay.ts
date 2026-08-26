import Razorpay from 'razorpay';

export const getRazorpayInstance = () => {
  const key_id = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || '';
  const key_secret = process.env.RAZORPAY_KEY_SECRET || '';

  if (!key_id || !key_secret) {
    throw new Error('Razorpay API keys are missing in environment variables.');
  }

  return new Razorpay({
    key_id,
    key_secret,
  });
};

// Fallback proxy to maintain compatibility with existing imports
export const razorpay = new Proxy({} as Razorpay, {
  get(_target, prop) {
    const instance = getRazorpayInstance();
    return (instance as any)[prop];
  },
});