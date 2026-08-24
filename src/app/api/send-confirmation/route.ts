import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { 
      studentName, 
      studentEmail, 
      bookingId, 
      workshopTitle, 
      amount, 
      venue, 
      date, 
      whatsappLink,
      cohortLabel 
    } = await req.json();

    if (!studentEmail) {
      return NextResponse.json({ error: 'Recipient email required' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const assignedBatch = cohortLabel || 'Batch 1';
    const cleanBookingId = bookingId || 'AEGIS-B1-001';
    const workshop = workshopTitle || 'Aegis Drone Avionics Master Workshop';
    const locVenue = venue || 'GCOERC Avionics Research Lab, Nashik';
    const scheduleDate = date || 'September Month Intake';
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aegis-drone-workshop.vercel.app';
    const passUrl = `${baseUrl}/pass/${cleanBookingId}`;
    
    // Dynamic Scannable High-Res QR code
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(passUrl)}&bgcolor=11141d&color=00ff66`;

    const textFallback = `
Hello ${studentName},

Your sequential flight clearance pass is confirmed: ${cleanBookingId}.

TELEMETRY SPECIFICATIONS:
- Pilot Name: ${studentName}
- Clearance ID: ${cleanBookingId}
- Cohort: ${assignedBatch}
- Venue: ${locVenue}
- Schedule: ${scheduleDate}

Launch your full 3D interactive pass:
${passUrl}

${whatsappLink ? `Cohort WhatsApp Group: ${whatsappLink}` : ''}

Best regards,
Aegis Flight Operations Team
    `.trim();

    const info = await transporter.sendMail({
      from: `"Aegis Flight Command" <${process.env.SMTP_USER}>`,
      replyTo: process.env.SMTP_USER,
      to: studentEmail,
      subject: `Flight Clearance Unlocked: ${workshop} [${cleanBookingId}]`,
      text: textFallback,
      headers: {
        'X-Priority': '3',
        'X-MSMail-Priority': 'Normal',
        'Importance': 'Normal',
      },
      html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Flight Clearance Pass</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #050508; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #050508; padding: 30px 10px;">
          <tr>
            <td align="center">
              
              <!-- Container Card -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #0b0c10; border-radius: 24px; border: 1px solid #1f2430; box-shadow: 0 20px 60px rgba(0, 255, 102, 0.12); overflow: hidden;">
                
                <!-- Glowing Top Accent Line -->
                <tr>
                  <td style="background: linear-gradient(90deg, #00ff66 0%, #00e5ff 50%, #00ff66 100%); height: 4px; font-size: 0px; line-height: 4px;">&nbsp;</td>
                </tr>

                <!-- Header Banner -->
                <tr>
                  <td align="center" style="background-color: #08090d; padding: 28px 20px 16px 20px; border-bottom: 1px solid #171b24;">
                    <div style="display: inline-block; padding: 4px 12px; background-color: rgba(0, 255, 102, 0.1); border: 1px solid rgba(0, 255, 102, 0.4); border-radius: 9999px; margin-bottom: 12px;">
                      <span style="font-family: monospace; font-size: 11px; font-weight: 800; color: #00ff66; text-transform: uppercase; letter-spacing: 2px;">
                        ● SEQUENTIAL CLEARANCE #${cleanBookingId}
                      </span>
                    </div>

                    <h1 style="margin: 0; font-size: 24px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px; text-transform: uppercase; font-family: monospace;">
                      AEGIS FLIGHT PASS
                    </h1>
                    <p style="margin: 6px 0 0 0; font-family: monospace; font-size: 12px; color: #717686;">
                      ACCESS GRANTED &bull; SQUAD COHORT ${assignedBatch.toUpperCase()}
                    </p>
                  </td>
                </tr>

                <!-- Main Body -->
                <tr>
                  <td style="padding: 24px 32px;">
                    
                    <!-- HUD Telemetry Card -->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #11141d; border-radius: 14px; border: 1px solid #232a3b; padding: 18px; margin-bottom: 20px;">
                      <tr>
                        <td style="padding-bottom: 12px; border-bottom: 1px solid #1a202c;">
                          <span style="font-family: monospace; font-size: 10px; color: #6b7280; text-transform: uppercase; display: block;">PILOT NAME</span>
                          <span style="font-size: 15px; font-weight: 800; color: #ffffff;">${studentName}</span>
                        </td>
                        <td style="padding-bottom: 12px; border-bottom: 1px solid #1a202c;" align="right">
                          <span style="font-family: monospace; font-size: 10px; color: #6b7280; text-transform: uppercase; display: block;">UNIQUE ID</span>
                          <span style="font-family: monospace; font-size: 15px; font-weight: 900; color: #00ff66;">${cleanBookingId}</span>
                        </td>
                      </tr>
                      
                      <tr>
                        <td style="padding-top: 12px; padding-bottom: 12px; border-bottom: 1px solid #1a202c;">
                          <span style="font-family: monospace; font-size: 10px; color: #6b7280; text-transform: uppercase; display: block;">SESSION TRACK</span>
                          <span style="font-size: 13px; font-weight: 600; color: #e6edf3;">${workshop}</span>
                        </td>
                        <td style="padding-top: 12px; padding-bottom: 12px; border-bottom: 1px solid #1a202c;" align="right">
                          <span style="font-family: monospace; font-size: 10px; color: #6b7280; text-transform: uppercase; display: block;">PASS TYPE</span>
                          <span style="font-family: monospace; font-size: 12px; font-weight: 800; color: #00ff66;">LAB ACCESS (₹${amount || 300})</span>
                        </td>
                      </tr>

                      <tr>
                        <td style="padding-top: 12px;">
                          <span style="font-family: monospace; font-size: 10px; color: #6b7280; text-transform: uppercase; display: block;">VENUE</span>
                          <span style="font-size: 12px; font-weight: 600; color: #9ca3af;">${locVenue}</span>
                        </td>
                        <td style="padding-top: 12px;" align="right">
                          <span style="font-family: monospace; font-size: 10px; color: #6b7280; text-transform: uppercase; display: block;">TIMETABLE</span>
                          <span style="font-size: 12px; font-weight: 700; color: #ffffff;">${scheduleDate}</span>
                        </td>
                      </tr>
                    </table>

                    <!-- Scannable QR Code Desk Box -->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #08090d; border-radius: 12px; border: 1px solid #1e2433; padding: 16px; margin-bottom: 20px;">
                      <tr>
                        <td align="center" width="120">
                          <img src="${qrCodeUrl}" alt="Digital Pass QR" width="100" height="100" style="display: block; border-radius: 8px; border: 1px solid #00ff66;" />
                        </td>
                        <td style="padding-left: 16px;">
                          <span style="font-family: monospace; font-size: 10px; color: #00ff66; text-transform: uppercase; font-weight: 800; display: block; margin-bottom: 4px;">
                            ● DESK VERIFICATION QR
                          </span>
                          <p style="margin: 0; font-size: 11px; color: #9ca3af; font-family: monospace; line-height: 15px;">
                            Scan at the lab entry gate to verify attendance telemetry and workbench allotment.
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Interactive Pass Blast CTA Button -->
                    <div style="text-align: center; margin-bottom: 16px;">
                      <a href="${passUrl}" target="_blank" style="display: block; background: linear-gradient(135deg, #00ff66 0%, #00cc52 100%); color: #050507; font-size: 13px; font-weight: 900; font-family: monospace; letter-spacing: 0.5px; text-decoration: none; padding: 16px 24px; border-radius: 12px; text-transform: uppercase; box-shadow: 0 10px 30px rgba(0, 255, 102, 0.35);">
                        ⚡ LAUNCH INTERACTIVE PASS & BLAST &rarr;
                      </a>
                    </div>

                    <!-- WhatsApp Squad Invite Button -->
                    ${
                      whatsappLink
                        ? `
                        <div style="text-align: center; margin-bottom: 16px;">
                          <a href="${whatsappLink}" target="_blank" style="display: block; background-color: #141721; border: 1px solid #232a3b; color: #00ff66; font-size: 12px; font-weight: 800; font-family: monospace; letter-spacing: 0.5px; text-decoration: none; padding: 13px 20px; border-radius: 10px; text-transform: uppercase;">
                            JOIN ${assignedBatch.toUpperCase()} SQUAD GROUP (WHATSAPP) &rarr;
                          </a>
                        </div>
                        `
                        : ''
                    }

                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #07080b; padding: 18px 32px; border-top: 1px solid #171b24; text-align: center;">
                    <p style="margin: 0; font-size: 11px; color: #484f58; font-family: monospace;">
                      AEGIS AVIONICS FLIGHT SYSTEMS &bull; GCOERC NASHIK
                    </p>
                  </td>
                </tr>

              </table>
              <!-- End Container Card -->

            </td>
          </tr>
        </table>
      </body>
      </html>
      `,
    });

    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (err: any) {
    console.error('Nodemailer dispatch error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}