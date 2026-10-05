import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  ART_KEYS,
  CATEGORIES,
  type Availability,
  type Product,
  type Settings,
} from "@/lib/types";

const menuPath = path.join(process.cwd(), "content", "menu.json");
const settingsPath = path.join(process.cwd(), "content", "settings.json");

const categoryIds = new Set<string>(CATEGORIES.map((category) => category.id));
const artKeys = new Set<string>(ART_KEYS);
const availability = new Set<Availability>(["available", "sold-out", "hidden"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredString(value: unknown, label: string, max: number) {
  if (typeof value !== "string") throw new Error(`${label} must be text.`);
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > max) {
    throw new Error(`${label} needs to be between 1 and ${max} characters.`);
  }
  return trimmed;
}

function optionalImage(value: unknown) {
  if (typeof value !== "string" || value.trim() === "") return "";
  const image = value.trim();
  if (!/^\/menu\/[A-Za-z0-9._-]+$/.test(image)) {
    throw new Error("Photos must live in /menu/ and use a simple file name.");
  }
  return image;
}

export function parseMenu(value: unknown): Product[] {
  if (!Array.isArray(value)) throw new Error("The menu needs to be a list.");
  if (value.length < 1 || value.length > 80) {
    throw new Error("Keep the menu between 1 and 80 items.");
  }

  const ids = new Set<string>();
  return value.map((entry, index) => {
    if (!isRecord(entry)) throw new Error(`Item ${index + 1} is not valid.`);
    const id = requiredString(entry.id, "Item id", 48);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
      throw new Error(`"${id}" needs a simple id, like cinnamon-rolls.`);
    }
    if (ids.has(id)) throw new Error(`"${id}" is listed twice.`);
    ids.add(id);

    const category = requiredString(entry.category, `${id} category`, 20);
    if (!categoryIds.has(category)) throw new Error(`${id} has an unknown category.`);
    const art = requiredString(entry.art, `${id} drawing`, 20);
    if (!artKeys.has(art)) throw new Error(`${id} has an unknown drawing.`);
    const itemAvailability = requiredString(entry.availability, `${id} availability`, 20);
    if (!availability.has(itemAvailability as Availability)) {
      throw new Error(`${id} availability must be available, sold-out, or hidden.`);
    }
    if (!Array.isArray(entry.options) || entry.options.length < 1 || entry.options.length > 12) {
      throw new Error(`${id} needs between 1 and 12 choices.`);
    }

    const optionIds = new Set<string>();
    const options = entry.options.map((option) => {
      if (!isRecord(option)) throw new Error(`${id} has a broken choice.`);
      const optionId = requiredString(option.id, `${id} choice id`, 40);
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(optionId)) {
        throw new Error(`${id} has a choice id we cannot save.`);
      }
      if (optionIds.has(optionId)) throw new Error(`${id} repeats a choice.`);
      optionIds.add(optionId);
      const priceCents = option.priceCents;
      if (
        typeof priceCents !== "number" ||
        !Number.isInteger(priceCents) ||
        priceCents < 50 ||
        priceCents > 50000
      ) {
        throw new Error(`${id} prices must be between $0.50 and $500.`);
      }
      return {
        id: optionId,
        label: requiredString(option.label, `${id} choice label`, 60),
        priceCents,
      };
    });

    return {
      id,
      name: requiredString(entry.name, `${id} name`, 80),
      description: requiredString(entry.description, `${id} description`, 500),
      category: category as Product["category"],
      art: art as Product["art"],
      image: optionalImage(entry.image),
      availability: itemAvailability as Availability,
      allergens: typeof entry.allergens === "string" ? entry.allergens.trim().slice(0, 180) : "",
      options,
    };
  });
}

