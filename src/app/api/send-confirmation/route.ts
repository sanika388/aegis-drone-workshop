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
    const cleanBookingId = bookingId || 'AEGIS-B1-CONFIRMED';
    const workshop = workshopTitle || 'Aegis Drone Avionics Master Workshop';
    const locVenue = venue || 'GCOERC Avionics Research Lab, Nashik';
    const scheduleDate = date || 'September Month Intake';
    
    // Dynamic interactive pass URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aegis-drone-workshop.vercel.app';
    const passUrl = `${baseUrl}/pass/${cleanBookingId}`;

    // Plain text alternative for spam-filter deliverability
    const textFallback = `
Hello ${studentName},

Your flight clearance for the ${workshop} is officially confirmed.

REGISTRATION DETAILS:
- Pilot Name: ${studentName}
- Clearance ID: ${cleanBookingId}
- Assigned Cohort: ${assignedBatch}
- Specialization: ${workshop}
- Flight Lab Venue: ${locVenue}
- Schedule: ${scheduleDate}

Unlock your digital interactive pass here:
${passUrl}

${whatsappLink ? `Join your cohort WhatsApp squad: ${whatsappLink}` : ''}

Please present your digital pass or mention your Clearance ID (${cleanBookingId}) at the lab desk on event day.

Best regards,
Aegis Flight Operations Team
    `.trim();

    const info = await transporter.sendMail({
      from: `"Aegis Flight Command" <${process.env.SMTP_USER}>`,
      replyTo: process.env.SMTP_USER,
      to: studentEmail,
      subject: `Flight Clearance Confirmed: ${workshop} [${cleanBookingId}]`,
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
      <body style="margin: 0; padding: 0; background-color: #050507; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #050507; padding: 30px 10px;">
          <tr>
            <td align="center">
              
              <!-- Container Card -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #0b0c10; border-radius: 20px; border: 1px solid #1f2430; box-shadow: 0 20px 50px rgba(0, 255, 102, 0.08); overflow: hidden;">
                
                <!-- Top Accent Line -->
                <tr>
                  <td style="background: linear-gradient(90deg, #00ff66 0%, #00cc52 50%, #00ff66 100%); height: 4px; line-height: 4px; font-size: 0px;">&nbsp;</td>
                </tr>

                <!-- Header Section -->
                <tr>
                  <td style="padding: 36px 36px 24px 36px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td>
                          <div style="display: inline-block; padding: 5px 12px; background-color: rgba(0, 255, 102, 0.1); border: 1px solid rgba(0, 255, 102, 0.35); border-radius: 9999px;">
                            <span style="font-family: 'Courier New', Courier, monospace; font-size: 11px; font-weight: 800; color: #00ff66; text-transform: uppercase; letter-spacing: 1.5px;">● SECURE FLIGHT CLEARANCE PASS</span>
                          </div>
                          <h1 style="margin: 18px 0 6px 0; font-size: 26px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px; text-transform: uppercase;">
                            AEGIS DRONE AVIONICS
                          </h1>
                          <p style="margin: 0; font-family: 'Courier New', Courier, monospace; font-size: 12px; color: #717686; letter-spacing: 0.5px;">
                            GEAR UP. CODE IT. BUILD IT. FLY IT.
                          </p>
                        </td>
                        <td align="right" valign="top">
                          <div style="background-color: #141721; border: 1px dashed #00ff66; border-radius: 10px; padding: 8px 12px; text-align: center;">
                            <span style="font-family: 'Courier New', Courier, monospace; font-size: 10px; color: #717686; display: block; text-transform: uppercase;">COHORT</span>
                            <span style="font-family: 'Courier New', Courier, monospace; font-size: 14px; font-weight: 900; color: #00ff66;">${assignedBatch}</span>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Boarding Pass Main Body -->
                <tr>
                  <td style="padding: 0 36px 30px 36px;">
                    
                    <!-- HUD Specs Box -->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #12141c; border-radius: 14px; border: 1px solid #232838; padding: 20px; margin-bottom: 24px;">
                      <tr>
                        <td style="padding-bottom: 14px; border-bottom: 1px solid #1e2230;">
                          <span style="font-family: 'Courier New', Courier, monospace; font-size: 10px; color: #6b7280; text-transform: uppercase; display: block; letter-spacing: 1px;">REGISTERED PILOT</span>
                          <span style="font-size: 16px; font-weight: 800; color: #ffffff;">${studentName}</span>
                        </td>
                        <td style="padding-bottom: 14px; border-bottom: 1px solid #1e2230;" align="right">
                          <span style="font-family: 'Courier New', Courier, monospace; font-size: 10px; color: #6b7280; text-transform: uppercase; display: block; letter-spacing: 1px;">CLEARANCE ID</span>
                          <span style="font-family: 'Courier New', Courier, monospace; font-size: 15px; font-weight: 800; color: #00ff66;">${cleanBookingId}</span>
                        </td>
                      </tr>
                      
                      <tr>
                        <td style="padding-top: 14px; padding-bottom: 14px; border-bottom: 1px solid #1e2230;">
                          <span style="font-family: 'Courier New', Courier, monospace; font-size: 10px; color: #6b7280; text-transform: uppercase; display: block; letter-spacing: 1px;">TRACK / SPECIALIZATION</span>
                          <span style="font-size: 13px; font-weight: 700; color: #d1d5db;">${workshop}</span>
                        </td>
                        <td style="padding-top: 14px; padding-bottom: 14px; border-bottom: 1px solid #1e2230;" align="right">
                          <span style="font-family: 'Courier New', Courier, monospace; font-size: 10px; color: #6b7280; text-transform: uppercase; display: block; letter-spacing: 1px;">LAB ACCESS PASS</span>
                          <span style="font-family: 'Courier New', Courier, monospace; font-size: 12px; font-weight: 800; color: #00ff66;">CONFIRMED (₹${amount || 300})</span>
                        </td>
                      </tr>

                      <tr>
                        <td style="padding-top: 14px;">
                          <span style="font-family: 'Courier New', Courier, monospace; font-size: 10px; color: #6b7280; text-transform: uppercase; display: block; letter-spacing: 1px;">FLIGHT LAB & VENUE</span>
                          <span style="font-size: 12px; font-weight: 600; color: #9ca3af;">${locVenue}</span>
                        </td>
                        <td style="padding-top: 14px;" align="right">
                          <span style="font-family: 'Courier New', Courier, monospace; font-size: 10px; color: #6b7280; text-transform: uppercase; display: block; letter-spacing: 1px;">SCHEDULE</span>
                          <span style="font-size: 12px; font-weight: 700; color: #ffffff;">${scheduleDate}</span>
                        </td>
                      </tr>
                    </table>

                    <!-- Syllabus 3-Grid -->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
                      <tr>
                        <td style="background-color: #0e1017; border: 1px solid #1e2330; border-radius: 10px; padding: 12px; width: 31%;" valign="top">
                          <span style="color: #00ff66; font-size: 14px; font-weight: 900; display: block; font-family: 'Courier New', Courier, monospace;">01</span>
                          <strong style="color: #ffffff; font-size: 11px; display: block; margin-top: 4px;">ESP32 Avionics</strong>
                          <span style="color: #6b7280; font-size: 10px; line-height: 14px; display: block; margin-top: 2px;">MPU Gyro, ESCs & Circuitry Setup</span>
                        </td>
                        <td width="3.5%">&nbsp;</td>
                        <td style="background-color: #0e1017; border: 1px solid #1e2330; border-radius: 10px; padding: 12px; width: 31%;" valign="top">
                          <span style="color: #00ff66; font-size: 14px; font-weight: 900; display: block; font-family: 'Courier New', Courier, monospace;">02</span>
                          <strong style="color: #ffffff; font-size: 11px; display: block; margin-top: 4px;">Drone Assembly</strong>
                          <span style="color: #6b7280; font-size: 10px; line-height: 14px; display: block; margin-top: 2px;">Quadcopter Frame & Thrust Balance</span>
                        </td>
                        <td width="3.5%">&nbsp;</td>
                        <td style="background-color: #0e1017; border: 1px solid #1e2330; border-radius: 10px; padding: 12px; width: 31%;" valign="top">
                          <span style="color: #00ff66; font-size: 14px; font-weight: 900; display: block; font-family: 'Courier New', Courier, monospace;">03</span>
                          <strong style="color: #ffffff; font-size: 11px; display: block; margin-top: 4px;">PID Tuning</strong>
                          <span style="color: #6b7280; font-size: 10px; line-height: 14px; display: block; margin-top: 2px;">Hover Stability & Live Flight Test</span>
                        </td>
                      </tr>
                    </table>

                    <!-- Interactive Pass Blast CTA Button -->
                    <div style="text-align: center; margin-bottom: 22px;">
                      <a href="${passUrl}" target="_blank" style="display: block; background: linear-gradient(135deg, #00ff66 0%, #00cc52 100%); color: #050507; font-size: 13px; font-weight: 900; font-family: 'Courier New', Courier, monospace; letter-spacing: 0.5px; text-decoration: none; padding: 16px 24px; border-radius: 12px; text-transform: uppercase; box-shadow: 0 10px 25px rgba(0, 255, 102, 0.25);">
                        ⚡ UNLOCK INTERACTIVE CLEARANCE PASS &rarr;
                      </a>
                    </div>

                    <!-- WhatsApp Button -->
                    ${
                      whatsappLink
                        ? `
                        <div style="text-align: center; margin-bottom: 24px;">
                          <a href="${whatsappLink}" target="_blank" style="display: block; background-color: #141721; border: 1px solid #272e3d; color: #00ff66; font-size: 12px; font-weight: 800; font-family: 'Courier New', Courier, monospace; letter-spacing: 0.5px; text-decoration: none; padding: 14px 20px; border-radius: 12px; text-transform: uppercase;">
                            JOIN ${assignedBatch.toUpperCase()} SQUAD GROUP (WHATSAPP) →
                          </a>
                        </div>
                        `
                        : ''
                    }

                    <!-- Notice Disclaimer -->
                    <div style="background-color: rgba(255, 170, 0, 0.05); border: 1px solid rgba(255, 170, 0, 0.2); border-radius: 10px; padding: 12px 16px;">
                      <p style="margin: 0; font-size: 11px; color: #ffb84d; line-height: 16px; font-family: 'Courier New', Courier, monospace;">
                        ⚡ <strong>FLIGHT DESK INSTRUCTIONS:</strong> Please present your digital pass or mention your Clearance ID (<strong>${cleanBookingId}</strong>) at the lab desk on event day for physical attendance check-in.
                      </p>
                    </div>

                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #07080b; padding: 24px 36px; border-top: 1px solid #1a1e29; text-align: center;">
                    <p style="margin: 0; font-size: 11px; color: #4b5262; font-family: 'Courier New', Courier, monospace;">
                      AEGIS AVIONICS FLIGHT SYSTEMS • FLIGHT CLEARANCE DISPATCH
                    </p>
                    <p style="margin: 6px 0 0 0; font-size: 10px; color: #353a47; font-family: 'Courier New', Courier, monospace;">
                      Authorized & Issued by Workshop Coordination Team
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