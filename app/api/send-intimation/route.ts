import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

// ─── Types ────────────────────────────────────────────────────────────────────

interface IntimationPayload {
  candidateEmail: string;
  candidateName: string;
  role: string;
  decision: "selected" | "rejected";
  note: string;
  nextRound: number | null;
}

// ─── Transporter ──────────────────────────────────────────────────────────────

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
    tls: {
      rejectUnauthorized: false,
    },
  });

  return global._mailerTransport;
}

// ─── Email templates ──────────────────────────────────────────────────────────

function buildSelectedHtml(payload: IntimationPayload): string {
  const nextLabel =
    payload.nextRound && payload.nextRound <= 3
      ? `Round ${payload.nextRound}`
      : "the Offer stage";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Congratulations!</title>
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
            <td style="background:linear-gradient(135deg,#10B981,#059669);
                        padding:32px 40px;text-align:center;">
              <p style="margin:0 0 8px;font-size:32px;">🎉</p>
              <p style="margin:0 0 6px;color:rgba(255,255,255,0.8);
                         font-size:12px;letter-spacing:1.5px;text-transform:uppercase;">
                Great news
              </p>
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;">
                You've been selected!
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px 0;">
              <p style="margin:0 0 8px;font-size:15px;color:#374151;">
                Hi <strong>${payload.candidateName}</strong>,
              </p>
              <p style="margin:0 0 20px;font-size:14px;color:#6B7280;line-height:1.7;">
                We're pleased to inform you that you have been 
                <strong style="color:#059669;">selected</strong> after your interview 
                for the <strong style="color:#111827;">${payload.role}</strong> position.
                You will be moving forward to <strong style="color:#111827;">${nextLabel}</strong>.
              </p>
            </td>
          </tr>

          <!-- Note card -->
          <tr>
            <td style="padding:0 40px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0"
                style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:12px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 6px;font-size:10px;font-weight:700;
                               color:#059669;letter-spacing:0.8px;text-transform:uppercase;">
                      Message from the team
                    </p>
                    <p style="margin:0;font-size:13px;color:#065F46;line-height:1.7;
                               white-space:pre-line;">
${payload.note}
                    </p>
                  </td>
                </tr>
              </table>
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

function buildRejectedHtml(payload: IntimationPayload): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Application Update</title>
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
            <td style="background:linear-gradient(135deg,#6B7280,#4B5563);
                        padding:32px 40px;text-align:center;">
              <p style="margin:0 0 6px;color:rgba(255,255,255,0.8);
                         font-size:12px;letter-spacing:1.5px;text-transform:uppercase;">
                Application update
              </p>
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;">
                Thank you for your time
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px 0;">
              <p style="margin:0 0 8px;font-size:15px;color:#374151;">
                Hi <strong>${payload.candidateName}</strong>,
              </p>
              <p style="margin:0 0 20px;font-size:14px;color:#6B7280;line-height:1.7;">
                Thank you for interviewing with us for the 
                <strong style="color:#111827;">${payload.role}</strong> position. 
                After careful consideration, we will not be moving forward 
                with your application at this time.
              </p>
            </td>
          </tr>

          <!-- Note card -->
          <tr>
            <td style="padding:0 40px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0"
                style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:12px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 6px;font-size:10px;font-weight:700;
                               color:#6B7280;letter-spacing:0.8px;text-transform:uppercase;">
                      Message from the team
                    </p>
                    <p style="margin:0;font-size:13px;color:#374151;line-height:1.7;
                               white-space:pre-line;">
${payload.note}
                    </p>
                  </td>
                </tr>
              </table>
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

// ─── POST handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json()) as IntimationPayload;

    if (!payload.candidateEmail) {
      return NextResponse.json(
        { error: "Candidate email is required." },
        { status: 400 }
      );
    }
    if (!payload.decision) {
      return NextResponse.json(
        { error: "Decision (selected | rejected) is required." },
        { status: 400 }
      );
    }

    const isSelected = payload.decision === "selected";

    const subject = isSelected
      ? `Great news — You've been selected for ${payload.role}`
      : `Your application update — ${payload.role}`;

    const html = isSelected
      ? buildSelectedHtml(payload)
      : buildRejectedHtml(payload);

    const transporter = getTransporter();

    await transporter.sendMail({
      from: `"Recruiting Team" <${process.env.EMAIL_USER}>`,
      to: payload.candidateEmail,
      subject,
      html,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: unknown) {
    console.error("[send-intimation]", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to send intimation: ${message}` },
      { status: 500 }
    );
  }
}