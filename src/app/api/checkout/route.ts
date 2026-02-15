import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Simple in-memory rate limiter
const rateLimiter = new Map<string, number[]>();
const WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS = 10; // max 10 checkout attempts per minute per IP

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const requests = rateLimiter.get(ip) || [];

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
    const stripeKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeKey) {
      return NextResponse.json(
        { error: "Stripe not configured" },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeKey);
    const { quantity, discountCode } = await req.json();

    // Validate quantity
    const qty = Math.min(Math.max(1, parseInt(quantity) || 1), 99);

    // Check for valid discount code (case-insensitive)
    const isValidDiscount = discountCode?.toLowerCase() === "odyesee";
    const unitAmount = isValidDiscount ? 0 : 100; // €0 if valid code, €1.00 otherwise

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "ideal"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Tiny Gesture",
              description: `${qty} tiny gesture${qty > 1 ? "s" : ""} for someone you love${isValidDiscount ? " (discount applied)" : ""}`,
            },
            unit_amount: unitAmount,
          },
          quantity: qty,
        },
      ],
      mode: "payment",
      success_url: `${req.nextUrl.origin}/create`,
      cancel_url: `${req.nextUrl.origin}/`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
