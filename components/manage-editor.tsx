"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ART_KEYS, CATEGORIES, type Product, type Settings } from "@/lib/types";
import { centsToDollarInput, dollarsToCents } from "@/lib/format";
import { dayName } from "@/lib/dates";

function PriceField({ cents, onCommit }: { cents: number; onCommit: (cents: number) => void }) {
  const [text, setText] = useState(centsToDollarInput(cents));
  return (
    <input
      className="field-input"
      inputMode="decimal"
      aria-label="Price in dollars"
      value={text}
      onChange={(event) => {
        setText(event.target.value);
        const next = dollarsToCents(event.target.value);
        if (next !== null) onCommit(next);
      }}
      onBlur={() => setText(centsToDollarInput(cents))}
    />
  );
}

function slugify(value: string) {
  const base = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return base || "dessert";
}

export function ManageEditor({ menu, settings }: { menu: Product[]; settings: Settings }) {
  const router = useRouter();
  const [products, setProducts] = useState(menu);
  const [draft, setDraft] = useState(settings);
  const [towns, setTowns] = useState(settings.deliveryTowns.join("\n"));
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function updateProduct(id: string, patch: Partial<Product>) {
    setProducts((current) =>
      current.map((product) => (product.id === id ? { ...product, ...patch } : product)),
    );
  }

  async function saveSettings() {
    setSaving(true);
    setError("");
    setMessage("");
    const next: Settings = {
      ...draft,
      deliveryTowns: towns
        .split("\n")
        .map((town) => town.trim())
        .filter(Boolean),
    };
    const response = await fetch("/api/manage/settings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(next),
    });
    const payload = (await response.json()) as { error?: string };
    setSaving(false);
    if (!response.ok) {
      setError(payload.error ?? "Settings were not saved.");
      return;
    }
    setMessage("Ordering rules saved. Refresh the public pages to see them.");
    router.refresh();
  }

  async function saveMenu() {
    setSaving(true);
    setError("");
    setMessage("");
    const response = await fetch("/api/manage/menu", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(products),
    });
    const payload = (await response.json()) as { error?: string };
    setSaving(false);
    if (!response.ok) {
      setError(payload.error ?? "The menu was not saved.");
      return;
    }
    setMessage("Menu saved.");
    router.refresh();
  }

  async function uploadPhoto(productId: string, file: File) {
    setError("");
    const body = new FormData();
    body.set("file", file);
    body.set("productId", productId);
    const response = await fetch("/api/manage/upload", { method: "POST", body });
    const payload = (await response.json()) as { error?: string; path?: string };
    if (!response.ok || !payload.path) {
      setError(payload.error ?? "The photo was not saved.");
      return;
    }
    updateProduct(productId, { image: payload.path });
    setMessage("Photo uploaded. Save the menu to publish it.");
  }

  return (
    <div className="grid gap-12">
      <section className="bg-paper p-5 sm:p-8">
        <h2 className="font-display text-4xl font-medium">Ordering rules</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6">
          These fields are what the site says about deadlines, pickup, delivery, and fees. Prices
          for each dessert are on the menu below. No street address was on file, so the site names
          Rochester and confirms the pickup spot by email.
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-semibold">
            Phone
            <input
              className="field-input mt-2"
              value={draft.phoneDisplay}
              onChange={(event) => setDraft({ ...draft, phoneDisplay: event.target.value })}
            />
          </label>
          <label className="block text-sm font-semibold">
            Phone link
            <input
              className="field-input mt-2"
              value={draft.phoneTel}
              onChange={(event) => setDraft({ ...draft, phoneTel: event.target.value })}
            />
          </label>
          <label className="block text-sm font-semibold">
            Email
            <input
              className="field-input mt-2"
              value={draft.email}
              onChange={(event) => setDraft({ ...draft, email: event.target.value })}
            />
          </label>
          <label className="block text-sm font-semibold">
            Service area
            <input
              className="field-input mt-2"
              value={draft.serviceArea}
              onChange={(event) => setDraft({ ...draft, serviceArea: event.target.value })}
            />
          </label>
          <label className="block text-sm font-semibold sm:col-span-2">
            Pickup note
            <textarea
              className="field-input mt-2"
              value={draft.pickupNote}
              onChange={(event) => setDraft({ ...draft, pickupNote: event.target.value })}
            />
          </label>
          <label className="block text-sm font-semibold">
            Lead time (full days)
            <input
              className="field-input mt-2"
              type="number"
              min={0}
              max={30}
              value={draft.leadDays}
              onChange={(event) => setDraft({ ...draft, leadDays: Number(event.target.value) })}
            />
          </label>
          <label className="block text-sm font-semibold">
            Event lead time (weeks)
            <input
              className="field-input mt-2"
              type="number"
              min={1}
              max={52}
              value={draft.eventLeadWeeks}
              onChange={(event) =>
                setDraft({ ...draft, eventLeadWeeks: Number(event.target.value) })
              }
            />
          </label>
          <label className="block text-sm font-semibold">
            Pickup window
            <input
              className="field-input mt-2"
              value={draft.pickupWindow}
              onChange={(event) => setDraft({ ...draft, pickupWindow: event.target.value })}
            />
          </label>
          <label className="block text-sm font-semibold">
            Delivery fee, in dollars
            <div className="mt-2">
              <PriceField
                cents={draft.deliveryFeeCents}
                onCommit={(deliveryFeeCents) => setDraft({ ...draft, deliveryFeeCents })}
              />
            </div>
          </label>
          <label className="block text-sm font-semibold">
            Delivery minimum, in dollars
            <div className="mt-2">
              <PriceField
                cents={draft.deliveryMinimumCents}
                onCommit={(deliveryMinimumCents) => setDraft({ ...draft, deliveryMinimumCents })}
              />
            </div>
          </label>
          {draft.hours.map((line, index) => (
            <label key={`${line.label}-${index}`} className="block text-sm font-semibold sm:col-span-2">
              Hours shown on the site
              <input
                className="field-input mt-2"
                value={line.label}
                aria-label={`Hours label ${index + 1}`}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    hours: draft.hours.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, label: event.target.value } : item,
                    ),
                  })
                }
              />
              <input
                className="field-input mt-2"
                value={line.value}
                aria-label={`Hours detail ${index + 1}`}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    hours: draft.hours.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, value: event.target.value } : item,
                    ),
                  })
                }
              />
            </label>
          ))}
          <fieldset className="text-sm font-semibold">
            <legend>Ready days</legend>
            <div className="mt-2 grid grid-cols-2 gap-2 font-normal">
              {[1, 2, 3, 4, 5, 6, 0].map((day) => (
                <label key={day} className="flex min-h-10 items-center gap-2">
                  <input
                    type="checkbox"
                    checked={draft.pickupDays.includes(day)}
                    onChange={(event) => {
                      const pickupDays = event.target.checked
                        ? [...draft.pickupDays, day]
                        : draft.pickupDays.filter((item) => item !== day);
                      setDraft({ ...draft, pickupDays });
                    }}
                  />
                  {dayName(day)}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="block text-sm font-semibold sm:col-span-2">
            Delivery towns, one per line
            <textarea className="field-input mt-2" value={towns} onChange={(event) => setTowns(event.target.value)} />
          </label>
        </div>
        <button type="button" className="btn btn-primary mt-6" onClick={saveSettings} disabled={saving}>
          Save ordering rules
        </button>
      </section>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-4xl font-medium">Menu</h2>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              const idBase = slugify(`new-dessert-${products.length + 1}`);
              const id = products.some((product) => product.id === idBase) ? `${idBase}-2` : idBase;
              setProducts((current) => [
                ...current,
                {
                  id,
                  name: "New dessert",
                  description: "Tell people what this is, and how it is baked.",
                  category: "cookies",
                  art: "cookie",
                  image: "",
                  availability: "hidden",
                  allergens: "Wheat, dairy, and eggs",
                  options: [{ id: "single", label: "Single", priceCents: 500 }],
                },
              ]);
            }}
          >
            Add a dessert
          </button>
        </div>
        <div className="mt-6 grid gap-4">
          {products.map((product) => (
            <details key={product.id} className="bg-paper p-5">
              <summary className="cursor-pointer font-display text-3xl">
                {product.name}
                <span className="ml-3 font-sans text-sm font-semibold">
                  {product.availability === "available" ? "On the menu" : product.availability === "sold-out" ? "Sold out" : "Hidden"}
                </span>
              </summary>
              <div className="mt-5 grid gap-4">
                <label className="block text-sm font-semibold">
                  Name
                  <input
                    className="field-input mt-2"
                    value={product.name}
                    onChange={(event) => updateProduct(product.id, { name: event.target.value })}
                  />
                </label>
                <label className="block text-sm font-semibold">
                  Description
                  <textarea
                    className="field-input mt-2"
                    value={product.description}
                    onChange={(event) => updateProduct(product.id, { description: event.target.value })}
                  />
                </label>
                <div className="grid gap-4 sm:grid-cols-3">
                  <label className="block text-sm font-semibold">
                    Category
                    <select
                      className="field-input mt-2"
                      value={product.category}
                      onChange={(event) =>
                        updateProduct(product.id, {
                          category: event.target.value as Product["category"],
                        })
                      }
                    >
                      {CATEGORIES.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-sm font-semibold">
                    Drawing
                    <select
                      className="field-input mt-2"
                      value={product.art}
                      onChange={(event) =>
                        updateProduct(product.id, { art: event.target.value as Product["art"] })
                      }
                    >
                      {ART_KEYS.map((art) => (
                        <option key={art} value={art}>
                          {art}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-sm font-semibold">
                    Availability
                    <select
                      className="field-input mt-2"
                      value={product.availability}
                      onChange={(event) =>
                        updateProduct(product.id, {
                          availability: event.target.value as Product["availability"],
                        })
                      }
                    >
                      <option value="available">On the menu</option>
                      <option value="sold-out">Sold out</option>
                      <option value="hidden">Hidden</option>
                    </select>
                  </label>
                </div>
                <label className="block text-sm font-semibold">
                  Allergens
                  <input
                    className="field-input mt-2"
                    value={product.allergens}
                    onChange={(event) => updateProduct(product.id, { allergens: event.target.value })}
                  />
                </label>
                <label className="block text-sm font-semibold">
                  Photo path
                  <input
                    className="field-input mt-2"
                    value={product.image}
                    onChange={(event) => updateProduct(product.id, { image: event.target.value })}
                  />
                </label>
                <label className="block text-sm font-semibold">
                  Upload a photo
                  <input
                    className="mt-2 block w-full text-sm"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void uploadPhoto(product.id, file);
                    }}
                  />
                </label>
                <div className="grid gap-3">
                  {product.options.map((option) => (
                    <div key={option.id} className="grid gap-3 sm:grid-cols-[1fr_8rem_auto]">
                      <input
                        className="field-input"
                        aria-label={`${product.name} choice`}
                        value={option.label}
                        onChange={(event) =>
                          updateProduct(product.id, {
                            options: product.options.map((item) =>
                              item.id === option.id ? { ...item, label: event.target.value } : item,
                            ),
                          })
                        }
                      />
                      <PriceField
                        cents={option.priceCents}
                        onCommit={(priceCents) =>
                          updateProduct(product.id, {
                            options: product.options.map((item) =>
                              item.id === option.id ? { ...item, priceCents } : item,
                            ),
                          })
                        }
                      />
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() =>
                          updateProduct(product.id, {
                            options: product.options.filter((item) => item.id !== option.id),
                          })
                        }
                      >
                        Remove choice
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn btn-secondary w-full sm:w-auto"
                    onClick={() =>
                      updateProduct(product.id, {
                        options: [
                          ...product.options,
                          {
                            id: `choice-${product.options.length + 1}`,
                            label: "New choice",
                            priceCents: 500,
                          },
                        ],
                      })
                    }
                  >
                    Add a choice
                  </button>
                </div>
              </div>
            </details>
          ))}
        </div>
        <button type="button" className="btn btn-primary mt-6" onClick={saveMenu} disabled={saving}>
          Save menu
        </button>
      </section>
      {error ? (
        <p role="alert" className="text-sm">
          {error}
        </p>
      ) : null}
      {message ? <p className="text-sm">{message}</p> : null}
      <form action="/api/manage/logout" method="post">
        <button type="submit" className="text-sm underline underline-offset-4">
          Sign out
        </button>
      </form>
    </div>
  );
}

export function ManageLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const response = await fetch("/api/manage/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!response.ok) {
      setError("That password did not match.");
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="max-w-md">
      <label className="block text-sm font-semibold">
        Password
        <input
          className="field-input mt-2"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>
      <button type="submit" className="btn btn-primary mt-5">
        Open the editor
      </button>
      {error ? (
        <p className="mt-3 text-sm" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
