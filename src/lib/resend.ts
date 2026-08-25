import { Resend } from 'resend';

// Provide a fallback dummy string to prevent Next.js build-time initialization crash
export const resend = new Resend(process.env.RESEND_API_KEY || 're_build_placeholder_key');