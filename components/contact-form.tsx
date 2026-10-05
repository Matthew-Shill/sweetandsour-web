"use client";

import Link from "next/link";
import { useState } from "react";

type Status =
  | { state: "idle" }
  | { state: "sending" }
  | { state: "email"; mailto?: string }
  | { state: "ready"; mailto: string }
  | { state: "error"; message: string };

export function ContactForm({ email }: { email: string }) {
  const [status, setStatus] = useState<Status>({ state: "idle" });

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setStatus({ state: "sending" });
    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...data, kind: "contact" }),
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
      <label className="block">
        <span className="mb-2 block text-sm font-semibold">Name</span>
        <input name="name" required autoComplete="name" className="field-input" />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-semibold">Email</span>
        <input name="email" type="email" required autoComplete="email" className="field-input" />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-semibold">Message</span>
        <textarea name="message" required className="field-input" />
      </label>
      <p className="text-sm leading-6">
        We use your name, email, and message to reply.{" "}
        <Link className="underline underline-offset-4" href="/privacy">
          Privacy policy
        </Link>
      </p>
      <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={status.state === "sending"}>
        {status.state === "sending" ? "Sending…" : "Send a note"}
      </button>
      <div aria-live="polite" className="text-sm leading-6">
        {status.state === "error" ? <p role="alert">{status.message}</p> : null}
        {status.state === "email" ? <p>Sent. We will reply within one business day.</p> : null}
        {status.state === "ready" ? (
          <p>
            Your note is ready to send to {email}. If your email app did not open, use the button
            below, then send the message.
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
