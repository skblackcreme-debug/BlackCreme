# Black Crème — Project Guide

## What This Project Is

Black Crème is a Malaysian dessert e-commerce storefront. Customers browse products (basque cheesecakes, tiramisus, party-size cakes, add-ons like candles and toppers), add to cart, and place orders with scheduled delivery to supported Malaysian states.

**Key business flows:**
- Browse menu by category → add to cart → checkout
- Checkout collects delivery address, scheduled date/time, cake message, voucher code
- Payment via **Stripe** (FPX + credit/debit card) — hosted Stripe Checkout page
- After successful payment: order confirmation email sent to customer via **Resend**
- Admin manages products, banners, and categories via `/admin`

**Customer accounts:**
- Customers sign up / log in via Supabase Auth (email + password)
- Saved addresses (multiple, with default flag)
- Order history

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Language | TypeScript 5.8 |
| Build tool | Vite 6 |
| Styling | Tailwind CSS v4 (Vite plugin, no config file) |
| Animation | Motion (Framer Motion v12) via `motion/react` |
| Icons | Lucide React |
| Database / Auth / Storage | Supabase (PostgreSQL + Auth + Storage) |
| Drag and drop | @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities |
| Payment | Stripe (hosted Checkout, FPX + cards) |
| Email | Resend (order confirmation / invoice) |
| Serverless functions | Supabase Edge Functions |
| Package manager | npm |

---

## Project Structure

```
src/
  App.tsx                          # Single-page app — all UI lives here
  main.tsx                         # React root mount + /admin routing
  types.ts                         # Shared TypeScript types (Category, Product, CartItem, Order)
  constants.ts                     # WHATSAPP_NUMBER, BANK_INFO (products now in Supabase)
  lib/
    supabase.ts                    # Supabase client singleton
  hooks/
    useCart.ts                     # Cart state (add, remove, update quantity)
    useAuth.ts                     # Auth state (session, user, sign in/out)
    useSettings.ts                 # Site settings from site_settings table (payment_method, login_enabled, signup_enabled)
  features/order/hooks/
    useDeliveryFee.ts              # Delivery fee + zone lookup by postcode
  data/
    deliveryZones.ts               # POSTCODE_LOOKUP, STATE_CITIES, SUPPORTED_STATES
  components/
    BannerCarousel.tsx             # Auto-sliding banner carousel (images + YouTube/mp4 videos)
  pages/
    AdminLogin.tsx                 # Admin login page (Supabase Auth)
    AdminPanel.tsx                 # Admin panel — Banners, Products, Categories tabs

supabase/
  functions/
    create-order/index.ts          # Edge fn: save order to DB + create Stripe Checkout session
    stripe-webhook/index.ts        # Edge fn: handle Stripe webhook → mark paid + send email
    send-order-email/index.ts      # Edge fn: send order confirmation email to customer via Resend + admin notification to ADMIN_EMAIL
```

---

## Key Patterns

- **Single page, no router** — all sections are anchor-scrolled (`#hero`, `#menu`, `#order`, `#contact`).
- **Admin routing** — `main.tsx` checks `window.location.pathname.startsWith('/admin')`. No router library used. Access at `/admin`.
- **Payment flow** — cart checkout calls the `create-order` Edge Function, which creates an order row (status `pending`) and returns a Stripe Checkout URL. Customer is redirected to Stripe, pays, then Stripe webhooks `stripe-webhook` Edge Function which marks the order `paid` and triggers the confirmation email.
- **Tailwind v4** — uses `@tailwindcss/vite` plugin. CSS custom properties defined in `index.css` (not `tailwind.config.js`). Design tokens follow `primary-*`, `accent-*`, `gray-soft` naming.
- **Path alias** — `@/` maps to `src/`.
- **Products from Supabase** — fetched at runtime, ordered by `display_order`.
- **Gemini API key** — `GEMINI_API_KEY` env var is forwarded via `vite.config.ts` `define` (currently unused in code).

---

## Supabase

### Environment Variables

**Frontend** (`.env.local`):
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

**Supabase Edge Function Secrets** (set via Supabase Dashboard → Edge Functions → Manage Secrets):
```
STRIPE_SECRET_KEY=sk_test_...       # or sk_live_... for production
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=Black Crème <noreply@yourdomain.com>   # requires verified domain in Resend
STRIPE_WEBHOOK_SECRET=whsec_...     # add after webhook created in Stripe Dashboard
ADMIN_EMAIL=your@email.com          # receives new order notification emails
```
> `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_URL` are auto-injected by Supabase into every Edge Function — do NOT add them manually (reserved prefix).

