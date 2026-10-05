import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import type { Settings } from "@/lib/types";

export function Footer({ settings }: { settings: Settings }) {
  return (
    <footer className="border-t border-black/10 bg-paper">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-4">
        <div className="md:col-span-1">
          <BrandLogo className="h-28 w-28" />
          <p className="mt-4 max-w-xs text-sm leading-6">
            Baked slow. Made sweet. Handmade sourdough desserts in {settings.serviceArea}.
          </p>
        </div>
        <div>
          <h2 className="font-display text-2xl font-medium">Contact</h2>
          <ul className="mt-4 space-y-2 text-sm leading-6">
            <li>
              <a className="underline decoration-black/30 underline-offset-4" href={`tel:${settings.phoneTel}`}>
                {settings.phoneDisplay}
              </a>
            </li>
            <li>
              <a
                className="underline decoration-black/30 underline-offset-4"
                href={`mailto:${settings.email}`}
              >
                {settings.email}
              </a>
            </li>
            <li>{settings.serviceArea}</li>
            <li>{settings.pickupNote}</li>
          </ul>
          {settings.socials.length > 0 ? (
            <ul className="mt-4 space-y-2 text-sm">
              {settings.socials.map((social) => (
                <li key={social.href}>
                  <a
                    className="underline decoration-black/30 underline-offset-4"
                    href={social.href}
                    rel="noreferrer"
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <div>
          <h2 className="font-display text-2xl font-medium">Hours</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6">
            {settings.hours.map((line) => (
              <li key={line.label}>
                <span className="block font-semibold">{line.label}</span>
                {line.value}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-display text-2xl font-medium">Visit</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link className="underline decoration-black/30 underline-offset-4" href="/">
                Home
              </Link>
            </li>
            <li>
              <Link className="underline decoration-black/30 underline-offset-4" href="/menu">
                Menu/Shop
              </Link>
            </li>
            <li>
              <Link className="underline decoration-black/30 underline-offset-4" href="/weddings">
                Weddings & Events
              </Link>
            </li>
            <li>
              <Link className="underline decoration-black/30 underline-offset-4" href="/menu">
                Order Online
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-black/10 px-5 py-5 text-center text-sm sm:px-8">
        Sweet and Sour · {settings.serviceArea}
      </div>
    </footer>
  );
}
