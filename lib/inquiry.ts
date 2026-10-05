import { addISODays, isISODate, zonedTodayISO } from "@/lib/dates";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ComposedInquiry = {
  subject: string;
  text: string;
  replyTo: string;
};

function clean(value: unknown, max: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

export function composeInquiry(
  body: unknown,
  eventLeadWeeks: number,
): { ok: true; ignore: true } | { ok: true; inquiry: ComposedInquiry } | { ok: false; error: string } {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "That form could not be read." };
  }
  const record = body as Record<string, unknown>;
  if (clean(record.company, 200)) return { ok: true, ignore: true };

  const kind = record.kind;
  const name = clean(record.name, 80);
  const email = clean(record.email, 120);

  if (name.length < 2) return { ok: false, error: "Enter your name." };
  if (!EMAIL.test(email)) return { ok: false, error: "Enter a real email address." };

  if (kind === "contact") {
    const message = clean(record.message, 2000);
    if (message.length < 10) {
      return { ok: false, error: "Write a short message so we know how to help." };
    }
    return {
      ok: true,
      inquiry: {
        subject: `Sweet and Sour note from ${name}`,
        replyTo: email,
        text: [`Name: ${name}`, `Email: ${email}`, "", message].join("\n"),
      },
    };
  }

  if (kind === "wedding") {
    const phone = clean(record.phone, 30);
    const eventDate = clean(record.eventDate, 10);
    const location = clean(record.location, 160);
    const guestCount = clean(record.guestCount, 6);
    const preferences = clean(record.preferences, 2000);
    const guests = Number(guestCount);

    if (phone.replace(/\D/g, "").length < 10) {
      return { ok: false, error: "Enter a phone number." };
    }
    if (!isISODate(eventDate) || eventDate < zonedTodayISO()) {
      return { ok: false, error: "Choose an event date that has not already passed." };
    }
    if (location.length < 3) return { ok: false, error: "Tell us where the event is." };
    if (!Number.isInteger(guests) || guests < 1 || guests > 2000) {
      return { ok: false, error: "Enter the guest count as a whole number." };
    }
    if (preferences.length < 8) {
      return { ok: false, error: "Tell us which desserts you are hoping for." };
    }

    const soon = eventDate < addISODays(zonedTodayISO(), eventLeadWeeks * 7);
    const lines = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone}`,
      `Event date: ${eventDate}`,
      `Location: ${location}`,
      `Guest count: ${guests}`,
      "",
      "Dessert preferences:",
      preferences,
    ];
    if (soon) {
      lines.push(
        "",
        `Note: this date is inside the usual ${eventLeadWeeks}-week planning window.`,
      );
    }

    return {
      ok: true,
      inquiry: {
        subject: `Sweet and Sour event inquiry for ${eventDate}`,
        replyTo: email,
        text: lines.join("\n"),
      },
    };
  }

  return { ok: false, error: "That form could not be read." };
}

export function mailtoLink(to: string, subject: string, text: string) {
  const body = text.length > 1500 ? `${text.slice(0, 1500)}\n\n[Message shortened to fit an email link.]` : text;
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
