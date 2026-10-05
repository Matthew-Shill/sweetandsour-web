"use client";

import Link from "next/link";
import { useCart } from "@/components/cart-provider";
import { formatMoney } from "@/lib/format";
import { priceCart } from "@/lib/quote";
import type { Product, Settings } from "@/lib/types";

export function CartView({ menu, settings }: { menu: Product[]; settings: Settings }) {
  const { lines, setQuantity, remove } = useCart();
  const priced = priceCart(lines, menu);

  if (lines.length === 0) {
    return (
      <div className="max-w-xl">
        <p className="text-lg leading-8">Your order is empty. The menu is ready when you are.</p>
        <Link href="/menu" className="btn btn-primary mt-6">
          Order Online
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <ul className="divide-y divide-black/10 border-y border-black/10">
        {priced.lines.map((line) => (
          <li key={`${line.productId}:${line.optionId}`} className="grid gap-4 py-5 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <h2 className="font-display text-3xl font-medium">{line.name}</h2>
              <p className="mt-1 text-sm">{line.optionLabel}</p>
              <p className="mt-1 text-sm">{formatMoney(line.unitAmount)} each</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-sm font-semibold">
                <span className="sr-only">Quantity for {line.name}</span>
                <input
                  className="field-input w-24"
                  type="number"
                  min={1}
                  max={24}
                  value={line.quantity}
                  onChange={(event) =>
                    setQuantity(
                      line.productId,
                      line.optionId,
                      Math.min(24, Math.max(1, Number(event.target.value) || 1)),
                    )
                  }
                />
              </label>
              <p className="min-w-16 font-semibold">
                {formatMoney(line.unitAmount * line.quantity)}
              </p>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => remove(line.productId, line.optionId)}
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
      <aside className="h-fit bg-paper p-6">
        {priced.missing.map((problem) => (
          <p key={problem} className="mb-3 text-sm" role="alert">
            {problem}
          </p>
        ))}
        <p className="flex justify-between text-sm">
          <span>Sweets</span>
          <span>{formatMoney(priced.subtotalCents)}</span>
        </p>
        <p className="mt-3 text-sm leading-6">
          Pickup is free. Delivery in our towns is {formatMoney(settings.deliveryFeeCents)}, added
          when you choose it. No account and no card surcharge.
        </p>
        <Link
          href="/checkout"
          className="btn btn-primary mt-6 w-full"
          aria-disabled={priced.missing.length > 0}
          onClick={(event) => {
            if (priced.missing.length > 0) event.preventDefault();
          }}
        >
          Continue to checkout
        </Link>
        <Link href="/menu" className="mt-4 inline-block text-sm underline underline-offset-4">
          Keep shopping
        </Link>
      </aside>
    </div>
  );
}
