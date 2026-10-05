import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import { connection } from "next/server";
import { CartProvider } from "@/components/cart-provider";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { loadSettings } from "@/lib/content";
import { paymentsMode } from "@/lib/stripe";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const sans = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-montserrat",
  display: "swap",
});

const description =
  "Handmade sourdough desserts in small batches, made to order in Rochester, NY. Order cookies, cinnamon rolls, cakes, and celebration sweets, or inquire about weddings and events.";

export const metadata: Metadata = {
  title: {
    default: "Sweet and Sour | Baked Slow. Made Sweet.",
    template: "%s · Sweet and Sour",
  },
  description,
  applicationName: "Sweet and Sour",
  openGraph: {
    title: "Sweet and Sour | Baked Slow. Made Sweet.",
    description,
    locale: "en_US",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#f2dde2",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  await connection();
  const settings = await loadSettings();
  const payments = paymentsMode();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Bakery",
    name: "Sweet and Sour",
    description,
    servesCuisine: "Desserts",
    telephone: settings.phoneTel,
    email: settings.email,
    areaServed: settings.serviceArea,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Rochester",
      addressRegion: "NY",
      addressCountry: "US",
    },
  };

  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} h-full`}
    >
      <body className="flex min-h-full flex-col bg-blush font-sans text-ink antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <CartProvider>
          <div className="sticky top-0 z-30">
            {payments === "test" ? (
              <p className="bg-ink px-5 py-2 text-center text-sm text-white">
                Demo checkout is in test mode. Use card 4242 4242 4242 4242. No real charge is made.
              </p>
            ) : null}
            <Header phoneDisplay={settings.phoneDisplay} phoneTel={settings.phoneTel} />
          </div>
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer settings={settings} />
        </CartProvider>
      </body>
    </html>
  );
}
