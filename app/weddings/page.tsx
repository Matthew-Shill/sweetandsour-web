import type { Metadata } from "next";
import { connection } from "next/server";
import { ProductPhoto } from "@/components/product-photo";
import { WeddingForm } from "@/components/wedding-form";
import { loadMenu, loadSettings, visibleMenu } from "@/lib/content";

export const metadata: Metadata = {
  title: "Weddings & Events",
  description:
    "Plan wedding and event desserts with Sweet and Sour in Rochester, NY. Share the date, location, guest count, and what you would like served.",
};

const featureIds = ["cinnamon-rolls", "cookies", "cupcakes", "cake-pops", "brownies", "lemon-loaf"];

export default async function WeddingsPage() {
  await connection();
  const [menu, settings] = await Promise.all([loadMenu(), loadSettings()]);
  const features = featureIds.flatMap((id) =>
    visibleMenu(menu).filter((product) => product.id === id),
  );

  return (
    <div className="px-5 py-14 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <p className="eyebrow">Weddings & Events</p>
        <h1 className="mt-3 max-w-3xl font-display text-5xl font-medium sm:text-6xl">
          Sweet endings, baked for the room.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8">
          We bake dessert tables and take-home sweets for weddings and gatherings around Rochester.
          Tell us the date, the place, how many guests, and what you hope to serve. We will write
          back with what we can bake and a quote.
        </p>
        <div className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {features.map((product, index) => (
            <figure
              key={product.id}
              className={index === 0 ? "relative col-span-2 row-span-2" : "relative"}
            >
              <ProductPhoto
                product={product}
                className={index === 0 ? "aspect-[4/5] lg:aspect-auto lg:h-full lg:min-h-[28rem]" : "aspect-[4/5]"}
                sizes={index === 0 ? "(min-width: 1024px) 48vw, 100vw" : "(min-width: 1024px) 24vw, 50vw"}
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent p-4 font-display text-2xl text-white sm:text-3xl">
                {product.name}
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div>
            <h2 className="font-display text-4xl font-medium">What to send</h2>
            <ul className="mt-5 space-y-3 leading-7">
              <li>The event date and the town or venue.</li>
              <li>About how many guests you are feeding.</li>
              <li>The desserts you keep coming back to, or the feeling you want on the table.</li>
            </ul>
            <p className="mt-6 text-sm leading-6">
              Please inquire at least {settings.eventLeadWeeks} weeks ahead. Everyday orders still
              go through Order Online. This form does not take a payment.
            </p>
          </div>
          <div className="bg-paper p-5 sm:p-8">
            <h2 className="font-display text-4xl font-medium">Inquiry</h2>
            <div className="mt-6">
              <WeddingForm email={settings.email} eventLeadWeeks={settings.eventLeadWeeks} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
