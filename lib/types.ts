export const CATEGORIES = [
  { id: "morning", label: "Morning bakes" },
  { id: "cookies", label: "Cookies" },
  { id: "bars", label: "Bars and bites" },
  { id: "cakes", label: "Cakes and cupcakes" },
  { id: "breads", label: "Breads and loaves" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export const ART_KEYS = [
  "roll",
  "sandwich",
  "cookie",
  "brownie",
  "blondie",
  "krispie",
  "whoopie",
  "cupcake",
  "muffin",
  "scone",
  "loaf",
  "coffee",
  "pound",
  "pop",
] as const;

export type ArtKey = (typeof ART_KEYS)[number];

export type Availability = "available" | "sold-out" | "hidden";

export type ProductOption = {
  id: string;
  label: string;
  priceCents: number;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  category: CategoryId;
  art: ArtKey;
  image: string;
  availability: Availability;
  allergens: string;
  options: ProductOption[];
};

export type HoursLine = {
  label: string;
  value: string;
};

export type SocialLink = {
  label: string;
  href: string;
};

export type Settings = {
  phoneDisplay: string;
  phoneTel: string;
  email: string;
  serviceArea: string;
  pickupNote: string;
  hours: HoursLine[];
  replyNote: string;
  leadDays: number;
  eventLeadWeeks: number;
  pickupDays: number[];
  pickupWindow: string;
  deliveryFeeCents: number;
  deliveryMinimumCents: number;
  pickupMinimumCents: number;
  deliveryTowns: string[];
  socials: SocialLink[];
  changePolicy: string;
};

export type CartLine = {
  productId: string;
  optionId: string;
  quantity: number;
};
