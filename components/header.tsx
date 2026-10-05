"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { useCart } from "@/components/cart-provider";

const links = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu/Shop" },
  { href: "/weddings", label: "Weddings & Events" },
];

export function Header({
  phoneDisplay,
  phoneTel,
}: {
  phoneDisplay: string;
  phoneTel: string;
}) {
  const pathname = usePathname();
  const { count } = useCart();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenPath(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="border-b border-black/10 bg-blush" aria-label="Primary">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-3 px-5 py-4 sm:px-8">
        <Link href="/" className="shrink-0" aria-label="Sweet and Sour">
          <BrandLogo className="h-20 w-20 sm:h-24 sm:w-24" />
        </Link>
        <nav className="hidden items-center gap-6 lg:flex" aria-label="Pages">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
              className="text-sm font-semibold underline-offset-4 hover:underline"
            >
              {link.label}
            </Link>
          ))}
          <a className="text-sm font-semibold underline-offset-4 hover:underline" href={`tel:${phoneTel}`}>
            {phoneDisplay}
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/menu" className="btn btn-primary hidden sm:inline-flex">
            Order Online
          </Link>
          <Link href="/menu" className="btn btn-primary sm:hidden">
            Order
          </Link>
          <Link
            href="/cart"
            className="btn btn-secondary"
            aria-label={count === 1 ? "Cart, 1 item" : count > 0 ? `Cart, ${count} items` : "Cart"}
          >
            Cart
            {count > 0 ? (
              <span className="ml-2" aria-hidden="true">
                {count}
              </span>
            ) : null}
          </Link>
          <button
            type="button"
            className="btn btn-secondary lg:hidden"
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setOpenPath(open ? null : pathname)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>
      {open ? (
        <div id="site-menu" className="border-t border-black/10 lg:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col px-5 py-3 sm:px-8" aria-label="Pages">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={pathname === link.href ? "page" : undefined}
                className="flex min-h-12 items-center text-base font-semibold"
              >
                {link.label}
              </Link>
            ))}
            <a className="flex min-h-12 items-center font-semibold" href={`tel:${phoneTel}`}>
              Call {phoneDisplay}
            </a>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
