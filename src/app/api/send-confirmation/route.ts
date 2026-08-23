import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY is missing from environment variables');
      return NextResponse.json({ error: 'Server missing RESEND_API_KEY' }, { status: 500 });
    }

    const resend = new Resend(apiKey);
    const body = await req.json();
    const { studentName, studentEmail, bookingId, workshopTitle, amount, venue, date, whatsappLink } = body;

    console.log('Attempting Resend dispatch to:', studentEmail);

    const { data, error } = await resend.emails.send({
      from: 'Aegis Flight Lab <onboarding@resend.dev>',
      to: [studentEmail],
      subject: `Official Boarding Pass: ${workshopTitle || 'Aegis Drone Workshop'} - ${bookingId}`,
      html: `
        <div style="font-family: monospace; background-color: #0a0a0a; color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #00ff66;">
          <h1 style="color: #00ff66; margin: 0 0 8px 0; font-size: 20px;">AEGIS FLIGHT LAB CLEARANCE</h1>
          <p style="color: #888888; margin: 0 0 16px 0; font-size: 12px;">OFFICIAL WORKSHOP REGISTRATION PASS</p>
          <hr style="border: 0; border-top: 1px solid #222222; margin-bottom: 16px;" />
          
          <p style="font-size: 14px; margin-bottom: 8px;">Pilot Name: <strong>${studentName}</strong></p>
          <p style="font-size: 14px; margin-bottom: 8px;">Booking ID: <strong style="color: #00ff66;">${bookingId}</strong></p>
          <p style="font-size: 14px; margin-bottom: 8px;">Workshop: <strong>${workshopTitle || 'Aegis Drone Workshop'}</strong></p>
          <p style="font-size: 14px; margin-bottom: 8px;">Venue: <strong>${venue || 'GCOERC Avionics Lab, Nashik'}</strong></p>
          <p style="font-size: 14px; margin-bottom: 16px;">Schedule: <strong>${date || 'September Month'}</strong></p>
          
          ${
            whatsappLink
              ? `<div style="margin-top: 20px;">
                  <a href="${whatsappLink}" style="display: inline-block; background-color: #00ff66; color: #000000; padding: 12px 20px; font-weight: bold; text-decoration: none; border-radius: 6px; font-size: 12px;">JOIN ASSIGNED WHATSAPP COHORT →</a>
                 </div>`
              : ''
          }
        </div>
      `,
    });

    if (error) {
      console.error('Resend API response error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log('Resend success:', data);
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Server catch error in send-confirmation:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}