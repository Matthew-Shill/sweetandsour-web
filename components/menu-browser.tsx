"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ProductPhoto } from "@/components/product-photo";
import { useCart } from "@/components/cart-provider";
import { CATEGORIES, type Product } from "@/lib/types";
import { formatMoney, fromPrice } from "@/lib/format";

export function MenuBrowser({ products }: { products: Product[] }) {
  const { add } = useCart();
  const [category, setCategory] = useState<string>("all");
  const [choices, setChoices] = useState<Record<string, { optionId: string; quantity: number }>>({});
  const [notices, setNotices] = useState<Record<string, string>>({});

  const groups = useMemo(
    () =>
      CATEGORIES.map((item) => ({
        ...item,
        products: products.filter(
          (product) =>
            product.category === item.id && (category === "all" || category === item.id),
        ),
      })).filter((group) => group.products.length > 0),
    [products, category],
  );

  return (
    <div>
      <div
        className="-mx-5 flex gap-6 overflow-x-auto border-b border-black/15 px-5 sm:-mx-8 sm:px-8"
        role="group"
        aria-label="Menu categories"
      >
        <button
          type="button"
          aria-pressed={category === "all"}
          className={`shrink-0 border-b-2 pb-3 font-display text-2xl ${
            category === "all" ? "border-accent" : "border-transparent"
          }`}
          onClick={() => setCategory("all")}
        >
          All
        </button>
        {CATEGORIES.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={category === item.id}
            className={`shrink-0 border-b-2 pb-3 font-display text-2xl ${
              category === item.id ? "border-accent" : "border-transparent"
            }`}
            onClick={() => setCategory(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {groups.map((group) => (
        <section key={group.id} className="mt-14" aria-labelledby={`menu-${group.id}`}>
          <div className="flex items-end justify-between gap-4">
            <h2 id={`menu-${group.id}`} className="font-display text-4xl font-medium sm:text-5xl">
              {group.label}
            </h2>
            <p className="pb-1 text-sm">
              {group.products.length} {group.products.length === 1 ? "bake" : "bakes"}
            </p>
          </div>
          <div className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {group.products.map((product, index) => {
              const choice = choices[product.id] ?? {
                optionId: product.options[0]?.id ?? "",
                quantity: 1,
              };
              const option =
                product.options.find((item) => item.id === choice.optionId) ?? product.options[0];
              const soldOut = product.availability === "sold-out";
              const featured = index === 0;
              return (
                <article
                  key={product.id}
                  id={product.id}
                  className={
                    featured
                      ? "scroll-mt-8 flex flex-col sm:col-span-2 lg:col-span-3 lg:grid lg:grid-cols-2 lg:items-center lg:gap-10"
                      : "scroll-mt-8 flex flex-col"
                  }
                >
                  <div className="relative">
                    <ProductPhoto
                      product={product}
                      className={featured ? "aspect-[5/4] lg:aspect-[4/3]" : "aspect-[5/4]"}
                      sizes={
                        featured
                          ? "(min-width: 1024px) 46vw, 100vw"
                          : "(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 100vw"
                      }
                    />
                    <p className="absolute top-3 left-3 bg-blush px-2.5 py-1 text-xs font-semibold">
                      {soldOut ? "Sold out" : `from ${formatMoney(fromPrice(product.options))}`}
                    </p>
                  </div>
                  <div className="mt-4 flex flex-1 flex-col lg:mt-0">
                    <h3 className="font-display text-3xl font-medium sm:text-4xl">{product.name}</h3>
                    <p className="mt-2 text-sm leading-6">{product.description}</p>
                    {product.allergens ? (
                      <p className="mt-2 text-sm leading-6">Contains: {product.allergens}.</p>
                    ) : null}
                    <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_6.5rem]">
                      <label className="block text-sm font-semibold">
                        Choice
                        <select
                          className="field-input mt-2"
                          value={option?.id}
                          disabled={soldOut}
                          onChange={(event) =>
                            setChoices((current) => ({
                              ...current,
                              [product.id]: { ...choice, optionId: event.target.value },
                            }))
                          }
                        >
                          {product.options.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.label} · {formatMoney(item.priceCents)}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="block text-sm font-semibold">
                        Quantity
                        <input
                          className="field-input mt-2"
                          type="number"
                          min={1}
                          max={24}
                          inputMode="numeric"
                          value={choice.quantity}
                          disabled={soldOut}
                          onChange={(event) =>
                            setChoices((current) => ({
                              ...current,
                              [product.id]: {
                                ...choice,
                                quantity: Math.min(24, Math.max(1, Number(event.target.value) || 1)),
                              },
                            }))
                          }
                        />
                      </label>
                    </div>
                    <button
                      type="button"
                      className="btn btn-primary mt-4"
                      disabled={soldOut || !option}
                      onClick={() => {
                        if (!option) return;
                        add({
                          productId: product.id,
                          optionId: option.id,
                          quantity: choice.quantity,
                        });
                        setNotices((current) => ({
                          ...current,
                          [product.id]: `${product.name} added.`,
                        }));
                      }}
                    >
                      {soldOut
                        ? "Sold out"
                        : `Add to order${option ? ` · ${formatMoney(option.priceCents * choice.quantity)}` : ""}`}
                    </button>
                    <p className="mt-2 min-h-5 text-sm" aria-live="polite">
                      {notices[product.id] ? (
                        <>
                          {notices[product.id]}{" "}
                          <Link href="/cart" className="underline underline-offset-4">
                            View cart
                          </Link>
                        </>
                      ) : null}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
