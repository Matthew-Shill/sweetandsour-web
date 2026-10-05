import type { Metadata } from "next";
import { connection } from "next/server";
import { CheckoutForm } from "@/components/checkout-form";
import { OrderingPanel } from "@/components/ordering-panel";
import { loadMenu, loadSettings } from "@/lib/content";
import { paymentsMode } from "@/lib/stripe";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Choose pickup or Rochester-area delivery and pay for your Sweet and Sour order.",
};

export default async function CheckoutPage() {
  await connection();
  const [menu, settings] = await Promise.all([loadMenu(), loadSettings()]);

  return (
    <div className="px-5 py-14 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <p className="eyebrow">Checkout</p>
        <h1 className="mt-3 font-display text-5xl font-medium sm:text-6xl">Almost in the oven</h1>
        <p className="mt-5 max-w-2xl leading-8">
          Tell us when you need the order, and whether you will pick it up or want it delivered.
          Then you pay as a guest. No account.
        </p>
        <div className="mt-8">
          <OrderingPanel settings={settings} />
        </div>
        <div className="mt-10">
          <CheckoutForm menu={menu} settings={settings} payments={paymentsMode()} />
        </div>
      </div>
    </div>
  );
}
