import Stripe from "stripe";

// STRIPE_SECRET_KEY must be Sweet and Sour's own Stripe key.
// Leave it unset in the demo so checkout never charges another account.
export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, {
    apiVersion: "2026-07-29.dahlia",
  });
}

export function paymentsMode(): "test" | "live" | "off" {
  const key = process.env.STRIPE_SECRET_KEY ?? "";
  if (!key) return "off";
  if (key.startsWith("sk_test") || key.startsWith("rk_test")) return "test";
  return "live";
}

export const INTEGRATION_IDENTIFIER = "sweetandsour_bqwnrxlp";
