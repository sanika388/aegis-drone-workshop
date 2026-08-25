import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { resend } from '@/lib/resend';

export async function POST(req: Request) {
  try {
    const { fullName, email, phone, subject, message } = await req.json();

    if (!fullName || !email || !message) {
      return NextResponse.json(
        { error: 'Please provide full name, email, and message.' },
        { status: 400 }
      );
    }

    // 1. Store Inquiry in Supabase Database
    const { data, error: dbError } = await supabase
      .from('inquiries')
      .insert([
        {
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone ? phone.trim() : '',
          subject: subject || 'Workshop Inquiry',
          message: message.trim(),
          status: 'unread',
        },
      ])
      .select()
      .single();

    if (dbError) {
      console.error('Supabase DB error:', dbError);
    }

    // 2. Dispatch Email Alert via Resend to Official Aegis Inbox
    const targetEmail = process.env.AEGIS_SUPPORT_EMAIL || 'aegisdrones.officials@gmail.com';

    if (process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: 'Aegis Contact Desk <onboarding@resend.dev>',
          to: [targetEmail],
          replyTo: email,
          subject: `[Aegis Inquiry] ${subject} - ${fullName}`,
          html: `
            <div style="font-family: Arial, sans-serif; background-color: #0b0e14; color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #1c2438;">
              <h2 style="color: #00ff66; margin-top: 0;">New Workshop Inquiry Received</h2>
              <p><strong>Sender:</strong> ${fullName}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Contact / WhatsApp:</strong> ${phone || 'Not provided'}</p>
              <p><strong>Category:</strong> ${subject}</p>
              <hr style="border: 1px solid #1c2438; margin: 16px 0;" />
              <p><strong>Message:</strong></p>
              <div style="background-color: #121826; padding: 14px; border-radius: 8px; font-family: monospace; white-space: pre-line;">
                ${message}
              </div>
              <p style="font-size: 11px; color: #888888; margin-top: 20px;">Logged in Supabase Inquiries table.</p>
            </div>
          `,
        });
      } catch (mailErr) {
        console.warn('Resend email error (inquiry saved in DB):', mailErr);
      }
    }

    return NextResponse.json({ success: true, inquiryId: data?.id });
  } catch (err: any) {
    console.error('Contact route error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}