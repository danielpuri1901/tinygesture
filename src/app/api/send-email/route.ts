import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// Simple in-memory rate limiter
const rateLimiter = new Map<string, number[]>();
const WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS = 5; // max 5 emails per minute per IP

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const requests = rateLimiter.get(ip) || [];

  // Filter requests within the window
  const recentRequests = requests.filter(time => now - time < WINDOW_MS);

  if (recentRequests.length >= MAX_REQUESTS) {
    return true;
  }

  recentRequests.push(now);
  rateLimiter.set(ip, recentRequests);
  return false;
}

export async function POST(req: NextRequest) {
  // Rate limiting
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }
  try {
    const resendKey = process.env.RESEND_API_KEY;

    if (!resendKey) {
      return NextResponse.json(
        { error: "Resend not configured" },
        { status: 500 }
      );
    }

    const resend = new Resend(resendKey);
    const { recipientEmail, gestureId } = await req.json();

    if (!recipientEmail || !gestureId) {
      return NextResponse.json(
        { error: "Missing recipientEmail or gestureId" },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin;
    const gestureLink = `${baseUrl}/enjoy/${gestureId}`;

    const { data, error } = await resend.emails.send({
      from: "A Tiny Gesture <hello@atinygesture.com>",
      to: 'danielpuri1901@gmail.com',
      subject: "Someone sent you a Tiny Gesture...",
      html: `
        <div style="font-family: 'Courier New', monospace; max-width: 400px; margin: 0 auto; text-align: center; padding: 40px 20px;">
          <p style="font-size: 18px; color: #171717; line-height: 1.6;">
            Someone is thinking about you today...
          </p>
          <p style="font-size: 16px; color: #171717; margin-top: 24px;">
            They've created a tiny gesture just for you.
          </p>
          <a href="${gestureLink}" style="display: inline-block; margin-top: 32px; padding: 14px 32px; background-color: #171717; color: white; text-decoration: none; font-size: 14px;">
            Open your Tiny Gesture
          </a>
          <p style="font-size: 12px; color: #999; margin-top: 16px; word-break: break-all;">
            ${gestureLink}
          </p>
          <p style="font-size: 14px; color: #666; margin-top: 40px;">
            With love,<br/>A Tiny Gesture
          </p>
        </div>
      `,
      text: `Someone is thinking about you today...\n\nThey've created a tiny gesture just for you.\n\nOpen your Tiny Gesture: ${gestureLink}\n\nWith love,\nA Tiny Gesture`,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, messageId: data?.id });
  } catch (error) {
    console.error("Email error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
