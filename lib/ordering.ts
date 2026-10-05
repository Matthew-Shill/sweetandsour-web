import { formatList, formatMoney, formatPickupDays } from "@/lib/format";
import type { Settings } from "@/lib/types";

export type Fact = {
  title: string;
  body: string;
};

export function orderingFacts(settings: Settings): Fact[] {
  const minimum =
    settings.deliveryMinimumCents > 0
      ? ` Orders for delivery start at ${formatMoney(settings.deliveryMinimumCents)}.`
      : "";

  return [
    {
      title: "Lead time",
      body: `Place a standard order at least ${settings.leadDays} full days ahead. Timing follows Rochester time.`,
    },
    {
      title: "Ready days",
      body: `${formatPickupDays(settings.pickupDays)}, ${settings.pickupWindow}`,
    },
    {
      title: "Pickup",
      body: `${settings.serviceArea}. ${settings.pickupNote} Pickup is free.`,
    },
    {
      title: "Delivery",
      body: `${formatMoney(settings.deliveryFeeCents)} in ${formatList(settings.deliveryTowns)}.${minimum} We do not ship.`,
    },
    {
      title: "Weddings and events",
      body: `Use the inquiry form at least ${settings.eventLeadWeeks} weeks ahead. There is no payment on that form.`,
    },
    {
      title: "Payment",
      body: "Check out as a guest. No account. We do not add a card surcharge.",
    },
  ];
}

export function buildFaqs(settings: Settings) {
  const days = formatPickupDays(settings.pickupDays);
  return [
    {
      q: "How far ahead do I need to order?",
      a: `Standard menu orders need ${settings.leadDays} full days. Choose a ${days} ready day. Weddings and events should start at least ${settings.eventLeadWeeks} weeks out. If a holiday is close, write sooner. If your date is tighter than that, ask anyway and we will tell you if we can bake it.`,
    },
    {
      q: "Where do I pick up, and do you deliver?",
      a: `Pickup is in ${settings.serviceArea}, ${days}, ${settings.pickupWindow} ${settings.pickupNote} Pickup is free. Local delivery is ${formatMoney(settings.deliveryFeeCents)} in ${formatList(settings.deliveryTowns)}, with a ${formatMoney(settings.deliveryMinimumCents)} minimum. We do not ship boxes.`,
    },
    {
      q: "Do I need an account?",
      a: "No. Add what you want, choose pickup or delivery, and pay as a guest.",
    },
    {
      q: "What will I be charged?",
      a: `You pay the menu price. Pickup adds nothing. Delivery adds ${formatMoney(settings.deliveryFeeCents)} inside our towns. We do not add a service fee or a card surcharge. Card payments run through Stripe, and the bakery pays Stripe's processing fee (about 2.9% plus 30¢ on a standard online card). New York sales tax is not added yet. We will turn tax on only after a New York registration is active.`,
    },
    {
      q: "Can you bake for a wedding?",
      a: `Yes. Send the date, place, guest count, and the desserts you have in mind. We reply with what we can bake and a quote. Please start at least ${settings.eventLeadWeeks} weeks ahead. Everyday orders still go through Order Online.`,
    },
    {
      q: "Are the desserts gluten-free?",
      a: "No. Sourdough is still wheat. Most cookies, cakes, breads, and morning bakes start with a slow-fed sourdough starter. Rice Krispie treats are the exception: they are handmade here without sourdough. The kitchen handles wheat, dairy, eggs, peanuts, and may handle tree nuts. Read the note on each item, and tell us about allergies in the order notes.",
    },
    {
      q: "Can I change or cancel?",
      a: settings.changePolicy,
    },
    {
      q: "What are your hours?",
      a: settings.hours.map((line) => `${line.label}: ${line.value}`).join(" "),
    },
  ];
}
