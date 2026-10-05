import type { Metadata } from "next";
import { connection } from "next/server";
import { MenuBrowser } from "@/components/menu-browser";
import { OrderingPanel } from "@/components/ordering-panel";
import { ProductPhoto } from "@/components/product-photo";
import { loadMenu, loadSettings, visibleMenu } from "@/lib/content";

export const metadata: Metadata = {
  title: "Order Online",
  description:
    "Order handmade sourdough desserts from Sweet and Sour in Rochester, NY. Cookies, cinnamon rolls, cakes, and more, baked to order for pickup or local delivery.",
};

export default async function MenuPage() {
  await connection();
  const [menu, settings] = await Promise.all([loadMenu(), loadSettings()]);
  const products = visibleMenu(menu);
  const lead = products.find((product) => product.id === "cinnamon-rolls") ?? products[0];

  return (
    <div className="px-5 py-14 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-end gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="eyebrow">Menu / Shop</p>
            <h1 className="mt-3 max-w-3xl font-display text-5xl font-medium sm:text-6xl">
              Order online
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8">
              Choose a size, add it to your order, and check out as a guest. Most of the menu starts
              with a slow-fed sourdough starter. Rice Krispie treats are handmade here without it.
            </p>
            <div className="mt-8">
              <OrderingPanel settings={settings} />
            </div>
            <p className="mt-6 max-w-2xl text-sm leading-6">
              Our kitchen handles wheat, dairy, eggs, and peanuts, and may handle tree nuts. These
              desserts are not gluten-free. For more than 24 of one choice, or for a wedding, use the
              events form.
            </p>
          </div>
          {lead ? (
            <div className="lg:col-span-5">
              <ProductPhoto
                product={lead}
                priority
                className="aspect-[4/5]"
                sizes="(min-width: 1024px) 36vw, 100vw"
              />
              <p className="mt-3 font-display text-3xl">{lead.name}</p>
            </div>
          ) : null}
        </div>
        <div className="mt-10">
          <MenuBrowser products={products} />
        </div>
      </div>
    </div>
  );
}
