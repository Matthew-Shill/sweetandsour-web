import { dayName } from "@/lib/dates";

export function formatMoney(cents: number) {
  const amount = cents / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatList(items: string[]) {
  if (items.length <= 1) return items[0] ?? "";
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

export function formatPickupDays(days: number[]) {
  const sorted = [...new Set(days)].sort(
    (a, b) => WEEK_ORDER.indexOf(a) - WEEK_ORDER.indexOf(b),
  );
  return formatList(sorted.map((day) => dayName(day)));
}

export function fromPrice(options: { priceCents: number }[]) {
  return Math.min(...options.map((option) => option.priceCents));
}

export function dollarsToCents(value: string) {
  const trimmed = value.trim();
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return null;
  return Math.round(Number(trimmed) * 100);
}

export function centsToDollarInput(cents: number) {
  return (cents / 100).toFixed(cents % 100 === 0 ? 0 : 2);
}
