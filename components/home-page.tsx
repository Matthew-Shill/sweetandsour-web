import Link from "next/link";
import { ContactForm } from "@/components/contact-form";
import { ProductPhoto } from "@/components/product-photo";
import { formatMoney, fromPrice } from "@/lib/format";
import { buildFaqs } from "@/lib/ordering";
import { CATEGORIES, type Product, type Settings } from "@/lib/types";

const boardIds = ["cinnamon-rolls", "chocolate-chip-cookies", "brownies", "lemon-loaf"];
const galleryIds = [
  "cinnamon-rolls",
  "oatmeal-cream-pies",
  "cupcakes",
  "pound-cake",
  "whoopie-pies",
  "cake-pops",
];
const priceIds = ["pound-cake", "whoopie-pies", "cake-pops", "banana-bread"];

function Actions({ tone = "blush" }: { tone?: "blush" | "ink" }) {
  const primary = tone === "ink" ? "btn btn-on-ink w-full sm:w-auto" : "btn btn-primary w-full sm:w-auto";
  const secondary =
    tone === "ink" ? "btn btn-on-ink-ghost w-full sm:w-auto" : "btn btn-secondary w-full sm:w-auto";
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <Link href="/menu" className={primary}>
        Order Online
      </Link>
      <Link href="/weddings" className={secondary}>
        Inquire About Weddings & Events
      </Link>
    </div>
  );
}

function byId(menu: Product[], id: string) {
  return menu.find((product) => product.id === id);
}

