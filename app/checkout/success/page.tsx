import type { Metadata } from "next";
import Link from "next/link";
import type Stripe from "stripe";
import { connection } from "next/server";
import { ClearCart } from "@/components/clear-cart";
import { loadSettings } from "@/lib/content";
import { formatISODate } from "@/lib/dates";
import { formatMoney } from "@/lib/format";
import { getStripe } from "@/lib/stripe";
import type { Settings } from "@/lib/types";

export const metadata: Metadata = {
  title: "Order received",
  description: "Your Sweet and Sour payment was received.",
};

type ReceiptState =
  | { status: "missing" }
  | { status: "unpaid" }
  | { status: "error" }
  | {
      status: "paid";
      email: string;
      date: string;
      fulfillment: "Pickup" | "Delivery";
      address: string;
      notes: string;
      total: number;
      lines: { id: string; quantity: number; description: string; amount: number }[];
    };

async function loadReceipt(sessionId: string): Promise<ReceiptState> {
  const stripe = getStripe();
  if (!stripe || !sessionId.startsWith("cs_")) return { status: "missing" };

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paid =
      session.payment_status === "paid" || session.payment_status === "no_payment_required";
    if (!paid || session.metadata?.bakery !== "sweet-and-sour") return { status: "unpaid" };

    const lineItems = await stripe.checkout.sessions.listLineItems(sessionId, { limit: 100 });
    return {
      status: "paid",
      email: session.customer_details?.email || session.metadata?.email || "",
      date: session.metadata?.date ?? "",
      fulfillment: session.metadata?.fulfillment === "delivery" ? "Delivery" : "Pickup",
      address: session.metadata?.address ?? "",
      notes: session.metadata?.notes ?? "",
      total: session.amount_total ?? 0,
      lines: lineItems.data.map((item: Stripe.LineItem) => ({
        id: item.id,
        quantity: item.quantity ?? 1,
        description: item.description ?? "Item",
        amount: item.amount_total ?? 0,
      })),
    };
  } catch {
    return { status: "error" };
  }
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await connection();
  const params = await searchParams;
  const sessionId = typeof params.session_id === "string" ? params.session_id : "";
  const settings = await loadSettings();
  const receipt = await loadReceipt(sessionId);

  if (receipt.status === "missing") {
    return (
      <Notice
        title="We could not find that payment."
        body="If you were charged, call or email us with the time of the order and we will sort it out."
        settings={settings}
      />
    );
  }

  if (receipt.status === "unpaid") {
    return (
      <Notice
        title="Payment is not complete."
        body="You can return to checkout and try again. Nothing is baked until the payment goes through."
        settings={settings}
      />
    );
  }

  if (receipt.status === "error") {
    return (
      <Notice
        title="We could not confirm that payment."
        body="If money left your card, email us and we will match it in Stripe."
        settings={settings}
      />
    );
  }

  return (
    <div className="px-5 py-14 sm:px-8 sm:py-20">
      <ClearCart />
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow">Paid</p>
        <h1 className="mt-3 font-display text-5xl font-medium sm:text-6xl">We have your order.</h1>
        <p className="mt-6 leading-8">
          Payment went through. We will email {receipt.email} to confirm the{" "}
          {receipt.fulfillment.toLowerCase()} details
          {receipt.date ? ` for ${formatISODate(receipt.date)}` : ""}.
        </p>
        <ul className="mt-8 divide-y divide-black/10 border-y border-black/10">
          {receipt.lines.map((item) => (
            <li key={item.id} className="flex justify-between gap-4 py-3 text-sm">
              <span>
                {item.quantity} × {item.description}
              </span>
              <span>{formatMoney(item.amount)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 font-semibold">Paid {formatMoney(receipt.total)}</p>
        <dl className="mt-6 space-y-2 text-sm leading-6">
          <div>
            <dt className="font-semibold">{receipt.fulfillment}</dt>
            <dd>{receipt.address || settings.serviceArea}</dd>
          </div>
          {receipt.notes ? (
            <div>
              <dt className="font-semibold">Notes</dt>
              <dd>{receipt.notes}</dd>
            </div>
          ) : null}
        </dl>
        <p className="mt-6 text-sm leading-6">{settings.changePolicy}</p>
        <p className="mt-4 text-sm leading-6">
          Questions:{" "}
          <a className="underline underline-offset-4" href={`tel:${settings.phoneTel}`}>
            {settings.phoneDisplay}
          </a>{" "}
          or{" "}
          <a className="underline underline-offset-4" href={`mailto:${settings.email}`}>
            {settings.email}
          </a>
        </p>
        <Link href="/menu" className="btn btn-primary mt-8">
          Order something else
        </Link>
      </div>
    </div>
  );
}

function Notice({
  title,
  body,
  settings,
}: {
  title: string;
  body: string;
  settings: Settings;
}) {
  return (
    <div className="px-5 py-14 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-xl">
        <h1 className="font-display text-5xl font-medium">{title}</h1>
        <p className="mt-5 leading-8">{body}</p>
        <p className="mt-4 text-sm">
          <a className="underline underline-offset-4" href={`tel:${settings.phoneTel}`}>
            {settings.phoneDisplay}
          </a>
          {" · "}
          <a className="underline underline-offset-4" href={`mailto:${settings.email}`}>
            {settings.email}
          </a>
        </p>
      </div>
    </div>
  );
}
