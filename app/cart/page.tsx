import type { Metadata } from "next";
import { connection } from "next/server";
import { CartView } from "@/components/cart-view";
import { loadMenu, loadSettings } from "@/lib/content";

export const metadata: Metadata = {
  title: "Your order",
  description: "Review your Sweet and Sour order before checkout.",
};

export default async function CartPage() {
  await connection();
  const [menu, settings] = await Promise.all([loadMenu(), loadSettings()]);

  return (
    <div className="px-5 py-14 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <p className="eyebrow">Cart</p>
        <h1 className="mt-3 font-display text-5xl font-medium sm:text-6xl">Your order</h1>
        <div className="mt-10">
          <CartView menu={menu} settings={settings} />
        </div>
      </div>
    </div>
  );
}
