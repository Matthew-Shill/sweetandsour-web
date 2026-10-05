export const TIME_ZONE = "America/New_York";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function zonedTodayISO(now = new Date(), timeZone = TIME_ZONE) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function addISODays(iso: string, days: number) {
  const [year, month, day] = iso.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day));
  utc.setUTCDate(utc.getUTCDate() + days);
  return utc.toISOString().slice(0, 10);
}

export function isISODate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day));
  return (
    utc.getUTCFullYear() === year &&
    utc.getUTCMonth() === month - 1 &&
    utc.getUTCDate() === day
  );
}

export function weekdayOfISO(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export function earliestReadyDate(leadDays: number, now = new Date()) {
  return addISODays(zonedTodayISO(now), leadDays);
}

export function nextReadyDate(leadDays: number, pickupDays: number[], now = new Date()) {
  let iso = earliestReadyDate(leadDays, now);
  for (let index = 0; index < 14; index += 1) {
    if (pickupDays.includes(weekdayOfISO(iso))) return iso;
    iso = addISODays(iso, 1);
  }
  return earliestReadyDate(leadDays, now);
}

export function formatISODate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function dayName(index: number) {
  return DAY_NAMES[index] ?? "Day";
}
