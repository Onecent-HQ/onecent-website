# Supershares - Investor Pages V0

A production-ready MVP for verified investors to create profiles, appear on a public list, and share their investment preferences. Uses Civic X authentication.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.local.example` to `.env.local` and fill in your values:
```bash
cp .env.local.example .env.local
```

3. Run the development server:
```bash
npm run dev
```

## Environment Variables

Create a `.env.local` file in the root directory with:

- `MONGODB_URI` - MongoDB connection string (must start with `mongodb://` or `mongodb+srv://`)
- `JWT_SECRET` - Secret key for JWT signing (any random string, e.g., `openssl rand -base64 32`)
- `BASE_URL` - Base URL for the application (e.g., `http://localhost:3000` for development)
- `ADMIN_SECRET` - (Optional) Secret token for admin toggle endpoint. Used to enable contact pass after payment. Generate a random string. If not set, defaults to an insecure value (only for development).

**Note:** The Civic Client ID is already configured in `next.config.ts`. You don't need to set it as an environment variable.

## Routes

- `/` → redirects to `/investors`
- `/signin` → Civic X login
- `/account` → authenticated investor form
- `/investors` → public list of investors
- `/profile/[slug]` → public investor profile

## Admin Toggle (ADMIN_SECRET Explained)

The `ADMIN_SECRET` is a simple authentication token used to protect the admin endpoint that enables contact pass for investors. This is a V0 implementation meant to be replaced with proper payment verification later.

**What it does:**
- When an investor pays the subscription fee to unlock their Telegram contact
- You (as admin) call the API endpoint with the `ADMIN_SECRET` token
- This enables the contact pass, making their Telegram handle visible on their profile

**How to use it:**

1. Generate a secret (choose one):
   ```bash
   # Using openssl
   openssl rand -base64 32
   
   # Or use any random string
   echo "my-super-secret-admin-token-12345"
   ```

2. Add to `.env.local`:
   ```env
   ADMIN_SECRET=your-generated-secret-here
   ```

3. After payment confirmation, enable contact pass:
   ```bash
   curl -X POST http://localhost:3000/api/admin/contact-pass/investor-slug \
     -H "Authorization: Bearer your-generated-secret-here"
   ```

**Security Note:** This is a V0 implementation. In production, replace with proper payment verification (e.g., Solana Pay or Stripe webhook verification).

## Seeding Demo Data

Run the seed script to create demo investors:

```bash
npx tsx scripts/seed.ts
```

**Note:** Make sure your `MONGODB_URI` is set in `.env.local` before running the seed script.

## Tech Stack

- Next.js 14 (App Router) + TypeScript
- TailwindCSS with light glass aesthetic
- MongoDB (Mongoose)
- Civic Auth (X/Twitter)
- Lucide React (icons)
- Recharts (for profile visualizations)

## Features

- Civic X authentication
- Investor-friendly form with sliders and segmented controls
- Public investor list with search
- Shareable profile pages with contact paywall
- Admin toggle for contact pass (V0)

## Quality Standards

- Strict TypeScript
- WCAG AA accessibility
- Input validation and sanitization
- Secure session cookies
- No emojis in UI or code
