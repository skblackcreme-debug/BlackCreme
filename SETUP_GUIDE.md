# Black Crème — Complete Setup Guide

**Project:** Black Crème E-Commerce  
**Stack:** React + Supabase + Stripe + Resend  
**Last Updated:** June 2026

---

## Table of Contents

1. [Supabase Setup](#1-supabase-setup)
2. [Database Tables](#2-database-tables)
3. [Row Level Security (RLS)](#3-row-level-security)
4. [Supabase Edge Functions](#4-supabase-edge-functions)
5. [Stripe Setup](#5-stripe-setup)
6. [Resend Email Setup](#6-resend-email-setup)
7. [Supabase Auth Email via Resend](#7-supabase-auth-email-via-resend-custom-smtp)
8. [Environment Variables](#8-environment-variables)
9. [Going Live Checklist](#9-going-live-checklist)

---

## 1. Supabase Setup

### Create Project
1. Go to **supabase.com** → Sign up / Log in
2. Click **New Project**
3. Fill in project name, database password, region
4. Wait for project to be ready (~2 minutes)

### Get API Keys
1. Supabase Dashboard → **Project Settings → API**
2. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

### Auth Setup
- Admin user: created manually in **Authentication → Users → Add user**
- Customer users: sign up via the storefront (auto-created via trigger)

### Auto-create Profile on Signup (Trigger)
Run in **SQL Editor**:
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

---

## 2. Database Tables

Run all SQL below in **Supabase Dashboard → SQL Editor**:

### profiles
```sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  full_name text,
  phone text,
  date_of_birth date,
  created_at timestamptz DEFAULT now()
);
```

### addresses
```sql
CREATE TABLE addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  label text,
  address_line_1 text,
  address_line_2 text,
  city text,
  state text,
  postcode text,
  is_default bool DEFAULT false,
  created_at timestamptz DEFAULT now()
);
```

### categories
```sql
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  display_order int DEFAULT 0
);
```

### products
```sql
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price numeric NOT NULL,
  description text,
  image_url text,
  category text,
  is_available bool DEFAULT true,
  stock_qty int DEFAULT 0,
  display_order int DEFAULT 0
);
```

### banners
```sql
CREATE TABLE banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  media_url text,
  media_type text DEFAULT 'image',
  display_order int DEFAULT 0,
  is_active bool DEFAULT true
);
```

### orders
```sql
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE,
  user_id uuid REFERENCES profiles(id),
  address_id uuid REFERENCES addresses(id),
  delivery_type text,
  subtotal numeric,
  delivery_fee numeric DEFAULT 0,
  discount_amount numeric DEFAULT 0,
  total numeric,
  cake_message text,
  scheduled_date date,
  scheduled_time text,
  voucher_code text,
  status text DEFAULT 'pending',
  customer_name text,
  customer_email text,
  customer_phone text,
  payment_gateway text,
  payment_id text,
  payment_url text,
  paid_at timestamptz,
  delivery_address_line_1 text,
  delivery_address_line_2 text,
  delivery_city text,
  delivery_state text,
  delivery_postcode text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT orders_status_check CHECK (
    status IN ('pending', 'paid', 'confirmed', 'completed', 'cancelled')
  )
);
```

> **Important:** If you get a status constraint error, run:
> ```sql
> ALTER TABLE orders DROP CONSTRAINT orders_status_check;
> ALTER TABLE orders ADD CONSTRAINT orders_status_check
>   CHECK (status IN ('pending', 'paid', 'confirmed', 'completed', 'cancelled'));
> ```

### order_items
```sql
CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id),
  product_id uuid REFERENCES products(id),
  product_name text,
  product_price numeric,
  quantity int4,
  subtotal numeric
);
```

### site_settings
```sql
CREATE TABLE site_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

INSERT INTO site_settings (key, value) VALUES
  ('payment_method', 'whatsapp'),
  ('login_enabled', 'true'),
  ('signup_enabled', 'true');
```

### Allow NULL on user_id (for guest orders)
```sql
ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;
```

---

## 3. Row Level Security

Enable RLS and create policies for all tables:

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Public read (storefront)
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read banners" ON banners FOR SELECT USING (true);
CREATE POLICY "Public read orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Public read order_items" ON order_items FOR SELECT USING (true);
CREATE POLICY "Public read settings" ON site_settings FOR SELECT USING (true);

-- Admin write (authenticated)
CREATE POLICY "Admin write products" ON products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write categories" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write banners" ON banners FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write settings" ON site_settings FOR ALL USING (auth.role() = 'authenticated');

-- Customer policies
CREATE POLICY "Customers manage own profile" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Customers manage own addresses" ON addresses FOR ALL USING (auth.uid() = user_id);
```

---

## 4. Supabase Edge Functions

### Install Supabase CLI
```bash
npm install supabase --save-dev
```

### Login and Link Project
```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
```

> Find your project ref in **Supabase Dashboard → Settings → General**

### Add Edge Function Secrets
Go to **Supabase Dashboard → Edge Functions → Manage Secrets** and add:

| Secret Name | Value | When |
|---|---|---|
| `STRIPE_SECRET_KEY` | `sk_test_...` (test) or `sk_live_...` (live) | Now |
| `RESEND_API_KEY` | `re_...` | Now |
| `RESEND_FROM_EMAIL` | `Black Crème <noreply@blackcreme.com>` | After domain verified |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | After webhook created |
| `ADMIN_EMAIL` | `your@email.com` | Now — receives new order notifications |

> **Note:** `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are automatically injected — do NOT add them manually.

### Deploy Edge Functions
```bash
npx supabase functions deploy create-order
npx supabase functions deploy stripe-webhook
npx supabase functions deploy send-order-email
```

### Storage Buckets
Create two public buckets in **Supabase → Storage**:
1. `banners` — for carousel banner images
2. `products` — for product images

Set both to **Public** bucket.

---

## 5. Stripe Setup

### Create Account
1. Go to **stripe.com** → Sign up
2. Fill in business details:
   - Website: `https://www.blackcreme.com`
   - Business type: Food & Beverage / Bakery
   - Payment type: Non-recurring payments

### Get Test API Keys
1. Make sure **Test mode** is ON (toggle top right)
2. **Developers → API keys**
3. Copy **Secret key** (`sk_test_...`)
4. Add to Supabase secrets as `STRIPE_SECRET_KEY`

### Set Up Webhook (Test)
1. **Developers → Webhooks → Add destination**
2. Endpoint URL:
   ```
   https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook
   ```
3. Select event: `checkout.session.completed`
4. After creating → click **Reveal signing secret** → copy `whsec_...`
5. Add to Supabase secrets as `STRIPE_WEBHOOK_SECRET`

### Enable Payment Methods (Test)
1. **Settings → Payment methods**
2. Toggle OFF: **Link** (Stripe's saved card feature)
3. Toggle ON: **FPX** (only available after KYC in live mode)

### Test Cards
| Card Number | Result |
|---|---|
| `4242 4242 4242 4242` | Payment succeeds |
| `4000 0000 0000 0002` | Payment declined |
| `4000 0000 0000 9995` | Insufficient funds |

Use any future expiry (e.g. `12/34`) and any 3-digit CVC (`123`).

---

## 6. Resend Email Setup

### Create Account
1. Go to **resend.com** → Sign up
2. Free tier: 3,000 emails/month

### Verify Your Domain
1. **Resend Dashboard → Domains → Add Domain**
2. Enter: `blackcreme.com`
3. Choose region: **US East (N. Virginia)**
4. Resend will give you DNS records to add

### Add DNS Records to Netlify
Since DNS is managed by Netlify:
1. **Netlify Dashboard → Domains → blackcreme.com → DNS records**
2. Add each record Resend gives you:

| Type | Name | Value | Priority |
|---|---|---|---|
| MX | `send` | (from Resend) | `10` |
| TXT | `resend._domainkey` | (from Resend) | — |
| TXT | `send` | (from Resend) | — |

3. After adding all records → go back to Resend → click **Verify DNS Records**
4. Wait 5-15 minutes for DNS propagation
5. Status should change to **Verified**

### Get API Key
1. **Resend Dashboard → API Keys → Create API Key**
2. Name: `black-creme`
3. Copy the key (`re_...`)
4. Add to Supabase secrets as `RESEND_API_KEY`

### Update From Email Secret
Once domain is verified, add to Supabase secrets:
```
RESEND_FROM_EMAIL = Black Crème <orders@blackcreme.com>
```

Then redeploy:
```bash
npx supabase functions deploy send-order-email
```

---

## 7. Supabase Auth Email via Resend (Custom SMTP)

By default Supabase sends auth emails (reset password, email verification) from `noreply@mail.app.supabase.io`. To send from your own domain:

### Prerequisites
- Domain verified in Resend (see Section 6)

### Configure Custom SMTP in Supabase

1. Supabase Dashboard → **Project Settings → Authentication → SMTP Settings**
2. Toggle **Enable Custom SMTP** ON
3. Fill in:

| Field | Value |
|---|---|
| Sender name | `Black Crème` |
| Sender email | `noreply@blackcreme.com` |
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | Your Resend API key (`re_...`) |

4. Click **Save**

### Local Development
Auth emails in local dev are caught by **Inbucket** — no real emails are sent.
Access at: `http://localhost:54324`

---

## 8. Environment Variables

### Frontend (.env.local)
```
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### Netlify Production Environment Variables
Set in **Netlify → Site → Environment variables**:
```
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### Supabase Edge Function Secrets
Set in **Supabase → Edge Functions → Manage Secrets**:
```
STRIPE_SECRET_KEY=sk_test_... (or sk_live_... for production)
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=Black Crème <noreply@blackcreme.com>
ADMIN_EMAIL=your@email.com
```

---

## 9. Going Live Checklist

### Step 1 — Complete Stripe KYC Verification
- Submit IC number, full name, date of birth
- Add Malaysian bank account for payouts
- Wait for approval (1-2 business days)

### Step 2 — Switch Stripe to Live Mode
1. Toggle **Test → Live** in Stripe Dashboard
2. **Developers → API keys** → copy `sk_live_...`

### Step 3 — Set Up Live Webhook
1. **Developers → Webhooks → Add destination** (in Live mode)
2. Same URL: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook`
3. Event: `checkout.session.completed`
4. Copy signing secret `whsec_live_...`

### Step 4 — Update Supabase Secrets
| Secret | Replace with |
|---|---|
| `STRIPE_SECRET_KEY` | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_live_...` |

### Step 5 — Enable FPX (After KYC Approved)
1. Stripe Live mode → **Settings → Payment methods**
2. Enable **FPX**
3. Disable **Link**

### Step 6 — Redeploy All Edge Functions
```bash
npx supabase functions deploy create-order
npx supabase functions deploy stripe-webhook
npx supabase functions deploy send-order-email
```

### Step 7 — Clean Up Test Data
- Delete all test orders from Admin Panel → Orders
- Delete test banners or products if any

### Step 8 — Update Netlify
1. Confirm environment variables are pointing to production Supabase
2. Trigger a redeploy on Netlify

### Step 9 — Do One Real Test Payment
- Place a real order with a small amount
- Verify payment appears in Stripe Live Dashboard
- Verify email arrives in customer inbox
- Verify order shows as `paid` in Admin Panel

### Step 10 — Go Live!
- Announce to customers
- Monitor Stripe Dashboard and Admin Panel for orders

---

## What is KYC?

**KYC = Know Your Customer** is a mandatory identity verification process required by Bank Negara Malaysia for all payment processors.

Stripe will ask for:
- **IC Number** (MyKad)
- **Full Name** (as per IC)
- **Date of Birth**
- **Home/Business Address**
- **Bank Account** (for receiving payouts from Stripe)
- **SSM Number** (if registered business — optional for individuals)

Without completing KYC you can only use test mode. Live payments require a fully verified account.

---

## Order Number Format

Orders use the format: **`BC-YYMMDD-XXXX`**

| Example | Meaning |
|---|---|
| `BC-260602-0001` | 1st order on June 2, 2026 |
| `BC-260602-0002` | 2nd order on June 2, 2026 |
| `BC-260603-0001` | Counter resets on June 3, 2026 |

- Maximum **9,999 orders per day**
- Counter resets every day automatically
- All times based on **Malaysia Time (UTC+8)**

---

## Admin Panel

Access at: `https://www.blackcreme.com/admin`

| Tab | Purpose |
|---|---|
| Banners | Manage homepage carousel (images/videos) |
| Products | Add/edit/delete products, manage stock |
| Categories | Manage product categories |
| Orders | View orders, update status, delete orders. Each card shows customer name, order ref, scheduled date/time, delivery type, and order created datetime |
| Settings | Toggle payment method (WhatsApp/Stripe), customer login, and customer sign up |

---

## Support & Reference

| Service | Dashboard URL |
|---|---|
| Supabase | https://supabase.com/dashboard |
| Stripe | https://dashboard.stripe.com |
| Resend | https://resend.com |
| Netlify | https://app.netlify.com |

---

*Generated for Black Crème — Handcrafted with Indulgence*
