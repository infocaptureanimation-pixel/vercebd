# VERCE BD — Complete Architecture Roadmap & Deployment Guide

## Directory Structure

```
verce-bd/
├── prisma/
│   ├── schema.prisma          # DB schema: User, Product, Order, Address
│   └── seed.ts                # Sample products & admin user
│
├── public/                    # Static assets (logo, favicon, og-image)
│
├── src/
│   ├── app/                   # Next.js 14 App Router
│   │   ├── layout.tsx         # Root layout: fonts, providers, navbar
│   │   ├── page.tsx           # Homepage: hero + product grid
│   │   ├── globals.css        # Tailwind + brand CSS variables
│   │   │
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   │
│   │   ├── products/
│   │   │   ├── page.tsx       # Product listing page
│   │   │   └── [slug]/page.tsx # Product detail page
│   │   │
│   │   ├── checkout/page.tsx  # Multi-step checkout
│   │   ├── cart/page.tsx      # Cart page (desktop fallback)
│   │   ├── account/
│   │   │   ├── page.tsx
│   │   │   ├── orders/page.tsx
│   │   │   └── wishlist/page.tsx
│   │   │
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── products/route.ts
│   │       └── orders/route.ts
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx          # Glassmorphism nav + mobile bottom nav
│   │   │   ├── HeroSection.tsx     # Particle hero
│   │   │   └── Providers.tsx       # QueryClient + Session + i18n
│   │   │
│   │   ├── product/
│   │   │   ├── ProductCard.tsx     # Card + Skeleton loader
│   │   │   └── ProductGrid.tsx     # Dynamic grid + filters + pagination
│   │   │
│   │   ├── cart/
│   │   │   └── CartDrawer.tsx      # Slide-in cart with qty controls
│   │   │
│   │   └── checkout/
│   │       └── CheckoutFlow.tsx    # 3-step: Address → Payment → Confirm
│   │
│   ├── lib/
│   │   ├── db/prisma.ts        # Prisma singleton
│   │   ├── auth.ts             # NextAuth options
│   │   ├── utils.ts            # cn(), formatPrice(), etc.
│   │   ├── bd-geography.ts     # All 64 districts & 8 divisions
│   │   └── actions/
│   │       └── products.ts     # Server Actions for DB queries
│   │
│   ├── store/
│   │   └── cart-store.ts       # Zustand: cart + language (persisted)
│   │
│   ├── i18n/
│   │   ├── config.ts
│   │   └── locales/
│   │       ├── en/common.json
│   │       └── bn/common.json
│   │
│   └── types/index.ts          # All TypeScript interfaces
│
├── .env.example               # Environment template
├── tailwind.config.js         # Brand colors, fonts, animations
├── next.config.js
└── package.json
```

---

## Step-by-Step Deployment to Vercel

### Phase 1 — Database Setup (Neon PostgreSQL — Free Tier)

1. Go to **https://neon.tech** → Create account → New Project
2. Name it `verce-bd` → Choose region closest to Bangladesh (Singapore)
3. Copy the **Connection String** — it looks like:
   ```
   postgresql://user:pass@ep-xxx.ap-southeast-1.aws.neon.tech/verce_bd?sslmode=require
   ```
4. Save it as `DATABASE_URL` in your environment

### Phase 2 — Google OAuth Setup

1. Go to **https://console.developers.google.com**
2. Create Project → Enable "Google+ API"
3. Credentials → OAuth 2.0 Client ID → Web Application
4. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (dev)
   - `https://your-app.vercel.app/api/auth/callback/google` (prod)
5. Save `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

### Phase 3 — Local Development

```bash
# 1. Clone and install
git clone https://github.com/your-org/verce-bd.git
cd verce-bd
npm install

# 2. Environment
cp .env.example .env.local
# Fill in DATABASE_URL, NEXTAUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET

# 3. Generate Prisma client & push schema
npx prisma generate
npx prisma db push

# 4. Seed sample data
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts

# 5. Run dev server
npm run dev
# → http://localhost:3000
```

### Phase 4 — Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (from project root)
vercel

# Set environment variables via CLI
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production   # https://your-app.vercel.app
vercel env add GOOGLE_CLIENT_ID production
vercel env add GOOGLE_CLIENT_SECRET production

# Deploy to production
vercel --prod
```

**OR via Vercel Dashboard:**
1. Push to GitHub
2. Go to **vercel.com** → New Project → Import repo
3. Add all env vars under Settings → Environment Variables
4. Deploy

### Phase 5 — Custom Domain

1. Vercel Dashboard → Project → Settings → Domains
2. Add `verce-bd.com` (or your domain)
3. Update DNS at your registrar:
   - A record: `76.76.21.21`
   - CNAME `www`: `cname.vercel-dns.com`
