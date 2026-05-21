// app/api/send-outreach/route.ts
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

interface OutreachPayload {
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  role: string;
  subject: string;
  message: string;
  template: string;
  orgId: string;
  jdId: string;
  draft?: boolean;
}

declare global {
  // eslint-disable-next-line no-var
  var _mailerTransport: nodemailer.Transporter | undefined;
}

function getTransporter(): nodemailer.Transporter {
  if (global._mailerTransport) return global._mailerTransport;
  global._mailerTransport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT ?? 587),
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: { rejectUnauthorized: false },
  });
  return global._mailerTransport;
}

function buildHtml(payload: OutreachPayload): string {
  // Convert plain text message to HTML (preserve line breaks)
  const htmlMessage = payload.message
    .split("\n")
    .map((line) => `<p style="margin:0 0 6px;font-size:14px;color:#374151;line-height:1.7;">${line || "&nbsp;"}</p>`)
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${payload.subject}</title>
</head>
<body style="margin:0;padding:0;background:#F3F4F6;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F3F4F6;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0"
          style="background:#ffffff;border-radius:16px;overflow:hidden;
                 box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#2563EB,#7C3AED);
                        padding:28px 40px;">
              <p style="margin:0;color:rgba(255,255,255,0.8);
                         font-size:12px;letter-spacing:1.5px;text-transform:uppercase;">
                Message from Recruiting Team
              </p>
              <h1 style="margin:6px 0 0;color:#ffffff;font-size:20px;font-weight:800;line-height:1.3;">
                ${payload.subject}
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              ${htmlMessage}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F9FAFB;padding:16px 40px;text-align:center;
                        border-top:1px solid #E5E7EB;">
              <p style="margin:0;font-size:11px;color:#9CA3AF;">
                This is an automated message. Please do not reply directly to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json()) as OutreachPayload;

    if (!payload.candidateEmail) {
      return NextResponse.json({ error: "Candidate email is required." }, { status: 400 });
    }
    if (!payload.subject?.trim() || !payload.message?.trim()) {
      return NextResponse.json({ error: "Subject and message are required." }, { status: 400 });
    }

    // Draft — save to DB / log but don't send email
    if (payload.draft) {
      // TODO: optionally persist draft to a `outreach_drafts` table
      console.log("[send-outreach] Draft saved for", payload.candidateEmail);
      return NextResponse.json({ success: true, draft: true });
    }

    // Send email
    const transporter = getTransporter();
    await transporter.sendMail({
      from:    `"Recruiting Team" <${process.env.EMAIL_USER}>`,
      to:      payload.candidateEmail,
      subject: payload.subject,
      html:    buildHtml(payload),
    });

    console.log("[send-outreach] Sent to", payload.candidateEmail);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: unknown) {
    console.error("[send-outreach]", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Failed to send: ${message}` }, { status: 500 });
  }
}