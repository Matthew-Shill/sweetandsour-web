"use client";

import Link from "next/link";
import { useState } from "react";
import { zonedTodayISO } from "@/lib/dates";

type Status =
  | { state: "idle" }
  | { state: "sending" }
  | { state: "email" }
  | { state: "ready"; mailto: string }
  | { state: "error"; message: string };

export function WeddingForm({
  email,
  eventLeadWeeks,
}: {
  email: string;
  eventLeadWeeks: number;
}) {
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const today = zonedTodayISO();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setStatus({ state: "sending" });
    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...data, kind: "wedding" }),
      });
      const payload = (await response.json()) as {
        error?: string;
        delivery?: string;
        mailto?: string;
      };
      if (!response.ok) {
        setStatus({ state: "error", message: payload.error ?? "Try again in a moment." });
        return;
      }
      form.reset();
      if (payload.delivery === "mailto" && payload.mailto) {
        window.location.href = payload.mailto;
        setStatus({ state: "ready", mailto: payload.mailto });
        return;
      }
      setStatus({ state: "email" });
    } catch {
      setStatus({ state: "error", message: "The form did not send. Email us directly." });
    }
  }

  return (
    <form onSubmit={onSubmit} className="relative grid gap-5" noValidate>
      <label className="hp" aria-hidden="true">
        Company
        <input name="company" tabIndex={-1} autoComplete="off" className="field-input" />
      </label>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold">Your name</span>
          <input name="name" required autoComplete="name" className="field-input" />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold">Email</span>
          <input name="email" type="email" required autoComplete="email" className="field-input" />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold">Phone</span>
          <input name="phone" type="tel" required autoComplete="tel" className="field-input" />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold">Event date</span>
          <input name="eventDate" type="date" required min={today} className="field-input" />
        </label>
      </div>
      <label className="block">
        <span className="mb-2 block text-sm font-semibold">Event location</span>
        <input name="location" required className="field-input" autoComplete="off" />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-semibold">Guest count</span>
        <input
          name="guestCount"
          type="number"
          required
          min={1}
          max={2000}
          inputMode="numeric"
          className="field-input"
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-semibold">Dessert preferences</span>
        <textarea
          name="preferences"
          required
          className="field-input"
          placeholder="Cinnamon rolls, a cookie table, cake pops…"
        />
      </label>
      <p className="text-sm leading-6">
        Please inquire at least {eventLeadWeeks} weeks ahead. If your date is sooner, send it
        anyway. There is no payment on this form, and you do not need an account. We use what you
        send to reply with a quote.{" "}
        <Link className="underline underline-offset-4" href="/privacy">
          Privacy policy
        </Link>
      </p>
      <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={status.state === "sending"}>
        {status.state === "sending" ? "Sending…" : "Inquire About Weddings & Events"}
      </button>
      <div aria-live="polite" className="text-sm leading-6">
        {status.state === "error" ? <p role="alert">{status.message}</p> : null}
        {status.state === "email" ? (
          <p>Sent. We will reply within one business day with what we can bake and a quote.</p>
        ) : null}
        {status.state === "ready" ? (
          <p>
            Your inquiry is ready to send to {email}. If your email app did not open, use the
            button below, then send the message.
          </p>
        ) : null}
      </div>
      {status.state === "ready" ? (
        <a className="btn btn-secondary w-full sm:w-auto" href={status.mailto}>
          Open email to send
        </a>
      ) : null}
    </form>
  );
}