### Database Tables

#### `profiles`
Extends `auth.users`. Created automatically on user sign-up via trigger.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK, FK → auth.users.id |
| full_name | text | |
| phone | text | |
| date_of_birth | date | For birthday promotions |
| created_at | timestamptz | default now() |

#### `addresses`
Customer saved delivery addresses.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK, gen_random_uuid() |
| user_id | uuid | FK → profiles.id |
| label | text | e.g. "Home", "Office" |
| address_line_1 | text | |
| address_line_2 | text | |
| city | text | |
| state | text | |
| postcode | text | Used for delivery fee lookup |
| is_default | bool | default false |
| created_at | timestamptz | default now() |

#### `orders`
One row per customer order.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK, gen_random_uuid() |
| order_number | text | Unique human-readable ref e.g. "BC-00042" |
| user_id | uuid | FK → profiles.id |
| address_id | uuid | FK → addresses.id (reference only) |
| delivery_type | text | "delivery" or "self-pickup" |
| subtotal | numeric | Before delivery + discount |
| delivery_fee | numeric | default 0 |
| discount_amount | numeric | default 0 |
| total | numeric | Final charged amount |
| cake_message | text | Custom message on cake |
| scheduled_date | date | Requested delivery/pickup date |
| scheduled_time | text | Requested delivery/pickup time slot |
| voucher_code | text | Applied voucher code |
| status | text | default 'pending' — pending / paid / processing / completed / cancelled |
| customer_name | text | Snapshot at checkout |
| customer_email | text | Snapshot at checkout — used for invoice email |
| customer_phone | text | Snapshot at checkout |
| payment_gateway | text | 'stripe' |
| payment_id | text | Stripe Checkout Session ID |
| payment_url | text | Stripe Checkout URL |
| paid_at | timestamptz | Set when Stripe webhook confirms payment |
| delivery_address_line_1 | text | Snapshot of address at order time |
| delivery_address_line_2 | text | |
| delivery_city | text | |
| delivery_state | text | |
| delivery_postcode | text | |
| created_at | timestamptz | default now() |

#### `order_items`
Line items per order. Prices snapshotted so historical orders are unaffected by future price changes.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK, gen_random_uuid() |
| order_id | uuid | FK → orders.id |
| product_id | uuid | FK → products.id |
| product_name | text | Snapshot at checkout |
| product_price | numeric | Snapshot at checkout |
| quantity | int4 | |
| subtotal | numeric | product_price × quantity |

#### `products`
Product catalogue managed by admin.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| name | text | |
| price | numeric | |
| description | text | |
| image_url | text | Public URL from Supabase storage |
| category | text | References categories.name |
| is_available | bool | Auto-set: true when stock_qty > 0 |
| stock_qty | int | |
| display_order | int | Admin drag-and-drop sort order |

#### `banners`
Homepage carousel banners.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| title | text | |
| media_url | text | Image URL, YouTube URL, or mp4 URL |
| media_type | text | 'image' or 'video' |
| display_order | int | |
| is_active | bool | Only active banners shown on site |

#### `categories`
Product categories.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| name | text | |
| display_order | int | |

#### `site_settings`
Admin-controlled feature toggles. Managed via Admin Panel → Settings tab.

| Column | Type | Notes |
|---|---|---|
| key | text | PK — e.g. `payment_method`, `login_enabled` |
| value | text | String value — e.g. `'stripe'`, `'true'` |
| updated_at | timestamptz | default now() |

**Keys:**
- `payment_method` — `'whatsapp'` or `'stripe'`
- `login_enabled` — `'true'` or `'false'`
- `signup_enabled` — `'true'` or `'false'` — when `'false'`, `/register` shows a "Registration Closed" screen and LoginPage hides the "Create Account" link

---

### Storage Buckets

| Bucket | Used for |
|---|---|
| `banners` | Uploaded banner images |
| `products` | Uploaded product images |

Both buckets are **public**. Images are stored here, URLs are saved in the database tables.

### Row Level Security (RLS)
- Public can **SELECT** all tables and storage buckets (website reads)
- Authenticated customers can INSERT/SELECT their own `orders`, `order_items`, `addresses`, `profiles`
- Only **admin** can INSERT/UPDATE/DELETE `products`, `banners`, `categories`

