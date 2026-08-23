import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { studentName, studentEmail, bookingId, workshopTitle, amount, venue, date, whatsappLink } = await req.json();

    // Drone Themed HTML Confirmation Boarding Pass
    const emailHtml = `
      <div style="background-color: #0a0a0a; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #121212; border: 1px solid #00ff66; border-radius: 16px; overflow: hidden; box-shadow: 0 0 30px rgba(0,255,102,0.15);">
          
          <div style="background-color: #181818; padding: 24px; border-bottom: 1px solid #242424; text-align: center;">
            <span style="background-color: rgba(0,255,102,0.1); color: #00ff66; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: bold; letter-spacing: 1px; border: 1px solid rgba(0,255,102,0.3);">
              FLIGHT LAB CLEARANCE CONFIRMED
            </span>
            <h1 style="color: #ffffff; margin: 12px 0 4px 0; font-size: 24px; font-weight: 900;">WELCOME TO AEGIS DRONES</h1>
            <p style="color: #a0a0a0; font-size: 13px; margin: 0;">Official Attendee Boarding Pass</p>
          </div>

          <div style="padding: 30px 24px;">
            <p style="color: #ffffff; font-size: 16px; margin-top: 0;">Hey <b>${studentName}</b>,</p>
            <p style="color: #d1d5db; font-size: 14px; line-height: 1.6;">
              Your seat registration for <b>${workshopTitle}</b> has been verified and officially confirmed. Your lab hardware kit and workstation are reserved.
            </p>

            <div style="background-color: #0a0a0a; border: 1px solid #242424; border-radius: 12px; padding: 20px; margin: 24px 0;">
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr>
                  <td style="color: #9ca3af; padding: 6px 0;">Booking ID:</td>
                  <td style="color: #00ff66; font-weight: bold; text-align: right; font-family: monospace;">${bookingId}</td>
                </tr>
                <tr>
                  <td style="color: #9ca3af; padding: 6px 0;">Date:</td>
                  <td style="color: #ffffff; text-align: right;">${date}</td>
                </tr>
                <tr>
                  <td style="color: #9ca3af; padding: 6px 0;">Venue:</td>
                  <td style="color: #ffffff; text-align: right;">${venue}</td>
                </tr>
                <tr>
                  <td style="color: #9ca3af; padding: 6px 0;">Pass Amount:</td>
                  <td style="color: #00ff66; font-weight: bold; text-align: right;">₹${amount}</td>
                </tr>
              </table>
            </div>

            ${whatsappLink ? `
              <div style="text-align: center; margin-top: 24px;">
                <a href="${whatsappLink}" style="display: inline-block; background-color: #00ff66; color: #000000; font-weight: bold; font-size: 13px; text-decoration: none; padding: 12px 24px; border-radius: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
                  Join Batch WhatsApp Community
                </a>
              </div>
            ` : ''}
          </div>

          <div style="background-color: #181818; padding: 16px; text-align: center; border-top: 1px solid #242424; font-size: 11px; color: #6b7280;">
            Aegis Drones Flight Engineering • GCOERC Nashik
          </div>
        </div>
      </div>
    `;

    // Simulated email dispatcher (Connect Resend / Nodemailer here)
    console.log(`[EMAIL DISPATCHED] To: ${studentEmail} | Booking: ${bookingId}`);

    return NextResponse.json({ success: true, message: `Confirmation email queued for ${studentEmail}` });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}