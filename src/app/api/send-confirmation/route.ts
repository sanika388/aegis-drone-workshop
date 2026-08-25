import { NextResponse } from 'next/server';
import { resend } from '@/lib/resend';

export async function POST(req: Request) {
  try {
    const { email, name, clearanceId, workshopTitle, amount, venue, batchSchedule } = await req.json();

    if (!email || !clearanceId) {
      return NextResponse.json({ error: 'Missing required confirmation fields' }, { status: 400 });
    }

    const officialSupportEmail = process.env.AEGIS_SUPPORT_EMAIL || 'aegisdrones.official@gmail.com';

    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'Aegis Autonomous Flight Lab <onboarding@resend.dev>',
        to: [email],
        replyTo: officialSupportEmail,
        subject: `Clearance Pass Confirmed: ${clearanceId} - Aegis Drone Avionics`,
        html: `
          <div style="font-family: monospace; background: #080a0f; color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #1c2438;">
            <h2 style="color: #00ff66; margin-top: 0;">AEGIS AUTONOMOUS FLIGHT LAB</h2>
            <p>Dear ${name},</p>
            <p>Your enrollment for <strong>${workshopTitle || 'Aegis Drone Avionics Master Workshop'}</strong> is verified.</p>
            <div style="border: 1px dashed #00ff66; padding: 14px; margin: 16px 0; background: #0d121c; border-radius: 8px;">
              <p style="margin: 4px 0;"><strong>Clearance ID:</strong> ${clearanceId}</p>
              <p style="margin: 4px 0;"><strong>Fee Paid:</strong> ₹${amount}</p>
              <p style="margin: 4px 0;"><strong>Venue:</strong> ${venue || 'GCOERC Nashik'}</p>
              <p style="margin: 4px 0;"><strong>Batch Schedule:</strong> ${batchSchedule || 'Upcoming Intake'}</p>
            </div>
            <p style="font-size: 12px; color: #9ca3af;">
              For desk support, email <a href="mailto:${officialSupportEmail}" style="color: #00ff66;">${officialSupportEmail}</a> or reach the coordinator desk at +91 7620350524.
            </p>
          </div>
        `,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Confirmation email error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}