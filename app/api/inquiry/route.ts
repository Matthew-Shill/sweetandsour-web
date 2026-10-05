import { NextResponse } from "next/server";
import { loadSettings } from "@/lib/content";
import { composeInquiry, mailtoLink } from "@/lib/inquiry";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "That form could not be read." }, { status: 400 });
  }

  const settings = await loadSettings();
  const composed = composeInquiry(body, settings.eventLeadWeeks);
  if (!composed.ok) {
    return NextResponse.json({ error: composed.error }, { status: 400 });
  }
  if ("ignore" in composed) {
    return NextResponse.json({ ok: true, delivery: "email" });
  }

  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.INQUIRY_FROM_EMAIL;
  if (resendKey && from) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          authorization: `Bearer ${resendKey}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [settings.email],
          reply_to: composed.inquiry.replyTo,
          subject: composed.inquiry.subject,
          text: composed.inquiry.text,
        }),
      });
      if (response.ok) {
        return NextResponse.json({ ok: true, delivery: "email" });
      }
    } catch {
      // Fall through to the visitor's email app so the note is not lost.
    }
  }

  return NextResponse.json({
    ok: true,
    delivery: "mailto",
    mailto: mailtoLink(settings.email, composed.inquiry.subject, composed.inquiry.text),
  });
}
