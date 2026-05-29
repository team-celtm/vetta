import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

// ─── Types ────────────────────────────────────────────────────────────────────

interface InvitePayload {
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  role: string;
  interviewType: string;
  date: string;
  time: string;
  duration: string;
  mode: string;
  meetingLink: string;
  interviewers: string[];
  notes?: string;
  orgId: string;
  jdId: string;
}

// ─── Nodemailer transporter (reused across hot-reloads in dev) ────────────────

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
  });

  return global._mailerTransport;
}

// ─── Email template ───────────────────────────────────────────────────────────

function buildEmailHtml(payload: InvitePayload): string {
  const formattedDate = new Date(payload.date).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const interviewerList = payload.interviewers.join(", ");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Interview Invitation</title>
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
                        padding:32px 40px;text-align:center;">
              <p style="margin:0 0 6px;color:rgba(255,255,255,0.75);
                         font-size:12px;letter-spacing:1.5px;text-transform:uppercase;">
                Interview Invitation
              </p>
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:800;">
                You've been invited!
              </h1>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:32px 40px 0;">
              <p style="margin:0 0 8px;font-size:15px;color:#374151;">
                Hi <strong>${payload.candidateName}</strong>,
              </p>
              <p style="margin:0;font-size:14px;color:#6B7280;line-height:1.6;">
                We're excited to invite you to an interview for the
                <strong style="color:#111827;">${payload.role}</strong> position.
                Here are your interview details:
              </p>
            </td>
          </tr>

          <!-- Details card -->
          <tr>
            <td style="padding:24px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0"
                style="background:#F8FAFF;border:1px solid #E0E7FF;
                       border-radius:12px;overflow:hidden;">
                <tr>
                  <td style="padding:20px 24px;border-bottom:1px solid #E0E7FF;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="50%" style="padding-right:12px;">
                          <p style="margin:0 0 3px;font-size:10px;font-weight:700;
                                     color:#9CA3AF;letter-spacing:0.8px;text-transform:uppercase;">
                            Interview Type
                          </p>
                          <p style="margin:0;font-size:14px;font-weight:600;color:#111827;">
                            ${payload.interviewType}
                          </p>
                        </td>
                        <td width="50%">
                          <p style="margin:0 0 3px;font-size:10px;font-weight:700;
                                     color:#9CA3AF;letter-spacing:0.8px;text-transform:uppercase;">
                            Mode
                          </p>
                          <p style="margin:0;font-size:14px;font-weight:600;color:#111827;">
                            ${payload.mode}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 24px;border-bottom:1px solid #E0E7FF;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="50%" style="padding-right:12px;">
                          <p style="margin:0 0 3px;font-size:10px;font-weight:700;
                                     color:#9CA3AF;letter-spacing:0.8px;text-transform:uppercase;">
                            Date
                          </p>
                          <p style="margin:0;font-size:14px;font-weight:600;color:#111827;">
                            ${formattedDate}
                          </p>
                        </td>
                        <td width="50%">
                          <p style="margin:0 0 3px;font-size:10px;font-weight:700;
                                     color:#9CA3AF;letter-spacing:0.8px;text-transform:uppercase;">
                            Time
                          </p>
                          <p style="margin:0;font-size:14px;font-weight:600;color:#111827;">
                            ${payload.time}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
               <tr>
  <td style="padding:20px 24px;border-bottom:1px solid #E0E7FF;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td width="50%" style="padding-right:12px;">
          <p style="margin:0 0 3px;font-size:10px;font-weight:700;
                     color:#9CA3AF;letter-spacing:0.8px;text-transform:uppercase;">
            Duration
          </p>
          <p style="margin:0;font-size:14px;font-weight:600;color:#111827;">
            ${payload.duration}
          </p>
        </td>

        <td width="50%">
          <p style="margin:0 0 3px;font-size:10px;font-weight:700;
                     color:#9CA3AF;letter-spacing:0.8px;text-transform:uppercase;">
            Interviewer(s)
          </p>
          <p style="margin:0;font-size:14px;font-weight:600;color:#111827;">
            ${interviewerList}
          </p>
        </td>
      </tr>
    </table>
  </td>
</tr>

<!-- Meeting Link -->
<tr>
  <td style="padding:20px 24px;">
    <p style="margin:0 0 6px;font-size:10px;font-weight:700;
               color:#9CA3AF;letter-spacing:0.8px;text-transform:uppercase;">
      Meeting Link
    </p>

    <a href="${payload.meetingLink}"
       target="_blank"
       style="
         display:inline-block;
         background:#2563EB;
         color:#ffffff;
         text-decoration:none;
         padding:12px 18px;
         border-radius:8px;
         font-size:14px;
         font-weight:600;
       ">
      Join Interview
    </a>

    <p style="margin:12px 0 0;font-size:12px;color:#6B7280;word-break:break-all;">
      ${payload.meetingLink}
    </p>
  </td>
</tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${
            payload.notes
              ? `
          <!-- Notes -->
          <tr>
            <td style="padding:0 40px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0"
                style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:10px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0 0 4px;font-size:10px;font-weight:700;
                               color:#92400E;letter-spacing:0.8px;text-transform:uppercase;">
                      📝 Note from the team
                    </p>
                    <p style="margin:0;font-size:13px;color:#78350F;line-height:1.6;">
                      ${payload.notes}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`
              : ""
          }

          <!-- Sign-off -->
          <tr>
            <td style="padding:0 40px 32px;text-align:center;">
              <p style="margin:0 0 16px;font-size:13px;color:#6B7280;line-height:1.6;">
                Please confirm your attendance by replying to this email.
                If you have any questions, feel free to reach out.
              </p>
              <p style="margin:24px 0 0;font-size:13px;color:#6B7280;">
                Warm regards,<br/>
                <strong style="color:#111827;">Recruiting Team</strong>
              </p>
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
</html>
  `.trim();
}

// ─── POST handler (App Router) ────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json()) as InvitePayload;

    if (!payload.candidateEmail) {
      return NextResponse.json(
        { error: "Candidate email is required." },
        { status: 400 },
      );
    }
    if (!payload.date || !payload.time) {
      return NextResponse.json(
        { error: "Date and time are required." },
        { status: 400 },
      );
    }

    const transporter = getTransporter();

    await transporter.sendMail({
      from: `"Recruiting Team" <${process.env.EMAIL_USER}>`,
      to: payload.candidateEmail,
      subject: `Interview Invitation — ${payload.role} (${payload.interviewType})`,
      html: buildEmailHtml(payload),
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: unknown) {
    console.error("[send-interview-invite]", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to send email: ${message}` },
      { status: 500 },
    );
  }
}
