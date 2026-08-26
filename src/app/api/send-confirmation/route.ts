import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { 
      email, 
      name, 
      clearanceId, 
      workshopTitle, 
      amount, 
      venue, 
      batchSchedule,
      paymentMethod 
    } = await req.json();

    if (!email || !clearanceId) {
      return NextResponse.json({ error: 'Missing required confirmation fields' }, { status: 400 });
    }

    const officialEmail = process.env.SMTP_USER || 'aegisdrones.officials@gmail.com';

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const isSpotCash = paymentMethod?.toLowerCase().includes('cash');

    // Dynamic verification QR payload
    const qrPayload = encodeURIComponent(
      JSON.stringify({
        id: clearanceId,
        pilot: name,
        status: isSpotCash ? 'CASH_PENDING' : 'VERIFIED_PAID',
        org: 'AEGIS_FLIGHT_LAB'
      })
    );

    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${qrPayload}&color=00ff66&bgcolor=07090f`;

    await transporter.sendMail({
      from: `"AEGIS FLIGHT COMMAND" <${officialEmail}>`,
      to: email,
      replyTo: officialEmail,
      subject: `⚡ FLIGHT CLEARANCE APPROVED: ${name} [${clearanceId}]`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { margin: 0; padding: 0; background-color: #05070a; font-family: monospace; }
            .container { max-width: 600px; margin: 20px auto; background-color: #0b0e14; border: 1px solid #1c2538; border-radius: 20px; overflow: hidden; box-shadow: 0 0 40px rgba(0, 255, 102, 0.08); }
            .header { padding: 32px 28px 20px 28px; text-align: left; border-bottom: 1px solid #161e30; }
            .badge { display: inline-block; padding: 6px 14px; background-color: rgba(0, 255, 102, 0.1); border: 1px solid #00ff66; border-radius: 50px; color: #00ff66; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; }
            .title { font-size: 26px; font-weight: 900; color: #ffffff; margin: 16px 0 4px 0; letter-spacing: -0.5px; }
            .subtitle { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 2px; font-weight: bold; margin: 0; }
            .ticket-body { padding: 28px; }
            .ticket-card { background: #07090f; border: 1px dashed #00ff66; border-radius: 16px; padding: 24px; }
            .grid { display: table; width: 100%; margin-bottom: 16px; }
            .row { display: table-row; }
            .col { display: table-cell; padding: 10px 8px; vertical-align: top; width: 50%; }
            .label { font-size: 10px; color: #6b7280; text-transform: uppercase; font-weight: 700; letter-spacing: 1px; margin-bottom: 4px; }
            .value { font-size: 14px; color: #ffffff; font-weight: 800; margin: 0; }
            .clearance-badge { font-size: 20px; color: #00ff66; font-weight: 900; letter-spacing: 1px; margin: 0; }
            .status-tag { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 800; }
            .status-paid { background-color: rgba(0, 255, 102, 0.15); color: #00ff66; border: 1px solid rgba(0, 255, 102, 0.4); }
            .status-pending { background-color: rgba(255, 187, 0, 0.15); color: #ffbb00; border: 1px solid rgba(255, 187, 0, 0.4); }
            .qr-section { text-align: center; padding: 16px 0 8px 0; border-top: 1px solid #1a2233; margin-top: 12px; }
            .qr-image { border: 2px solid #1c2538; border-radius: 12px; padding: 8px; background: #07090f; }
            .footer { padding: 24px 28px; border-top: 1px solid #161e30; background-color: #07090e; text-align: center; }
            .instruction { font-size: 12px; color: #9ca3af; line-height: 1.6; margin: 0 0 16px 0; }
            .support { font-size: 11px; color: #4b5563; margin: 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="badge">● SECURE FLIGHT CLEARANCE PASS</div>
              <h1 class="title">AEGIS DRONE AVIONICS</h1>
              <p class="subtitle">GEAR UP. CODE IT. BUILD IT. FLY IT.</p>
            </div>

            <div class="ticket-body">
              <div class="ticket-card">
                <div class="grid">
                  <div class="row">
                    <div class="col">
                      <div class="label">REGISTERED PILOT</div>
                      <p class="value" style="font-size: 16px; text-transform: uppercase;">${name}</p>
                    </div>
                    <div class="col" style="text-align: right;">
                      <div class="label">CLEARANCE ID</div>
                      <p class="clearance-badge">${clearanceId}</p>
                    </div>
                  </div>
                </div>

                <div style="height: 1px; background: #1a2233; margin: 8px 0 14px 0;"></div>

                <div class="grid">
                  <div class="row">
                    <div class="col">
                      <div class="label">TRACK / WORKSHOP</div>
                      <p class="value">${workshopTitle || 'Avionics Master Workshop'}</p>
                    </div>
                    <div class="col" style="text-align: right;">
                      <div class="label">HARDWARE KIT PASS</div>
                      <span class="status-tag ${isSpotCash ? 'status-pending' : 'status-paid'}">
                        ${isSpotCash ? 'DESK SPOT CASH (₹' + (amount || '300') + ')' : 'APPROVED (₹' + (amount || '300') + ')'}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="grid" style="margin-bottom: 0;">
                  <div class="row">
                    <div class="col">
                      <div class="label">FLIGHT HANGAR & VENUE</div>
                      <p class="value">${venue || 'GCOERC Nashik'}</p>
                    </div>
                    <div class="col" style="text-align: right;">
                      <div class="label">SCHEDULE</div>
                      <p class="value">${batchSchedule || 'Intake Cycle'}</p>
                    </div>
                  </div>
                </div>

                <div class="qr-section">
                  <img src="${qrCodeUrl}" alt="Security QR" width="130" height="130" class="qr-image" />
                  <p style="font-size: 10px; color: #00ff66; margin: 8px 0 0 0; letter-spacing: 1px;">
                    SCAN AT GATE FOR BOARDING VERIFICATION
                  </p>
                </div>
              </div>
            </div>

            <div class="footer">
              <p class="instruction">
                ${isSpotCash 
                  ? '⚠️ Present this digital pass with QR code along with <strong>₹' + amount + ' Spot Cash</strong> at the Registration Desk on event day.' 
                  : '✅ Your clearance is verified. Present this digital pass with the QR code at the hangar entrance.'}
              </p>
              <p class="support">
                Official Flight Desk: <a href="mailto:${officialEmail}" style="color: #00ff66; text-decoration: none;">${officialEmail}</a> | Desk Line: +91 7620350524
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Confirmation email error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}