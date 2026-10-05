# Sweet and Sour

Handmade sourdough desserts, baked to order in Rochester, NY.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Edit the menu without a code change

Sign-in for the editor is `/manage`. Set `MANAGE_PASSWORD` in `.env.local`, then restart the dev server. From there you can change names, descriptions, prices, availability, ordering rules, and upload photos.

The same data lives in:

- `content/menu.json` — desserts, prices (cents), photos, sold-out or hidden
- `content/settings.json` — phone, email, hours, lead time, delivery fee, towns
- `public/menu/` — product photos

A photo path looks like `/menu/cinnamon-rolls.jpg`. Until a photo is set, the site shows an original drawing.

## Payments

Guest checkout is built for Sweet and Sour’s own Stripe account. Leave `STRIPE_SECRET_KEY` empty until that account is ready. The checkout button then explains that payment will use their Stripe, and no card is charged.

When the bakery has a key, copy `.env.example` to `.env.local` and set `STRIPE_SECRET_KEY` to their restricted key (`rk_`). A test key from that same account shows a banner and does not make a real charge. Test card: `4242 4242 4242 4242`.

Pickup is free. Delivery adds the fee in `content/settings.json`. There is no service fee and no card surcharge. Stripe’s processing fee is paid by the bakery. Sales tax is not calculated until a New York registration is active in Stripe Tax.

## Inquiries

Contact and wedding forms open the visitor’s email to `sweetandsourNY@gmail.com` until `RESEND_API_KEY` and `INQUIRY_FROM_EMAIL` are set.