### Auth
- **Admin:** Single user created manually in Supabase Dashboard → Authentication → Users. Login at `/admin`.
- **Customers:** Sign up / sign in via Supabase Auth (email + password). Profile row auto-created via DB trigger on `auth.users` insert.
- Login via `supabase.auth.signInWithPassword({ email, password })`
- Sign-up can be disabled via `signup_enabled` setting without affecting existing logins.
- Supabase Auth emails (reset password, verification) are sent via Resend custom SMTP — configured in Supabase Dashboard → Project Settings → Authentication → SMTP Settings.

---

## Payment Flow (Stripe)

```
1. Customer fills cart + checkout form (address, date, time, cake message)
2. Frontend calls Supabase Edge Function: create-order
   - Inserts order row (status = 'pending') + order_items rows
   - Creates Stripe Checkout Session (line items, customer email, success/cancel URLs)
   - Returns { checkoutUrl, orderId }
3. Frontend redirects customer to Stripe Checkout URL
4. Customer pays (FPX or card) on Stripe-hosted page
5. Stripe sends webhook to: stripe-webhook Edge Function
   - Verifies Stripe signature
   - Updates order status = 'paid', sets paid_at
   - Calls send-order-email Edge Function
6. send-order-email sends two emails via Resend:
   - Customer invoice (styled HTML) to customer_email
   - Admin new-order notification to ADMIN_EMAIL (if secret is set)
7. Customer is redirected to /order-success?orderId=xxx (Stripe success_url)
```

**Stripe setup:**
- Use `STRIPE_SECRET_KEY` (sk_live_... or sk_test_...) in Edge Functions
- Webhook secret `STRIPE_WEBHOOK_SECRET` (whsec_...) for signature verification
- Set Stripe webhook endpoint to: `https://<project>.supabase.co/functions/v1/stripe-webhook`
- Events to listen for: `checkout.session.completed`

---

## Admin Panel (`/admin`)

Five tabs:

- **Banners** — add/edit/delete carousel banners (images or YouTube/mp4 video). Add banner form sets `display_order` to last position. Edit allows replacing the image (old image auto-deleted from storage). Drag-and-drop reorder.
- **Products** — filtered by category tabs. Add/edit/delete products with image upload, stock qty, pricing. `is_available` is auto-set based on `stock_qty > 0`. Drag-and-drop reorder.
- **Categories** — add/delete categories. Delete is blocked if products are still assigned to it. Drag-and-drop reorder.
- **Orders** — view all orders, filterable by status. Each card shows customer name, order ref, scheduled date/time, delivery type, and order created datetime. Expand card for full details. Update status via dropdown. Delete order.
- **Settings** — feature toggles: payment method (WhatsApp/Stripe), customer login, customer sign up.

Drag-and-drop reorder (Banners/Products/Categories) shows a **Save Order** bar — must click Save to persist. Uses `@dnd-kit`.

---

## Banner Carousel

- Fetches active banners from Supabase, filtered by `is_active = true`, ordered by `display_order`
- Skips banners with empty/null `media_url`
- **Images** — auto-advance every 5 seconds
- **YouTube videos** — uses YouTube IFrame API (`window.YT.Player`), autoplays muted, advances to next slide when video ends (`onStateChange = 0`)
- **Direct video files (mp4 etc.)** — uses HTML `<video>` element, autoplays muted, advances on `onEnded`
- Fade transition (opacity) — not AnimatePresence, so `#yt-player` div is always in DOM during transition
- Contained layout: `max-w-6xl mx-auto` with padding, `rounded-2xl`, `shadow-xl`

---

## Development

```bash
npm run dev      # starts on http://localhost:3000
npm run build    # production build to dist/
npm run lint     # tsc --noEmit type check
```

Admin panel: `http://localhost:3000/admin`

Supabase Edge Functions (local dev):
```bash
supabase functions serve create-order --env-file .env.local
supabase functions serve stripe-webhook --env-file .env.local
supabase functions serve send-order-email --env-file .env.local
```

---

## Deployment

Static site — deploy the `dist/` folder to any static host (Netlify, Vercel, GitHub Pages, etc.).

For `/admin` route to work on static hosts, configure a rewrite rule to serve `index.html` for all routes:
- **Netlify** — add `_redirects` file: `/* /index.html 200`
- **Vercel** — add `vercel.json` with rewrites

Edge Functions are deployed to Supabase (not the static host):
```bash
supabase functions deploy create-order
supabase functions deploy stripe-webhook
supabase functions deploy send-order-email
```
