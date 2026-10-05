import { earliestReadyDate, isISODate, weekdayOfISO } from "@/lib/dates";
import { formatMoney, formatPickupDays } from "@/lib/format";
import type { CartLine, Product, Settings } from "@/lib/types";

export type PricedLine = {
  productId: string;
  optionId: string;
  name: string;
  optionLabel: string;
  quantity: number;
  unitAmount: number;
};

export type PricedCart = {
  lines: PricedLine[];
  missing: string[];
  subtotalCents: number;
};

export type CheckoutInput = {
  lines: CartLine[];
  name: string;
  email: string;
  phone: string;
  fulfillment: "pickup" | "delivery";
  date: string;
  town: string;
  street: string;
  zip: string;
  notes: string;
};

export type Quote = {
  lines: PricedLine[];
  subtotalCents: number;
  deliveryCents: number;
  totalCents: number;
  fulfillment: "pickup" | "delivery";
  date: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function priceCart(lines: CartLine[], menu: Product[]): PricedCart {
  const priced: PricedLine[] = [];
  const missing: string[] = [];
  const merged = new Map<string, CartLine>();

  for (const line of lines) {
    const key = `${line.productId}:${line.optionId}`;
    const current = merged.get(key);
    const quantity = Number(line.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) continue;
    merged.set(key, {
      productId: line.productId,
      optionId: line.optionId,
      quantity: (current?.quantity ?? 0) + quantity,
    });
  }

  for (const line of merged.values()) {
    const product = menu.find((item) => item.id === line.productId);
    const option = product?.options.find((item) => item.id === line.optionId);
    if (!product || !option || product.availability === "hidden") {
      missing.push("An item in your order is no longer on the menu.");
      continue;
    }
    if (product.availability === "sold-out") {
      missing.push(`${product.name} is sold out.`);
      continue;
    }
    if (line.quantity > 24) {
      missing.push(`${product.name} is limited to 24 of one choice. For more, use the weddings form.`);
      continue;
    }
    priced.push({
      productId: product.id,
      optionId: option.id,
      name: product.name,
      optionLabel: option.label,
      quantity: line.quantity,
      unitAmount: option.priceCents,
    });
  }

  const subtotalCents = priced.reduce(
    (sum, line) => sum + line.unitAmount * line.quantity,
    0,
  );

  return { lines: priced, missing: [...new Set(missing)], subtotalCents };
}

export function normalizeCheckout(value: unknown): CheckoutInput {
  const record =
    typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
  const text = (key: string) => (typeof record[key] === "string" ? record[key] : "");
  const lines = Array.isArray(record.lines)
    ? record.lines.flatMap((line) => {
        if (typeof line !== "object" || line === null) return [];
        const item = line as Record<string, unknown>;
        if (typeof item.productId !== "string" || typeof item.optionId !== "string") return [];
        return [
          {
            productId: item.productId,
            optionId: item.optionId,
            quantity: Number(item.quantity),
          },
        ];
      })
    : [];

  return {
    lines,
    name: text("name"),
    email: text("email"),
    phone: text("phone"),
    fulfillment: record.fulfillment === "delivery" ? "delivery" : "pickup",
    date: text("date"),
    town: text("town"),
    street: text("street"),
    zip: text("zip"),
    notes: text("notes"),
  };
}

export function quoteOrder(
  input: CheckoutInput,
  menu: Product[],
  settings: Settings,
  now = new Date(),
): { ok: true; quote: Quote } | { ok: false; error: string } {
  if (!Array.isArray(input.lines) || input.lines.length === 0) {
    return { ok: false, error: "Your order is empty." };
  }
  if (input.lines.length > 15) {
    return { ok: false, error: "That is more lines than we can take in one order. Split it, or write to us." };
  }

  const priced = priceCart(input.lines, menu);
  if (priced.missing.length > 0) return { ok: false, error: priced.missing[0] };
  if (priced.lines.length === 0) return { ok: false, error: "Your order is empty." };

  const name = input.name.trim();
  const email = input.email.trim();
  const phone = input.phone.trim();
  const notes = input.notes.trim();

  if (name.length < 2 || name.length > 80) {
    return { ok: false, error: "Enter the name for the order." };
  }
  if (!EMAIL.test(email) || email.length > 120) {
    return { ok: false, error: "Enter a real email so we can confirm the order." };
  }
  if (phone.replace(/\D/g, "").length < 10 || phone.length > 30) {
    return { ok: false, error: "Enter a phone number we can reach." };
  }
  if (notes.length > 400) {
    return { ok: false, error: "Shorten the note to 400 characters." };
  }
  if (input.fulfillment !== "pickup" && input.fulfillment !== "delivery") {
    return { ok: false, error: "Choose pickup or delivery." };
  }
  if (!isISODate(input.date)) {
    return { ok: false, error: "Choose a ready date." };
  }

  const earliest = earliestReadyDate(settings.leadDays, now);
  if (input.date < earliest) {
    return {
      ok: false,
      error: `That day is too soon. The earliest ready day is ${settings.leadDays} full days from today.`,
    };
  }
  if (!settings.pickupDays.includes(weekdayOfISO(input.date))) {
    return {
      ok: false,
      error: `Choose a ${formatPickupDays(settings.pickupDays)} ready day.`,
    };
  }

  let address = "";
  let deliveryCents = 0;

  if (input.fulfillment === "delivery") {
    const town = settings.deliveryTowns.find(
      (item) => item.toLowerCase() === input.town.trim().toLowerCase(),
    );
    if (!town) {
      return {
        ok: false,
        error: "Delivery stays inside our Rochester-area towns. Choose one, or pick up.",
      };
    }
    const street = input.street.trim();
    const zip = input.zip.trim();
    if (street.length < 4 || street.length > 120) {
      return { ok: false, error: "Enter the street address for delivery." };
    }
    if (!/^\d{5}(-\d{4})?$/.test(zip)) {
      return { ok: false, error: "Enter a 5-digit ZIP code." };
    }
    if (priced.subtotalCents < settings.deliveryMinimumCents) {
      return {
        ok: false,
        error: `Delivery starts at ${formatMoney(settings.deliveryMinimumCents)} before the delivery fee. Add a little more, or choose pickup.`,
      };
    }
    address = `${street}, ${town}, NY ${zip}`;
    deliveryCents = settings.deliveryFeeCents;
  } else if (priced.subtotalCents < settings.pickupMinimumCents) {
    return {
      ok: false,
      error: `Pickup orders start at ${formatMoney(settings.pickupMinimumCents)}.`,
    };
  }

  return {
    ok: true,
    quote: {
      lines: priced.lines,
      subtotalCents: priced.subtotalCents,
      deliveryCents,
      totalCents: priced.subtotalCents + deliveryCents,
      fulfillment: input.fulfillment,
      date: input.date,
      name,
      email,
      phone,
      address,
      notes,
    },
  };
}