export function parseSettings(value: unknown): Settings {
  if (!isRecord(value)) throw new Error("Settings are not valid.");
  const leadDays = value.leadDays;
  const eventLeadWeeks = value.eventLeadWeeks;
  const deliveryFeeCents = value.deliveryFeeCents;
  const deliveryMinimumCents = value.deliveryMinimumCents;
  const pickupMinimumCents = value.pickupMinimumCents;

  if (!Number.isInteger(leadDays) || Number(leadDays) < 0 || Number(leadDays) > 30) {
    throw new Error("Lead time must be a whole number of days from 0 to 30.");
  }
  if (
    !Number.isInteger(eventLeadWeeks) ||
    Number(eventLeadWeeks) < 1 ||
    Number(eventLeadWeeks) > 52
  ) {
    throw new Error("Event lead time must be between 1 and 52 weeks.");
  }
  for (const [label, amount] of [
    ["Delivery fee", deliveryFeeCents],
    ["Delivery minimum", deliveryMinimumCents],
    ["Pickup minimum", pickupMinimumCents],
  ] as const) {
    if (typeof amount !== "number" || !Number.isInteger(amount) || amount < 0 || amount > 50000) {
      throw new Error(`${label} is not a valid amount.`);
    }
  }
  if (!Array.isArray(value.pickupDays) || value.pickupDays.length < 1) {
    throw new Error("Choose at least one ready day.");
  }
  const pickupDays = [...new Set(value.pickupDays)];
  if (pickupDays.some((day) => !Number.isInteger(day) || Number(day) < 0 || Number(day) > 6)) {
    throw new Error("Ready days are not valid.");
  }
  if (!Array.isArray(value.deliveryTowns) || value.deliveryTowns.length < 1) {
    throw new Error("Add at least one delivery town.");
  }
  const deliveryTowns = value.deliveryTowns.map((town, index) =>
    requiredString(town, `Town ${index + 1}`, 40),
  );
  if (!Array.isArray(value.hours) || value.hours.length < 1 || value.hours.length > 6) {
    throw new Error("Add the hours you want on the site.");
  }
  const hours = value.hours.map((line, index) => {
    if (!isRecord(line)) throw new Error(`Hours line ${index + 1} is not valid.`);
    return {
      label: requiredString(line.label, `Hours label ${index + 1}`, 60),
      value: requiredString(line.value, `Hours value ${index + 1}`, 120),
    };
  });
  const socials = Array.isArray(value.socials)
    ? value.socials.map((link, index) => {
        if (!isRecord(link)) throw new Error(`Social link ${index + 1} is not valid.`);
        const href = requiredString(link.href, `Social link ${index + 1}`, 200);
        if (!/^https:\/\/[^\s]+$/i.test(href)) {
          throw new Error("Social links need a full https address.");
        }
        return {
          label: requiredString(link.label, `Social label ${index + 1}`, 40),
          href,
        };
      })
    : [];

  const email = requiredString(value.email, "Email", 120);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Enter a real email address.");
  }

  const phoneTel = requiredString(value.phoneTel, "Phone link", 20);
  if (!/^\+\d{10,15}$/.test(phoneTel)) {
    throw new Error("The phone link should look like +15856453411.");
  }

  return {
    phoneDisplay: requiredString(value.phoneDisplay, "Phone", 30),
    phoneTel,
    email,
    serviceArea: requiredString(value.serviceArea, "Service area", 80),
    pickupNote: requiredString(value.pickupNote, "Pickup note", 240),
    hours,
    replyNote: requiredString(value.replyNote, "Reply note", 160),
    leadDays: Number(leadDays),
    eventLeadWeeks: Number(eventLeadWeeks),
    pickupDays: pickupDays.map(Number),
    pickupWindow: requiredString(value.pickupWindow, "Pickup window", 80),
    deliveryFeeCents: Number(deliveryFeeCents),
    deliveryMinimumCents: Number(deliveryMinimumCents),
    pickupMinimumCents: Number(pickupMinimumCents),
    deliveryTowns,
    socials,
    changePolicy: requiredString(value.changePolicy, "Change policy", 400),
  };
}

export async function loadMenu() {
  const raw = await readFile(menuPath, "utf8");
  return parseMenu(JSON.parse(raw));
}

export async function loadSettings() {
  const raw = await readFile(settingsPath, "utf8");
  return parseSettings(JSON.parse(raw));
}

export async function saveMenu(menu: Product[]) {
  const parsed = parseMenu(menu);
  await writeFile(menuPath, `${JSON.stringify(parsed, null, 2)}\n`, "utf8");
  return parsed;
}

export async function saveSettings(settings: Settings) {
  const parsed = parseSettings(settings);
  await writeFile(settingsPath, `${JSON.stringify(parsed, null, 2)}\n`, "utf8");
  return parsed;
}

export function visibleMenu(menu: Product[]) {
  return menu.filter((product) => product.availability !== "hidden");
}

export function categoryLabel(id: Product["category"]) {
  return CATEGORIES.find((category) => category.id === id)?.label ?? id;
}
