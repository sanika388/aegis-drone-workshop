import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

function getBatchWhatsAppUrl(workshop: any, batchNumber: number): string {
  const batchKey = `Batch ${batchNumber}`;

  // 1. Check dictionary format
  if (workshop?.cohort_whatsapp_links && workshop.cohort_whatsapp_links[batchKey]?.trim()) {
    return workshop.cohort_whatsapp_links[batchKey].trim();
  }

  // 2. Check structured array format
  if (Array.isArray(workshop?.whatsapp_links)) {
    const matched = workshop.whatsapp_links.find(
      (item: any) => Number(item.batchNumber) === Number(batchNumber)
    );
    if (matched?.url && matched.url.trim() !== '') return matched.url.trim();
  }

  // 3. Fallback link
  return workshop?.fallback_whatsapp_link || 'https://chat.whatsapp.com/default-aegis-community';
}

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
      paymentMethod,
      workshopId,
      batchNumber,
      assignedBatch
    } = await req.json();

    if (!email || !clearanceId) {
      return NextResponse.json({ error: 'Missing required confirmation fields' }, { status: 400 });
    }

    // 1. Fetch workshop metadata
    const { data: workshop } = await supabase
      .from('workshops')
      .select('*')
      .eq('id', workshopId || 'aegis-master-workshop')
      .maybeSingle();

    // 2. Resolve batch number safely
    let resolvedBatchNum = 1;
    if (batchNumber && !isNaN(Number(batchNumber))) {
      resolvedBatchNum = Number(batchNumber);
    } else if (assignedBatch) {
      resolvedBatchNum = Number(String(assignedBatch).replace(/\D/g, '') || 1);
    }

    const batchWhatsAppLink = getBatchWhatsAppUrl(workshop, resolvedBatchNum);
    const officialEmail = process.env.SMTP_USER || 'aegisdrones.officials@gmail.com';
    const siteBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aegisdrones.in';
    const digitalPassUrl = `${siteBaseUrl}/pass/${clearanceId}`;

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
        batch: `Batch ${resolvedBatchNum}`,
        status: isSpotCash ? 'CASH_PENDING' : 'VERIFIED_PAID',
        org: 'AEGIS_FLIGHT_LAB'
      })
    );

    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${qrPayload}&color=00ff66&bgcolor=07090f`;

    await transporter.sendMail({
      from: `"AEGIS DRONE WORKSHOP" <${officialEmail}>`,
      to: email,
      replyTo: officialEmail,
      subject: `⚡ FLIGHT CLEARANCE CONFIRMED: ${name} [${clearanceId}]`,
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
            .title { font-size: 24px; font-weight: 900; color: #ffffff; margin: 16px 0 4px 0; letter-spacing: -0.5px; }
            .subtitle { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 2px; font-weight: bold; margin: 0; }
            .ticket-body { padding: 28px; }
            .ticket-card { background: #07090f; border: 1px dashed #00ff66; border-radius: 16px; padding: 24px; }
            .grid { display: table; width: 100%; margin-bottom: 16px; }
            .row { display: table-row; }
            .col { display: table-cell; padding: 10px 8px; vertical-align: top; width: 50%; }
            .label { font-size: 10px; color: #6b7280; text-transform: uppercase; font-weight: 700; letter-spacing: 1px; margin-bottom: 4px; }
            .value { font-size: 14px; color: #ffffff; font-weight: 800; margin: 0; }
            .clearance-badge { font-size: 18px; color: #00ff66; font-weight: 900; letter-spacing: 1px; margin: 0; }
            .status-tag { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 800; }
            .status-paid { background-color: rgba(0, 255, 102, 0.15); color: #00ff66; border: 1px solid rgba(0, 255, 102, 0.4); }
            .status-pending { background-color: rgba(255, 187, 0, 0.15); color: #ffbb00; border: 1px solid rgba(255, 187, 0, 0.4); }
            .qr-section { text-align: center; padding: 16px 0 8px 0; border-top: 1px solid #1a2233; margin-top: 12px; }
            .qr-image { border: 2px solid #1c2538; border-radius: 12px; padding: 8px; background: #07090f; }
            .btn-group { margin-top: 16px; }
            .wa-btn { display: inline-block; padding: 12px 20px; background-color: #25D366; color: #000000; text-decoration: none; font-weight: 900; font-size: 11px; border-radius: 10px; letter-spacing: 1px; text-transform: uppercase; margin: 4px; }
            .pass-btn { display: inline-block; padding: 12px 20px; background-color: #161e30; border: 1px solid #00ff66; color: #00ff66; text-decoration: none; font-weight: 900; font-size: 11px; border-radius: 10px; letter-spacing: 1px; text-transform: uppercase; margin: 4px; }
            .footer { padding: 24px 28px; border-top: 1px solid #161e30; background-color: #07090e; text-align: center; }
            .instruction { font-size: 12px; color: #9ca3af; line-height: 1.6; margin: 0 0 16px 0; }
            .support { font-size: 11px; color: #4b5563; margin: 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="badge">● CLEARANCE PASS</div>
              <h1 class="title">AEGIS DRONE WORKSHOP</h1>
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
                      <p class="value">${workshopTitle || workshop?.title || 'Avionics Master Workshop'}</p>
                    </div>
                    <div class="col" style="text-align: right;">
                      <div class="label">ASSIGNED COHORT</div>
                      <p class="value" style="color: #00ff66;">Batch ${resolvedBatchNum}</p>
                    </div>
                  </div>
                </div>

                <div class="grid">
                  <div class="row">
                    <div class="col">
                      <div class="label">SCHEDULE / DATE</div>
                      <p class="value">${batchSchedule || workshop?.schedule_date || '10th, 11th, 12th September Batch- 1&2 16th, 17th, 18th September 2026 BATCH-3&4'}</p>
                    </div>
                    <div class="col" style="text-align: right;">
                      <div class="label">PAYMENT STATUS</div>
                      <span class="status-tag ${isSpotCash ? 'status-pending' : 'status-paid'}">
                        ${isSpotCash ? 'SPOT CASH (₹' + (amount || '300') + ')' : 'PAID (₹' + (amount || '300') + ')'}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="grid">
                  <div class="row">
                    <div class="col" style="width: 100%;">
                      <div class="label">VENUE</div>
                      <p class="value">${venue || workshop?.venue || 'Guru Gobind Singh College of Engineering and Research Centre, Nashik'}</p>
                    </div>
                  </div>
                </div>

                <div class="qr-section">
                  <img src="${qrCodeUrl}" alt="Security QR" width="130" height="130" class="qr-image" />
                  <p style="font-size: 10px; color: #00ff66; margin: 8px 0 14px 0; letter-spacing: 1px;">
                    SCAN AT GATE TERMINAL FOR BOARDING CHECK-IN
                  </p>
                  
                  <div class="btn-group">
                    <a href="${batchWhatsAppLink}" target="_blank" class="wa-btn">
                      💬 Join Batch ${resolvedBatchNum} WhatsApp
                    </a>
                    <a href="${digitalPassUrl}" target="_blank" class="pass-btn">
                      🎟️ Open Interactive Pass
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div class="footer">
  <p class="instruction">
    ${isSpotCash 
      ? '⚠️ Present this email pass at the lab desk along with <strong>₹' + (amount || '300') + ' Spot Cash</strong> to activate entrance boarding.' 
      : '✅ Your flight pass is confirmed. Present the QR code on your mobile device at the reception scanner.'}
  </p>
  <p style="font-size: 11px; color: #9ca3af; background: #0a0d14; border: 1px solid #1c2538; padding: 8px; border-radius: 6px; margin: 10px 0;">
    🛡️ <strong>Lab Policy Note:</strong> All drone kits, ESP32 boards, and testing hardware are strictly workshop property for on-site assembly and testing (No take-home kits).
  </p>
  <p class="support">
    Official Flight Desk: <a href="mailto:${officialEmail}" style="color: #00ff66; text-decoration: none;">${officialEmail}</a> | Support: +91 7620350524/ +91 9028788532
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