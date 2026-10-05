import type { Metadata } from "next";
import { connection } from "next/server";
import { loadSettings } from "@/lib/content";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "How Sweet and Sour in Rochester, NY collects, uses, and keeps customer information from orders, payments, and inquiries.",
};

export default async function PrivacyPage() {
  await connection();
  const settings = await loadSettings();

  return (
    <div className="px-5 py-14 sm:px-8 sm:py-20">
      <article className="mx-auto max-w-3xl">
        <p className="eyebrow">Privacy</p>
        <h1 className="mt-3 font-display text-5xl font-medium sm:text-6xl">Privacy policy</h1>
        <p className="mt-6 text-lg leading-8">
          Sweet and Sour is a bakery in {settings.serviceArea}. This page explains what we collect
          when you order, pay, or write to us, why we keep it, and who else sees it.
        </p>
        <p className="mt-4 text-sm leading-6">Effective October 5, 2026.</p>

        <section className="mt-12">
          <h2 className="font-display text-4xl font-medium">Who we are</h2>
          <p className="mt-4 leading-8">
            Sweet and Sour bakes to order in {settings.serviceArea}. There is no walk-in counter and
            no customer account on this site. Questions about this policy can go to{" "}
            <a className="underline underline-offset-4" href={`mailto:${settings.email}`}>
              {settings.email}
            </a>{" "}
            or{" "}
            <a className="underline underline-offset-4" href={`tel:${settings.phoneTel}`}>
              {settings.phoneDisplay}
            </a>
            . {settings.replyNote}
          </p>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-4xl font-medium">What we collect</h2>
          <h3 className="mt-6 text-lg font-semibold">Orders</h3>
          <p className="mt-3 leading-8">When you check out, we collect:</p>
          <ul className="mt-3 list-disc space-y-2 pl-5 leading-7">
            <li>Your name, email, and phone number</li>
            <li>Pickup or delivery, and the ready date</li>
            <li>For delivery, the street address, town, and ZIP code</li>
            <li>What you ordered</li>
            <li>Anything you put in the notes, such as a flavor, an allergy, or a gate code</li>
          </ul>
          <p className="mt-4 leading-8">
            If you mention an allergy or another health detail, we use it only to prepare that
            order. You do not need an account.
          </p>
          <h3 className="mt-8 text-lg font-semibold">Payment</h3>
          <p className="mt-3 leading-8">
            Card payment is handled by{" "}
            <a
              className="underline underline-offset-4"
              href="https://stripe.com/privacy"
              rel="noreferrer"
            >
              Stripe
            </a>{" "}
            on Stripe’s page. We do not see or store your full card number or security code. Stripe
            receives your email and the order details so it can take the payment, keep a customer
            record for that charge, and send a receipt. We receive confirmation that the payment
            went through, plus the order information above, so we can bake it and get it to you.
          </p>
          <h3 className="mt-8 text-lg font-semibold">Questions and event inquiries</h3>
          <p className="mt-3 leading-8">
            The contact form collects your name, email, and message. The weddings and events form
            also collects your phone number, event date, event location, guest count, and dessert
            preferences. Those forms do not take a payment.
          </p>
          <p className="mt-4 leading-8">
            Messages are delivered to {settings.email}. When our email service is connected, that
            delivery goes through{" "}
            <a
              className="underline underline-offset-4"
              href="https://resend.com/legal/privacy-policy"
              rel="noreferrer"
            >
              Resend
            </a>
            . Otherwise the form opens your own email app so you can send the message yourself. A
            call or an email you send us directly is used the same way: to answer you and, if you
            are ordering, to fill the order.
          </p>
          <h3 className="mt-8 text-lg font-semibold">What stays on your device</h3>
          <p className="mt-3 leading-8">
            Your cart — the items and quantities you have chosen — is saved in this browser until
            you check out, change it, or clear the browser’s saved data. The cart does not include
            your name or contact details, and it is not an account. We do not use advertising
            cookies or analytics trackers, and we do not set a tracking cookie for visitors.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-4xl font-medium">How we use it</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 leading-7">
            <li>Bake and fulfill the order</li>
            <li>Confirm the pickup spot or the delivery window</li>
            <li>Reply to a question or an event inquiry</li>
            <li>Take payment through Stripe</li>
            <li>Keep ordinary business records, including bookkeeping and tax records</li>
          </ul>
          <p className="mt-4 leading-8">
            We do not sell personal information. We do not share it for advertising, and we do not
            add you to a mailing list. We write when it is about your order or your question.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-4xl font-medium">Who else receives it</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 leading-7">
            <li>Stripe, to process the card payment and send a receipt</li>
            <li>Resend, when it is connected, to deliver a form message to our inbox</li>
            <li>
              Our email inbox at {settings.email}, a Google account, where we read orders and
              inquiries and write back
            </li>
          </ul>
          <p className="mt-4 leading-8">
            A delivery address is used to bring that order to you. We may also disclose information
            if the law requires it, or if we need to resolve a payment dispute about an order.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-4xl font-medium">How long we keep it</h2>
          <p className="mt-4 leading-8">
            We keep order and inquiry records for as long as we need them to finish the order,
            answer a follow-up, and meet ordinary bookkeeping and tax duties. After that, we delete
            them or remove the details that identify you.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-4xl font-medium">Your choices</h2>
          <p className="mt-4 leading-8">
            Email {settings.email} or call {settings.phoneDisplay} to ask what we have about you, to
            correct something that is wrong, or to ask us to delete what we no longer need. We may
            ask enough to confirm the request is yours. We will keep what we still need for an open
            order, a payment dispute, or tax and bookkeeping records.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-4xl font-medium">Children</h2>
          <p className="mt-4 leading-8">
            This site is for people ordering desserts. We do not knowingly collect information from
            children under 13. If you believe a child sent us information, contact us and we will
            delete it.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-4xl font-medium">Security</h2>
          <p className="mt-4 leading-8">
            Access to customer information is limited to the people who bake, deliver, and answer
            the bakery. Card numbers are entered on Stripe’s page, not on ours. No method of
            sending information over the internet is perfectly secure.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-4xl font-medium">Changes</h2>
          <p className="mt-4 leading-8">
            If this policy changes, we will post the new version on this page and update the date
            at the top. The version on this page is the one that applies.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-4xl font-medium">Contact</h2>
          <p className="mt-4 leading-8">
            Sweet and Sour
            <br />
            {settings.serviceArea}
            <br />
            <a className="underline underline-offset-4" href={`mailto:${settings.email}`}>
              {settings.email}
            </a>
            <br />
            <a className="underline underline-offset-4" href={`tel:${settings.phoneTel}`}>
              {settings.phoneDisplay}
            </a>
          </p>
        </section>
      </article>
    </div>
  );
}