export function HomePage({ menu, settings }: { menu: Product[]; settings: Settings }) {
  const visible = menu.filter((product) => product.availability !== "hidden");
  const board = boardIds.flatMap((id) => visible.filter((product) => product.id === id));
  const gallery = galleryIds.flatMap((id) => visible.filter((product) => product.id === id));
  const pricePhotos = priceIds.flatMap((id) => visible.filter((product) => product.id === id));
  const story = byId(visible, "banana-bread");
  const hello = byId(visible, "cupcakes");
  const stepsPhoto = byId(visible, "muffins");
  const faqPhoto = byId(visible, "cookies");
  const weddingPhoto = byId(visible, "cake-pops");
  const faqs = buildFaqs(settings);
  const [lead, ...boardRest] = board;

  return (
    <>
      <section className="px-5 pt-6 pb-16 sm:px-8 sm:pt-8 sm:pb-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="eyebrow">Rochester, NY</p>
            <h1 className="mt-4 font-display text-6xl font-medium leading-[0.92] sm:text-7xl lg:text-8xl">
              Baked slow.
              <span className="mt-1 block italic">Made sweet.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8">
              Handmade sourdough desserts, baked in small batches and made to order. For a Tuesday
              treat, a party box, or the sweet table at a wedding.
            </p>
            <div className="mt-8">
              <Actions />
            </div>
            <p className="mt-6 text-sm">
              Or call{" "}
              <a className="underline underline-offset-4" href={`tel:${settings.phoneTel}`}>
                {settings.phoneDisplay}
              </a>
            </p>
          </div>
          {lead ? (
            <aside className="lg:col-span-6">
              <p className="eyebrow">From the board</p>
              <Link href={`/menu#${lead.id}`} className="group relative mt-4 block overflow-hidden">
                <ProductPhoto
                  product={lead}
                  priority
                  className="aspect-[4/5] w-full sm:aspect-[5/4] lg:aspect-[3/2] lg:max-h-[calc(100svh-30rem)]"
                  sizes="(min-width: 1024px) 46vw, 100vw"
                />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent p-5 text-white">
                  <span className="block font-display text-4xl leading-none">{lead.name}</span>
                  <span className="mt-2 block text-sm">
                    from {formatMoney(fromPrice(lead.options))}
                  </span>
                </span>
              </Link>
              <ul className="mt-3 grid grid-cols-3 gap-3">
                {boardRest.map((product) => (
                  <li key={product.id}>
                    <Link href={`/menu#${product.id}`} className="group block">
                      <ProductPhoto
                        product={product}
                        className="aspect-square"
                        sizes="(min-width: 1024px) 15vw, 30vw"
                      />
                      <span className="mt-2 block font-display text-lg leading-tight sm:text-xl">
                        {product.name}
                      </span>
                      <span className="text-xs">from {formatMoney(fromPrice(product.options))}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          ) : null}
        </div>
      </section>

      <section id="about" className="bg-paper px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="eyebrow">Our story</p>
            <h2 className="mt-3 font-display text-4xl font-medium sm:text-5xl">
              Small batches, baked when you ask.
            </h2>
            <div className="mt-6 max-w-xl space-y-4 text-base leading-8">
              <p>
                Sweet and Sour started with a sourdough starter and a soft spot for dessert. We
                bake slowly, in small batches, and only when someone asks. That might be cinnamon
                rolls for Sunday, a few dozen cookies for a party, or a table of sweets for a
                wedding in Rochester.
              </p>
              <p>
                Every order is made to order. The starter is fed, the dough gets time, and the tray
                is finished with care. Nothing waits in a case for a stranger. It is baked for you.
              </p>
            </div>
            <h3 className="mt-10 font-display text-3xl font-medium">Why people come back</h3>
            <ul className="mt-4 max-w-xl space-y-3 text-base leading-7">
              <li>Handmade, one tray at a time.</li>
              <li>Sourdough at the heart of the baking.</li>
              <li>Made to order, so the sweets are fresh.</li>
              <li>Personal attention on every order, from a single cookie to a wedding.</li>
            </ul>
          </div>
          {story ? (
            <div className="lg:col-span-5">
              <Link href={`/menu#${story.id}`} className="group block">
                <ProductPhoto
                  product={story}
                  className="aspect-[4/5]"
                  sizes="(min-width: 1024px) 36vw, 100vw"
                />
                <span className="mt-3 block font-display text-3xl">{story.name}</span>
                <span className="text-sm">A loaf from the bread board</span>
              </Link>
            </div>
          ) : null}
        </div>
      </section>

      <section id="contact" className="px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Say hello</p>
            <h2 className="mt-3 font-display text-4xl font-medium sm:text-5xl">Questions are welcome.</h2>
            <p className="mt-6 max-w-md leading-8">
              Ask about a flavor, a date, or a big order. For a wedding or event, the inquiry form
              is the better path. We reply within one business day.
            </p>
            <p className="mt-6 text-sm leading-7">
              <a className="underline underline-offset-4" href={`tel:${settings.phoneTel}`}>
                {settings.phoneDisplay}
              </a>
              <br />
              <a className="underline underline-offset-4" href={`mailto:${settings.email}`}>
                {settings.email}
              </a>
            </p>
            {hello ? (
              <Link href={`/menu#${hello.id}`} className="mt-8 block max-w-md">
                <ProductPhoto product={hello} className="aspect-[16/10]" sizes="(min-width: 1024px) 40vw, 100vw" />
                <span className="mt-3 block font-display text-2xl">{hello.name}</span>
              </Link>
            ) : null}
          </div>
          <ContactForm email={settings.email} />
        </div>
      </section>

      <section id="order" className="on-ink bg-ink px-5 py-16 text-white sm:px-8 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-semibold tracking-[0.16em] text-blush uppercase">When you are ready</p>
          <h2 className="mt-3 max-w-2xl font-display text-4xl font-medium text-white sm:text-6xl">
            Order a box for the weekend, or start a wedding conversation.
          </h2>
          <p className="mt-6 max-w-xl text-base leading-8 text-white">
            We only take as many orders as we can give real attention. Checkout is a guest
            checkout. No account, and no extra steps once you know what you want.
          </p>
          <div className="mt-8">
            <Actions tone="ink" />
          </div>
        </div>
      </section>

      <section id="gallery" className="px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="eyebrow">The baking</p>
          <h2 className="mt-3 font-display text-4xl font-medium sm:text-5xl">A look at the menu</h2>
          <div className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {gallery.map((product, index) => (
              <Link
                key={product.id}
                href={`/menu#${product.id}`}
                className={
                  index === 0
                    ? "group relative col-span-2 row-span-2 block overflow-hidden"
                    : "group relative block overflow-hidden"
                }
              >
                <ProductPhoto
                  product={product}
                  className={index === 0 ? "aspect-[4/5] lg:aspect-auto lg:h-full lg:min-h-[32rem]" : "aspect-[4/5]"}
                  sizes={index === 0 ? "(min-width: 1024px) 48vw, 100vw" : "(min-width: 1024px) 24vw, 50vw"}
                />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent p-4 font-display text-2xl text-white sm:text-3xl">
                  {product.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="offerings" className="bg-paper px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="eyebrow">What we bake</p>
          <h2 className="mt-3 font-display text-4xl font-medium sm:text-5xl">Sweets for the week, and for the day that matters.</h2>
          <p className="mt-6 max-w-2xl leading-8">
            Single orders live on the menu and can be paid online. Weddings and events start with
            a conversation, then a quote.
          </p>
          <div className="mt-10 grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((category) => {
              const items = visible.filter((product) => product.category === category.id);
              const photo = items.find((product) => product.image) ?? items[0];
              if (!photo) return null;
              return (
                <div key={category.id}>
                  <Link href={`/menu#${photo.id}`} className="block" aria-label={photo.name}>
                    <ProductPhoto product={photo} className="aspect-[5/4]" sizes="(min-width: 1024px) 30vw, 100vw" />
                  </Link>
                  <h3 className="mt-4 font-display text-3xl font-medium">{category.label}</h3>
                  <ul className="mt-3 space-y-2">
                    {items.map((product) => (
                      <li key={product.id}>
                        <Link href={`/menu#${product.id}`} className="underline-offset-4 hover:underline">
                          {product.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
            <div>
              {weddingPhoto ? (
                <Link href="/weddings" className="block" aria-label="Weddings and events">
                  <ProductPhoto
                    product={weddingPhoto}
                    className="aspect-[5/4]"
                    sizes="(min-width: 1024px) 30vw, 100vw"
                  />
                </Link>
              ) : null}
              <h3 className="mt-4 font-display text-3xl font-medium">Weddings and events</h3>
              <p className="mt-3 leading-7">
                Dessert tables, cookie boxes, and celebration sweets for gatherings around Rochester.
              </p>
              <Link href="/weddings" className="mt-4 inline-block underline underline-offset-4">
                Inquire About Weddings & Events
              </Link>
            </div>
          </div>
          <p className="mt-8 text-sm">Pack sizes, flavors, and prices are on the menu.</p>
        </div>
      </section>

      <section id="pricing" className="px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="eyebrow">Pricing</p>
          <h2 className="mt-3 font-display text-4xl font-medium sm:text-5xl">Simple prices. One delivery fee.</h2>
          <p className="mt-6 max-w-2xl leading-8">
            You pay the menu price. Pickup adds nothing. Delivery inside our towns adds{" "}
            {formatMoney(settings.deliveryFeeCents)}. There is no service fee and no card surcharge.
            Pack sizes and flavors are on each item.
          </p>
          <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {pricePhotos.map((product) => (
              <li key={product.id}>
                <Link href={`/menu#${product.id}`} className="block">
                  <ProductPhoto product={product} className="aspect-square" sizes="(min-width: 640px) 22vw, 45vw" />
                  <span className="mt-2 block font-display text-xl leading-tight">{product.name}</span>
                </Link>
              </li>
            ))}
          </ul>
          <ul className="mt-10 grid gap-x-12 sm:grid-cols-2">
            {visible.map((product) => (
              <li key={product.id} className="flex items-baseline justify-between gap-4 border-b border-black/10 py-3">
                <Link href={`/menu#${product.id}`} className="underline-offset-4 hover:underline">
                  {product.name}
                </Link>
                <span className="text-sm">from {formatMoney(fromPrice(product.options))}</span>
              </li>
            ))}
            <li className="flex items-baseline justify-between gap-4 border-b border-black/10 py-3">
              <span>Pickup</span>
              <span className="text-sm">Free</span>
            </li>
            <li className="flex items-baseline justify-between gap-4 border-b border-black/10 py-3">
              <span>Rochester-area delivery</span>
              <span className="text-sm">{formatMoney(settings.deliveryFeeCents)}</span>
            </li>
            <li className="flex items-baseline justify-between gap-4 border-b border-black/10 py-3">
              <Link href="/weddings" className="underline-offset-4 hover:underline">
                Weddings and events
              </Link>
              <span className="text-sm">Custom quote</span>
            </li>
          </ul>
        </div>
      </section>

      <section id="how-it-works" className="bg-paper px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-12">
          {stepsPhoto ? (
            <div className="lg:col-span-5">
              <Link href={`/menu#${stepsPhoto.id}`} className="block">
                <ProductPhoto
                  product={stepsPhoto}
                  className="aspect-[4/5]"
                  sizes="(min-width: 1024px) 36vw, 100vw"
                />
                <span className="mt-3 block font-display text-3xl">{stepsPhoto.name}</span>
              </Link>
            </div>
          ) : null}
          <div className={stepsPhoto ? "lg:col-span-7" : "lg:col-span-12"}>
            <p className="eyebrow">How it works</p>
            <h2 className="mt-3 font-display text-4xl font-medium sm:text-5xl">From the first note to the box.</h2>
            <ol className="mt-8 grid gap-8 sm:grid-cols-2">
              {[
                {
                  step: "01",
                  title: "Choose the sweets",
                  body: "Browse the menu, pick a size, and add it to your order. For a wedding, start with the inquiry form instead.",
                },
                {
                  step: "02",
                  title: "Pick a day we can bake",
                  body: `Standard orders need ${settings.leadDays} full days, on a day we deliver and do pickup.`,
                },
                {
                  step: "03",
                  title: "Check out as a guest",
                  body: "Choose pickup or local delivery, then pay on a secure page. No account.",
                },
                {
                  step: "04",
                  title: "We bake, then you collect",
                  body: "We email to confirm the Rochester pickup spot or the delivery window.",
                },
              ].map((item) => (
                <li key={item.step}>
                  <p className="font-display text-4xl text-accent">{item.step}</p>
                  <h3 className="mt-2 font-display text-3xl font-medium">{item.title}</h3>
                  <p className="mt-2 leading-7">{item.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section id="faq" className="px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow">Questions</p>
            <h2 className="mt-3 font-display text-4xl font-medium sm:text-5xl">Before you order</h2>
            {faqPhoto ? (
              <Link href={`/menu#${faqPhoto.id}`} className="mt-6 block">
                <ProductPhoto product={faqPhoto} className="aspect-[4/3]" sizes="(min-width: 1024px) 28vw, 100vw" />
                <span className="mt-3 block font-display text-2xl">{faqPhoto.name}</span>
              </Link>
            ) : null}
          </div>
          <div className="faq lg:col-span-8">
            {faqs.map((faq) => (
              <details key={faq.q}>
                <summary>{faq.q}</summary>
                <p className="pb-5 leading-7">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