4. Update `NEXTAUTH_URL` to your production domain

---

## Architecture Decisions

### State Management Strategy

| State Type | Tool | Reason |
|---|---|---|
| Server data (products, orders) | TanStack Query | Caching, background refetch, optimistic updates |
| Shopping cart | Zustand + localStorage | Persistent across sessions, simple API |
| Language preference | Zustand + localStorage | Survives page refresh |
| Form state | React Hook Form + Zod | Performant, schema validation |
| Auth session | NextAuth.js JWT | Secure, works with Next.js middleware |

### API Architecture

```
Client Component
    ↓ useQuery(['products', filters])
    ↓ fetch('/api/products?...')
    ↓ Next.js Route Handler
    ↓ getProducts() Server Action
    ↓ Prisma → PostgreSQL (Neon)
    ↑ Serialized JSON (Decimals → numbers)
```

### Performance Optimizations

- **Image Optimization**: Next.js `<Image>` with `sizes` attribute for responsive loading
- **Skeleton Loaders**: Shown immediately, replaced when React Query resolves
- **Stale-While-Revalidate**: Products cached 60s, revalidated in background
- **Code Splitting**: Each page is code-split automatically by App Router
- **Font Optimization**: `next/font/google` preloads fonts and prevents layout shift
- **ISR**: Product pages can use `revalidate = 60` for static generation

### Mobile-First Approach

- Bottom Navigation Bar on mobile (< lg screens) — thumb-friendly
- `aspect-[3/4]` product images prevent layout shift
- Touch-optimized: larger tap targets (44px minimum), swipe-friendly cart
- Safe area insets for notched phones via `pb-safe` utility

---

## Next Steps to Complete the Platform

### High Priority

```
1. [ ] src/app/products/[slug]/page.tsx
       - Full product detail: gallery, variant selector, size guide
       - Add to cart + Buy Now
       - Related products carousel

2. [ ] src/app/auth/login/page.tsx
       - Email/password form + Google OAuth button
       - Redirect after login

3. [ ] src/app/auth/register/page.tsx
       - Registration form with Zod validation
       - bcrypt password hashing

4. [ ] src/app/checkout/page.tsx
       - Wrap <CheckoutFlow /> with auth guard
       - Connect to real order API

5. [ ] src/lib/actions/orders.ts
       - createOrder() Server Action
       - Send confirmation email (Resend.com)
```

### Medium Priority

```
6. [ ] Admin Dashboard (/admin)
       - Product CRUD (with image upload to Cloudinary)
       - Order management
       - Protected by role: 'ADMIN' middleware

7. [ ] src/app/account/orders/page.tsx
       - Order history with status timeline
       - Order detail modal

8. [ ] Image Upload
       - Cloudinary integration for product images
       - Drag-and-drop in admin panel

9. [ ] Search Enhancement
       - Full-text search with PostgreSQL FTS or Algolia
       - Debounced search with React Query
```

### Nice-to-Have

```
10. [ ] SSLCommerz Payment Gateway (BD-specific)
        - Real bKash/Nagad/card integration
        - IPN (Instant Payment Notification) webhook

11. [ ] WhatsApp Order Notification
        - Twilio / WhatsApp Business API
        - Notify customer + admin on new order

12. [ ] PWA Support
        - Service worker for offline browsing
        - App install prompt on mobile

13. [ ] SEO Optimization
        - Dynamic sitemap.xml
        - Structured data (JSON-LD) for products
        - OpenGraph image generation with next/og
```

---

## Security Checklist

- [x] Passwords hashed with bcrypt (cost factor 12)
- [x] JWT session strategy (no DB calls per request)
- [x] NEXTAUTH_SECRET required (32+ chars)
- [x] Input validation with Zod on all forms
- [x] Prisma parameterized queries (SQL injection prevention)
- [ ] Rate limiting on auth endpoints (middleware + Upstash Redis)
- [ ] CSRF protection (NextAuth handles this)
- [ ] Helmet headers (add to next.config.js)
- [ ] Image upload validation (file type + size limits)

---

## Estimated Cost (Production)

| Service | Plan | Cost/month |
|---|---|---|
| Vercel | Hobby (free) | ৳0 |
| Neon PostgreSQL | Free (0.5 GB) | ৳0 |
| Cloudinary | Free (25 GB) | ৳0 |
| Domain (.com) | Annual | ~৳1,500/yr |
| **Total (starter)** | | **~৳125/mo** |

Scale up when traffic grows:
- Vercel Pro: $20/mo (~৳2,200) → unlimited bandwidth
- Neon Pro: $19/mo → 10 GB storage, branching
