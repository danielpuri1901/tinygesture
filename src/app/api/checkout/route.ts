import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
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
