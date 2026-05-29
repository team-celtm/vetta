
// app/api/send-outreach/route.ts

import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

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
  ctc?: string;
  draft?: boolean;
}

// ─────────────────────────────────────────────────────────────
// Global Transporter
// ─────────────────────────────────────────────────────────────

declare global {
  // eslint-disable-next-line no-var
  var _mailerTransport: nodemailer.Transporter | undefined;
}

// ─────────────────────────────────────────────────────────────
// Transporter
// ─────────────────────────────────────────────────────────────

function getTransporter(): nodemailer.Transporter {
  if (global._mailerTransport) {
    return global._mailerTransport;
  }

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

// ─────────────────────────────────────────────────────────────
// Build HTML
// ─────────────────────────────────────────────────────────────

function buildHtml(payload: OutreachPayload): string {
  const isOfferLetter =
    payload.template === "offer_letter";

  // safer formatting
  const htmlMessage = payload.message
    .split("\n")
    .map((line) => {
      return `
        <p
          style="
            margin:0 0 10px;
            font-size:14px;
            color:#374151;
            line-height:1.8;
          "
        >
          ${line || "&nbsp;"}
        </p>
      `;
    })
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>${payload.subject}</title>
</head>

<body
  style="
    margin:0;
    padding:0;
    background:#F3F4F6;
    font-family:'Segoe UI',Arial,sans-serif;
  "
>
  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    style="
      background:#F3F4F6;
      padding:32px 0;
    "
  >
    <tr>
      <td align="center">

        <table
          width="560"
          cellpadding="0"
          cellspacing="0"
          style="
            background:#ffffff;
            border-radius:18px;
            overflow:hidden;
            box-shadow:0 10px 40px rgba(0,0,0,0.08);
          "
        >

          <!-- Header -->

          <tr>
            <td
              style="
                background:${
                  isOfferLetter
                    ? "linear-gradient(135deg,#059669,#10B981)"
                    : "linear-gradient(135deg,#2563EB,#7C3AED)"
                };

                padding:32px 40px;
              "
            >
              <p
                style="
                  margin:0;
                  color:rgba(255,255,255,0.82);
                  font-size:12px;
                  letter-spacing:1.5px;
                  text-transform:uppercase;
                "
              >
                ${
                  isOfferLetter
                    ? "Offer Letter"
                    : "Message from Recruiting Team"
                }
              </p>

              <h1
                style="
                  margin:8px 0 0;
                  color:#ffffff;
                  font-size:24px;
                  font-weight:800;
                  line-height:1.3;
                "
              >
                ${payload.subject}
              </h1>
            </td>
          </tr>

          ${
            isOfferLetter && payload.ctc
              ? `
          <!-- Offer Highlight -->

          <tr>
            <td style="padding:24px 40px 0;">
              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                style="
                  background:#ECFDF5;
                  border:1px solid #A7F3D0;
                  border-radius:14px;
                "
              >
                <tr>
                  <td style="padding:20px 24px;">

                    <p
                      style="
                        margin:0 0 6px;
                        font-size:11px;
                        font-weight:700;
                        color:#047857;
                        letter-spacing:1px;
                        text-transform:uppercase;
                      "
                    >
                      Offered Compensation
                    </p>

                    <h2
                      style="
                        margin:0;
                        font-size:28px;
                        color:#065F46;
                        font-weight:800;
                      "
                    >
                      ₹${payload.ctc}
                    </h2>

                    <p
                      style="
                        margin:6px 0 0;
                        font-size:13px;
                        color:#047857;
                      "
                    >
                      Annual Cost to Company (CTC)
                    </p>

                  </td>
                </tr>
              </table>
            </td>
          </tr>
          `
              : ""
          }

          <!-- Body -->

          <tr>
            <td
              style="
                padding:${
                  isOfferLetter
                    ? "28px 40px 36px"
                    : "32px 40px"
                };
              "
            >
              ${htmlMessage}
            </td>
          </tr>

          <!-- Footer -->

          <tr>
            <td
              style="
                background:#F9FAFB;
                padding:18px 40px;
                text-align:center;
                border-top:1px solid #E5E7EB;
              "
            >
              <p
                style="
                  margin:0;
                  font-size:11px;
                  color:#9CA3AF;
                "
              >
                This is an automated message from the Recruiting Team.
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

// ─────────────────────────────────────────────────────────────
// POST Handler
// ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const payload =
      (await req.json()) as OutreachPayload;

    // validation

    if (!payload.candidateEmail) {
      return NextResponse.json(
        {
          error: "Candidate email is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !payload.subject?.trim() ||
      !payload.message?.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "Subject and message are required.",
        },
        {
          status: 400,
        }
      );
    }

    // draft mode

    if (payload.draft) {
      console.log(
        "[send-outreach] Draft saved for",
        payload.candidateEmail
      );

      return NextResponse.json({
        success: true,
        draft: true,
      });
    }

    // send email

    const transporter = getTransporter();

    await transporter.sendMail({
      from: `"Recruiting Team" <${process.env.EMAIL_USER}>`,

      to: payload.candidateEmail,

      subject: payload.subject,

      html: buildHtml(payload),
    });

    console.log(
      "[send-outreach] Sent to",
      payload.candidateEmail
    );

    return NextResponse.json(
      {
        success: true,
      },
      {
        status: 200,
      }
    );
  } catch (err: unknown) {
    console.error("[send-outreach]", err);

    const message =
      err instanceof Error
        ? err.message
        : "Unknown error";

    return NextResponse.json(
      {
        error: `Failed to send: ${message}`,
      },
      {
        status: 500,
      }
    );
  }
}

