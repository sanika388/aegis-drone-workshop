import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { studentName, studentEmail, bookingId, workshopTitle, amount, venue, date, whatsappLink } = body;

    if (!studentEmail || !studentName || !bookingId) {
      return NextResponse.json({ error: 'Missing required attendee fields' }, { status: 400 });
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Flight Clearance Confirmed</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #050505; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #050505; padding: 40px 10px;">
          <tr>
            <td align="center">
              
              <!-- Outer Container -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 620px; background-color: #0e0e10; border: 1px solid #1f2937; border-radius: 20px; overflow: hidden; box-shadow: 0 0 50px rgba(0, 255, 102, 0.12);">
                
                <!-- Glowing Top Accent Bar -->
                <tr>
                  <td height="4" style="background: linear-gradient(90deg, #00ff66 0%, #00cc52 50%, #00ff66 100%); font-size: 0px; line-height: 0px;">&nbsp;</td>
                </tr>

                <!-- Header Block -->
                <tr>
                  <td style="padding: 32px 30px 24px 30px; text-align: center; background: radial-gradient(circle at top, rgba(0,255,102,0.08) 0%, rgba(14,14,16,0) 70%);">
                    <table align="center" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="background-color: rgba(0, 255, 102, 0.1); border: 1px solid rgba(0, 255, 102, 0.35); border-radius: 30px; padding: 6px 16px;">
                          <span style="color: #00ff66; font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; font-family: monospace;">
                            ◈ FLIGHT LAB CLEARANCE GRANTED ◈
                          </span>
                        </td>
                      </tr>
                    </table>

                    <h1 style="color: #ffffff; font-size: 26px; font-weight: 900; letter-spacing: -0.5px; margin: 18px 0 6px 0; text-transform: uppercase;">
                      AEGIS DRONES
                    </h1>
                    <p style="color: #6b7280; font-size: 12px; margin: 0; font-family: monospace; letter-spacing: 1px;">
                      AVIONICS & AUTONOMOUS SYSTEMS WORKSHOP
                    </p>
                  </td>
                </tr>

                <!-- Boarding Pass Main Card -->
                <tr>
                  <td style="padding: 0 28px 28px 28px;">
                    <div style="background-color: #141417; border: 1px solid #222228; border-radius: 16px; padding: 24px; position: relative;">
                      
                      <!-- Greeting & Subtext -->
                      <p style="color: #ffffff; font-size: 17px; font-weight: 700; margin: 0 0 8px 0;">
                        Welcome to the Flight Deck, <span style="color: #00ff66;">${studentName}</span>!
                      </p>
                      <p style="color: #9ca3af; font-size: 13px; line-height: 1.6; margin: 0 0 24px 0;">
                        Your registration for <b style="color: #ffffff;">${workshopTitle}</b> has been verified. Your hardware avionics toolkit, quadcopter components, and bench workstation have been assigned.
                      </p>

                      <!-- HUD Flight Specifications Grid -->
                      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #09090b; border: 1px dashed #27272a; border-radius: 12px; margin-bottom: 24px;">
                        <tr>
                          <td style="padding: 16px 20px; border-bottom: 1px solid #18181b;">
                            <span style="color: #71717a; font-size: 10px; font-family: monospace; text-transform: uppercase; letter-spacing: 1px;">CLEARANCE / PASS ID</span>
                            <div style="color: #00ff66; font-size: 16px; font-weight: 900; font-family: monospace; letter-spacing: 1px; margin-top: 4px;">
                              ${bookingId}
                            </div>
                          </td>
                          <td style="padding: 16px 20px; border-bottom: 1px solid #18181b; text-align: right;">
                            <span style="color: #71717a; font-size: 10px; font-family: monospace; text-transform: uppercase; letter-spacing: 1px;">VERIFICATION STATUS</span>
                            <div style="color: #22c55e; font-size: 12px; font-weight: 800; font-family: monospace; margin-top: 6px;">
                              ● CONFIRMED & PAID (₹${amount})
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 16px 20px;">
                            <span style="color: #71717a; font-size: 10px; font-family: monospace; text-transform: uppercase; letter-spacing: 1px;">SCHEDULED TIMELINE</span>
                            <div style="color: #ffffff; font-size: 13px; font-weight: 700; font-family: monospace; margin-top: 4px;">
                              ${date}
                            </div>
                          </td>
                          <td style="padding: 16px 20px; text-align: right;">
                            <span style="color: #71717a; font-size: 10px; font-family: monospace; text-transform: uppercase; letter-spacing: 1px;">FLIGHT LAB VENUE</span>
                            <div style="color: #e4e4e7; font-size: 12px; font-weight: 600; margin-top: 4px;">
                              ${venue}
                            </div>
                          </td>
                        </tr>
                      </table>

                      <!-- Modules Syllabus Summary Checklist -->
                      <div style="background-color: #0c0c0e; border: 1px solid #1c1c22; border-radius: 10px; padding: 14px 16px; margin-bottom: 24px;">
                        <span style="color: #a1a1aa; font-size: 11px; font-weight: bold; font-family: monospace; text-transform: uppercase;">
                          WHAT YOU WILL BUILD & MASTER:
                        </span>
                        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 10px; font-size: 12px; color: #d4d4d8;">
                          <tr>
                            <td style="padding: 3px 0; color: #00ff66;">✓</td>
                            <td style="padding: 3px 8px;">ESP32 Flight Computer, Gyro & Accelerometer Telemetry Wiring</td>
                          </tr>
                          <tr>
                            <td style="padding: 3px 0; color: #00ff66;">✓</td>
                            <td style="padding: 3px 8px;">3D Printed Aerodynamic Frame & High-KV Motor Rig Assembly</td>
                          </tr>
                          <tr>
                            <td style="padding: 3px 0; color: #00ff66;">✓</td>
                            <td style="padding: 3px 8px;">PID Tuning, Thrust Control Loop & Live Flight Maneuvers</td>
                          </tr>
                        </table>
                      </div>

                      ${whatsappLink ? `
                      <!-- WhatsApp Community CTA -->
                      <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td align="center">
                            <a href="${whatsappLink}" target="_blank" style="background-color: #00ff66; color: #000000; font-size: 13px; font-weight: 900; text-decoration: none; padding: 15px 30px; border-radius: 10px; display: inline-block; font-family: monospace; letter-spacing: 0.5px; text-transform: uppercase; box-shadow: 0 0 25px rgba(0,255,102,0.3);">
                              JOIN BATCH WHATSAPP COMMUNITY →
                            </a>
                          </td>
                        </tr>
                      </table>
                      ` : ''}

                    </div>
                  </td>
                </tr>

                <!-- Terminal Footer -->
                <tr>
                  <td style="background-color: #09090b; padding: 20px; border-top: 1px solid #1a1a1e; text-align: center;">
                    <p style="color: #52525b; font-size: 11px; font-family: monospace; margin: 0;">
                      Aegis Autonomous Flight Lab • Guru Gobind Singh College of Engineering, Nashik
                    </p>
                    <p style="color: #3f3f46; font-size: 10px; font-family: monospace; margin: 6px 0 0 0;">
                      Bring this email pass on your phone during lab check-in.
                    </p>
                  </td>
                </tr>

              </table>

            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const { data, error } = await resend.emails.send({
      from: 'Aegis Drones <onboarding@resend.dev>',
      to: [studentEmail],
      subject: `✈ FLIGHT CLEARANCE: ${workshopTitle} Pass Confirmed [${bookingId}]`,
      html: emailHtml,
    });

    if (error) {
      console.error('Resend dispatch error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Route failure:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}