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
    const scheduleDate = date || 'September Intake';
    
    // Dynamic scannable QR embedded directly into email body
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(cleanBookingId)}&bgcolor=08090d&color=00ff66`;

    const textFallback = `
AEGIS AVIONICS FLIGHT COMMAND
====================================
FLIGHT CLEARANCE PASS CONFIRMED

PILOT TELEMETRY:
- Pilot Name: ${studentName}
- Clearance ID: ${cleanBookingId}
- Assigned Squad: ${assignedBatch}
- Track: ${workshop}
- Venue: ${locVenue}
- Schedule: ${scheduleDate}
- Access Status: PAID & CONFIRMED (₹${amount || 300})

INSTRUCTIONS:
Keep this email handy or take a screenshot of your Clearance ID (${cleanBookingId}) and QR code for optical gate verification at the avionics research lab.

Issued by Aegis Flight Operations Desk.
    `.trim();

    const info = await transporter.sendMail({
      from: `"Aegis Flight Command" <${process.env.SMTP_USER}>`,
      replyTo: process.env.SMTP_USER,
      to: studentEmail,
      subject: `⚡ FLIGHT CLEARANCE PASS: ${studentName} [${cleanBookingId}]`,
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
      <body style="margin: 0; padding: 0; background-color: #030406; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #030406; padding: 35px 12px;">
          <tr>
            <td align="center">
              
              <!-- Master HUD Container -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #090b10; border-radius: 24px; border: 1px solid #1c2233; box-shadow: 0 0 50px rgba(0, 255, 102, 0.15); overflow: hidden;">
                
                <!-- Laser Top Bar -->
                <tr>
                  <td style="background: linear-gradient(90deg, #00ff66 0%, #00e5ff 50%, #00ff66 100%); height: 5px; font-size: 0px; line-height: 5px;">&nbsp;</td>
                </tr>

                <!-- Header Block -->
                <tr>
                  <td style="padding: 32px 32px 20px 32px; background-color: #0c0f17; border-bottom: 1px solid #181d2c;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td>
                          <div style="display: inline-block; padding: 4px 12px; background-color: rgba(0, 255, 102, 0.1); border: 1px solid rgba(0, 255, 102, 0.4); border-radius: 9999px;">
                            <span style="font-family: monospace; font-size: 10px; font-weight: 900; color: #00ff66; text-transform: uppercase; letter-spacing: 2px;">
                              ● OFFICIAL BOARDING PASS
                            </span>
                          </div>
                          <h1 style="margin: 14px 0 2px 0; font-size: 24px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px; font-family: monospace; text-transform: uppercase;">
                            AEGIS DRONE AVIONICS
                          </h1>
                          <p style="margin: 0; font-family: monospace; font-size: 11px; color: #64748b; letter-spacing: 1px;">
                            MISSION ID: ${cleanBookingId}
                          </p>
                        </td>
                        <td align="right" valign="top">
                          <div style="background-color: #06070a; border: 1px solid #00ff66; border-radius: 12px; padding: 8px 14px; text-align: center;">
                            <span style="font-family: monospace; font-size: 9px; color: #64748b; display: block; text-transform: uppercase;">SQUAD</span>
                            <span style="font-family: monospace; font-size: 15px; font-weight: 900; color: #00ff66;">${assignedBatch.toUpperCase()}</span>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Ticket Body -->
                <tr>
                  <td style="padding: 28px 32px;">
                    
                    <!-- Holographic Telemetry Specs Box -->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #06070a; border-radius: 16px; border: 1px solid #1c2233; padding: 20px; margin-bottom: 22px;">
                      <tr>
                        <td style="padding-bottom: 14px; border-bottom: 1px solid #151a27;">
                          <span style="font-family: monospace; font-size: 10px; color: #64748b; text-transform: uppercase; display: block; letter-spacing: 1px;">REGISTERED PILOT</span>
                          <span style="font-size: 16px; font-weight: 900; color: #ffffff;">${studentName}</span>
                        </td>
                        <td style="padding-bottom: 14px; border-bottom: 1px solid #151a27;" align="right">
                          <span style="font-family: monospace; font-size: 10px; color: #64748b; text-transform: uppercase; display: block; letter-spacing: 1px;">CLEARANCE NUMBER</span>
                          <span style="font-family: monospace; font-size: 16px; font-weight: 900; color: #00ff66;">${cleanBookingId}</span>
                        </td>
                      </tr>
                      
                      <tr>
                        <td style="padding-top: 14px; padding-bottom: 14px; border-bottom: 1px solid #151a27;">
                          <span style="font-family: monospace; font-size: 10px; color: #64748b; text-transform: uppercase; display: block; letter-spacing: 1px;">MISSION TRACK</span>
                          <span style="font-size: 13px; font-weight: 700; color: #e2e8f0;">${workshop}</span>
                        </td>
                        <td style="padding-top: 14px; padding-bottom: 14px; border-bottom: 1px solid #151a27;" align="right">
                          <span style="font-family: monospace; font-size: 10px; color: #64748b; text-transform: uppercase; display: block; letter-spacing: 1px;">DESK PAYMENT</span>
                          <span style="font-family: monospace; font-size: 13px; font-weight: 900; color: #00ff66;">CONFIRMED (₹${amount || 300})</span>
                        </td>
                      </tr>

                      <tr>
                        <td style="padding-top: 14px;">
                          <span style="font-family: monospace; font-size: 10px; color: #64748b; text-transform: uppercase; display: block; letter-spacing: 1px;">LAB & HANGAR VENUE</span>
                          <span style="font-size: 12px; font-weight: 600; color: #94a3b8;">${locVenue}</span>
                        </td>
                        <td style="padding-top: 14px;" align="right">
                          <span style="font-family: monospace; font-size: 10px; color: #64748b; text-transform: uppercase; display: block; letter-spacing: 1px;">SCHEDULE</span>
                          <span style="font-size: 12px; font-weight: 800; color: #ffffff;">${scheduleDate}</span>
                        </td>
                      </tr>
                    </table>

                    <!-- Embedded Scannable Optical QR Pass Card -->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background: radial-gradient(circle at center, #0e131d 0%, #06070a 100%); border-radius: 16px; border: 1px solid #00ff66; padding: 22px; margin-bottom: 22px; text-align: center; box-shadow: 0 0 25px rgba(0, 255, 102, 0.1);">
                      <tr>
                        <td align="center">
                          <div style="display: inline-block; padding: 6px; background-color: #030406; border-radius: 14px; border: 1px solid #1c2233; margin-bottom: 14px;">
                            <img src="${qrCodeUrl}" alt="Gate Telemetry QR" width="140" height="140" style="display: block; border-radius: 8px;" />
                          </div>
                          
                          <span style="font-family: monospace; font-size: 11px; font-weight: 900; color: #00ff66; text-transform: uppercase; letter-spacing: 1.5px; display: block;">
                            ● OPTICAL GATE TELEMETRY QR
                          </span>
                          <p style="margin: 6px 0 0 0; font-family: monospace; font-size: 11px; color: #94a3b8;">
                            Present this QR at the desk for optical gate scanning and lab check-in.
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Lab Bench Guidelines Notice -->
                    <div style="background-color: #0c0f17; border-left: 3px solid #00ff66; border-radius: 6px; padding: 14px 16px;">
                      <p style="margin: 0; font-family: monospace; font-size: 11px; color: #94a3b8; line-height: 17px;">
                        ⚡ <strong>BENCH ENTRY:</strong> Allotments are strictly configured by cohort. Take a screenshot of this clearance pass for offline access.
                      </p>
                    </div>

                  </td>
                </tr>

                <!-- Cybernetic Cutout Footer -->
                <tr>
                  <td style="background-color: #06070a; padding: 20px 32px; border-top: 1px solid #141824; text-align: center;">
                    <p style="margin: 0; font-size: 11px; color: #475569; font-family: monospace; letter-spacing: 1px;">
                      AEGIS FLIGHT OPERATIONS &bull; GCOERC NASHIK
                    </p>
                  </td>
                </tr>

              </table>
              <!-- End Master Container -->

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