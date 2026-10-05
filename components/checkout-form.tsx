"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/components/cart-provider";
import { earliestReadyDate, formatISODate, nextReadyDate } from "@/lib/dates";
import { formatMoney } from "@/lib/format";
import { priceCart, quoteOrder, type CheckoutInput } from "@/lib/quote";
import type { Product, Settings } from "@/lib/types";

export function CheckoutForm({
  menu,
  settings,
  payments,
}: {
  menu: Product[];
  settings: Settings;
  payments: "test" | "live" | "off";
}) {
  const { lines } = useCart();
  const [fulfillment, setFulfillment] = useState<"pickup" | "delivery">("pickup");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState(false);
  const closeNoticeRef = useRef<HTMLButtonElement>(null);
  const earliest = earliestReadyDate(settings.leadDays);
  const suggested = nextReadyDate(settings.leadDays, settings.pickupDays);
  const priced = useMemo(() => priceCart(lines, menu), [lines, menu]);
  const deliveryCents = fulfillment === "delivery" ? settings.deliveryFeeCents : 0;
  const underMinimum =
    fulfillment === "delivery" && priced.subtotalCents < settings.deliveryMinimumCents;
  const total = priced.subtotalCents + (underMinimum ? 0 : deliveryCents);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const input: CheckoutInput = {
      lines,
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      fulfillment,
      date: String(form.get("date") ?? ""),
      town: String(form.get("town") ?? ""),
      street: String(form.get("street") ?? ""),
      zip: String(form.get("zip") ?? ""),
      notes: String(form.get("notes") ?? ""),
    };
    const quoted = quoteOrder(input, menu, settings);
    if (!quoted.ok) {
      setError(quoted.error);
      return;
    }
    if (payments === "off") {
      setNotice(true);
      return;
    }
    setSending(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      });
      const payload = (await response.json()) as { error?: string; url?: string };
      if (!response.ok || !payload.url) {
        setError(payload.error ?? "Payment could not be started.");
        setSending(false);
        return;
      }
      window.location.href = payload.url;
    } catch {
      setError("Payment could not be started. Call or email us and we will help.");
      setSending(false);
    }
  }

  useEffect(() => {
    if (!notice) return;
    closeNoticeRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setNotice(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [notice]);

  if (lines.length === 0) {
    return (
      <div>
        <p className="text-lg leading-8">Your order is empty.</p>
        <Link href="/menu" className="btn btn-primary mt-6">
          Order Online
        </Link>
      </div>
    );
  }

  return (
    <>
    <form onSubmit={onSubmit} className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]" noValidate>
      <div className="grid gap-5">
        <fieldset className="grid gap-3">
          <legend className="mb-2 text-sm font-semibold">How should we get it to you?</legend>
          <label className="flex min-h-12 items-center gap-3 bg-paper px-4">
            <input
              type="radio"
              name="fulfillment"
              value="pickup"
              checked={fulfillment === "pickup"}
              onChange={() => setFulfillment("pickup")}
            />
            Pickup in {settings.serviceArea} · free
          </label>
          <label className="flex min-h-12 items-center gap-3 bg-paper px-4">
            <input
              type="radio"
              name="fulfillment"
              value="delivery"
              checked={fulfillment === "delivery"}
              onChange={() => setFulfillment("delivery")}
            />
            Local delivery · {formatMoney(settings.deliveryFeeCents)}
          </label>
        </fieldset>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold">Ready date</span>
          <input className="field-input" type="date" name="date" required min={earliest} defaultValue={suggested} />
          <span className="mt-2 block text-sm leading-6">
            Earliest day is {formatISODate(earliest)}. We bake on the ready days listed above.
          </span>
        </label>
        {fulfillment === "delivery" ? (
          <div className="grid gap-5">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">Street address</span>
              <input className="field-input" name="street" required autoComplete="street-address" />
            </label>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold">Town</span>
                <select className="field-input" name="town" required defaultValue="">
                  <option value="" disabled>
                    Choose a town
                  </option>
                  {settings.deliveryTowns.map((town) => (
                    <option key={town} value={town}>
                      {town}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold">ZIP code</span>
                <input className="field-input" name="zip" required autoComplete="postal-code" inputMode="numeric" />
              </label>
            </div>
          </div>
        ) : null}
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Name</span>
            <input className="field-input" name="name" required autoComplete="name" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Phone</span>
            <input className="field-input" name="phone" type="tel" required autoComplete="tel" />
          </label>
        </div>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold">Email</span>
          <input className="field-input" name="email" type="email" required autoComplete="email" />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold">Notes</span>
          <textarea className="field-input" name="notes" placeholder="Flavors, allergies, or a gate code" />
        </label>
        <p className="text-sm leading-6">{settings.changePolicy}</p>
      </div>
      <aside className="h-fit bg-paper p-6">
        <h2 className="font-display text-3xl font-medium">Your total</h2>
        <ul className="mt-4 space-y-2 text-sm leading-6">
          {priced.lines.map((line) => (
            <li key={`${line.productId}:${line.optionId}`} className="flex justify-between gap-3">
              <span>
                {line.quantity} × {line.name}
                <span className="block text-black/70">{line.optionLabel}</span>
              </span>
              <span>{formatMoney(line.unitAmount * line.quantity)}</span>
            </li>
          ))}
        </ul>
        {priced.missing.map((problem) => (
          <p key={problem} className="mt-3 text-sm" role="alert">
            {problem}
          </p>
        ))}
        <dl className="mt-4 space-y-2 border-t border-black/10 pt-4 text-sm">
          <div className="flex justify-between">
            <dt>Sweets</dt>
            <dd>{formatMoney(priced.subtotalCents)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>{fulfillment === "delivery" ? "Delivery" : "Pickup"}</dt>
            <dd>{formatMoney(fulfillment === "delivery" ? settings.deliveryFeeCents : 0)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Service fee</dt>
            <dd>{formatMoney(0)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Sales tax</dt>
            <dd>Not added yet</dd>
          </div>
          <div className="flex justify-between pt-2 text-base font-semibold">
            <dt>Due now</dt>
            <dd>{formatMoney(underMinimum ? priced.subtotalCents : total)}</dd>
          </div>
        </dl>
        {underMinimum ? (
          <p className="mt-3 text-sm" role="alert">
            Delivery starts at {formatMoney(settings.deliveryMinimumCents)} before the delivery fee.
          </p>
        ) : null}
        <p className="mt-4 text-sm leading-6">
          {payments === "off"
            ? "Card payment will go through Sweet and Sour's own Stripe account. It is not connected yet, so the next step explains that and does not charge a card."
            : "No account. You finish payment on Stripe's secure page. We do not add a card surcharge. Stripe's standard online card fee is about 2.9% plus 30¢, and the bakery pays that. New York sales tax is not calculated until a registration is active."}{" "}
          We use your name, contact details, and delivery address to fill this order. Card details
          are entered on Stripe&apos;s page.{" "}
          <Link className="underline underline-offset-4" href="/privacy">
            Privacy policy
          </Link>
        </p>
        <button
          type="submit"
          className="btn btn-primary mt-5 w-full"
          disabled={sending || priced.missing.length > 0 || underMinimum}
        >
          {sending ? "Opening payment…" : "Continue to secure payment"}
        </button>
        {error ? (
          <p className="mt-3 text-sm" role="alert">
            {error}
          </p>
        ) : null}
      </aside>
    </form>
    {notice ? (
      <div
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 sm:items-center"
        onClick={() => setNotice(false)}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="payment-notice-title"
          aria-describedby="payment-notice-body"
          className="w-full max-w-md bg-paper p-6 sm:p-8"
          onClick={(event) => event.stopPropagation()}
        >
          <h2 id="payment-notice-title" className="font-display text-4xl font-medium">
            This will use Sweet and Sour&apos;s Stripe
          </h2>
          <p id="payment-notice-body" className="mt-4 leading-7">
            Card checkout is not connected yet. When Sweet and Sour adds their own Stripe account,
            this button opens their secure payment page and the charge goes to the bakery. Nothing
            is charged from this demo.
          </p>
          <button
            ref={closeNoticeRef}
            type="button"
            className="btn btn-primary mt-6"
            onClick={() => setNotice(false)}
          >
            Back to the order
          </button>
        </div>
      </div>
    ) : null}
    </>
  );
}
