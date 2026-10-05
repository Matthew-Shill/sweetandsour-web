import { NextResponse } from "next/server";
import { loadMenu, loadSettings } from "@/lib/content";
import { normalizeCheckout, quoteOrder } from "@/lib/quote";
import { getStripe, INTEGRATION_IDENTIFIER } from "@/lib/stripe";

function clip(value: string) {
  return value.slice(0, 500);
}

function originFrom(request: Request) {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") ?? "http";
  if (host) return `${proto}://${host}`;
  return new URL(request.url).origin;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "The order could not be read." }, { status: 400 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Online card payment is not connected yet." },
      { status: 503 },
    );
  }

  const [menu, settings] = await Promise.all([loadMenu(), loadSettings()]);
  const quoted = quoteOrder(normalizeCheckout(body), menu, settings);
  if (!quoted.ok) {
    return NextResponse.json({ error: quoted.error }, { status: 400 });
  }

  const { quote } = quoted;
  const origin = originFrom(request);
  const summary = quote.lines
    .map((line) => `${line.quantity} x ${line.name} (${line.optionLabel})`)
    .join("; ");

  const metadata = {
    bakery: "sweet-and-sour",
    fulfillment: quote.fulfillment,
    date: quote.date,
    name: clip(quote.name),
    email: clip(quote.email),
    phone: clip(quote.phone),
    address: clip(quote.address),
    notes: clip(quote.notes),
    summary: clip(summary),
  };

  const lineItems = [
    ...quote.lines.map((line) => ({
      quantity: line.quantity,
      price_data: {
        currency: "usd" as const,
        unit_amount: line.unitAmount,
        product_data: {
          name: line.name,
          description: clip(`${line.optionLabel} · ${quote.fulfillment} ${quote.date}`),
        },
      },
    })),
    ...(quote.deliveryCents > 0
      ? [
          {
            quantity: 1,
            price_data: {
              currency: "usd" as const,
              unit_amount: quote.deliveryCents,
              product_data: {
                name: "Rochester-area delivery",
                description: clip(quote.address || "Local delivery"),
              },
            },
          },
        ]
      : []),
  ];

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_creation: "always",
      customer_email: quote.email,
      line_items: lineItems,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout`,
      metadata,
      payment_intent_data: {
        description: clip(`Sweet and Sour · ${quote.fulfillment} ${quote.date} · ${quote.name}`),
        metadata,
      },
      custom_text: {
        submit: {
          message: "Made to order in Rochester. No account is required.",
        },
      },
      integration_identifier: INTEGRATION_IDENTIFIER,
    });

    if (!session.url) {
      return NextResponse.json({ error: "Payment could not be started." }, { status: 502 });
    }

    return NextResponse.json({ url: session.url });
  } catch {
    return NextResponse.json(
      { error: "Payment could not be started. Call or email us and we will help." },
      { status: 502 },
    );
  }
}
