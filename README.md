# TuneOfUs

**Your story. Their song. Ready in 1 hour.** — Next.js 14 (App Router) + Tailwind, deployable on Vercel.

The site sells and collects; it never generates the song. On payment, the full briefing is handed off to your n8n automation (`AUTOMATION_WEBHOOK_URL`) which runs lyrics → Suno/Kie → delivery.

## Run it

```bash
npm install
cp .env.example .env.local   # fill in your keys
npm run dev                  # http://localhost:3000
```

Test the Stripe webhook locally:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
# copy the whsec_… it prints into STRIPE_WEBHOOK_SECRET in .env.local
```

Test card: `4242 4242 4242 4242`, any future date, any CVC.

## Where to drop your media

| What | Where | Notes |
|---|---|---|
| Demo songs | `public/audio/demo-pop.mp3`, `demo-acoustic.mp3`, `demo-country.mp3` | Hero player tabs + form step 5 previews |
| Reaction videos | `public/reactions/r1.mp4` … `r6.mp4` + `r1-poster.jpg` … | Vertical 9:16, phone-shot style. Captions edited in `lib/content.ts` |
| Moment photo | `public/moments/kitchen-dance.jpg` | Emotional band between comparison & offer |
| OG image | `public/og/default.jpg` | 1200×630 |

The poster JPGs, moment photo and OG image ship with **AI-generated placeholders** (Higgsfield Soul). They look real and warm, but replace the reaction posters with genuine customer UGC as soon as you have it — real faces + real captions convert harder and keep the "real reactions" claim honest. Until video files exist, tapping a card shows a "coming soon" placeholder — nothing breaks.

## Edit copy & config

- **Every word on the site**: `lib/content.ts` (i18n-ready — add another language object later).
- **Prices, tears counter, urgency flag**: `lib/config.ts` + env vars:
  - `NEXT_PUBLIC_TEARS_COUNT="14,000+"` — hero social-proof number
  - `NEXT_PUBLIC_SHOW_URGENCY=true|false` — "Launch price" pill (never a fake countdown)
- **Activity toasts**: `data/toasts.json` — plain strings, edit freely. 1 per 45s, landing page only.

## The funnel

```
/            landing (ViewContent)
/create      6-step Typeform-style briefing (StartForm, CompleteStep 1–6)
             → POST /api/briefing (pending order) →
/review      order recap + $15 order-bump checkbox (InitiateCheckout)
             → POST /api/checkout → Stripe hosted Checkout (Apple/Google Pay) →
/thanks      confetti + recap + $30 photo-video upsell (second Checkout)

Stripe → /api/stripe/webhook (checkout.session.completed)
       → marks order paid → POSTs full briefing to AUTOMATION_WEBHOOK_URL
```

The briefing is **chunked into Stripe session metadata**, so the webhook can rebuild it even if local storage is gone — this is what makes the JSON-file store safe on serverless.

Core price is **$19** (struck from $49) — all price values live in `lib/config.ts`.

## Direct song generation (Kie.ai / Suno)

If `AUTOMATION_WEBHOOK_URL` is empty and `KIE_API_KEY` is set, the paid-order webhook generates the song itself:

- `lib/kie.ts` — builds a Suno prompt from the briefing, calls `POST api.kie.ai/api/v1/generate` (model from `KIE_SUNO_MODEL`, default V5), polls `GET …/generate/record-info?taskId=`.
- `POST /api/generate-song {orderId}` — start a generation manually (testing). `GET /api/generate-song?taskId=…` — poll status; `SUCCESS` returns track `audioUrl`s.
- `POST /api/kie/callback` — Kie pings this when rendering finishes. It decodes the delivery token from the `?d=` param, fetches the finished tracks, and **emails the song to the buyer via Resend**.

### Fulfillment without a webhook

Delivery does **not** require a Stripe webhook. After payment, Stripe redirects to
`/thanks?...&session_id=cs_...`; that page calls **`POST /api/fulfill { sessionId }`**,
which retrieves the session server-side (Secret key), verifies `payment_status === "paid"`,
then sends the confirmation email and starts the song. Works in test and live mode with
only the Stripe Secret key.

If a Stripe webhook *is* configured, it calls the same path (`lib/fulfill.ts` →
`fulfillCheckoutSession`). Both are **idempotent** — a `tou_fulfilled` flag on the
PaymentIntent metadata means a customer never gets two songs.

**Recover a failed delivery:** `curl -X POST https://www.tuneofus.com/api/fulfill -H 'content-type: application/json' -d '{"sessionId":"cs_test_..."}'` — re-runs delivery for that order (skips if already fulfilled). Find the session id in Stripe → Payments → the payment → Checkout session.

### Email delivery (Resend)

When the site owns generation (no `AUTOMATION_WEBHOOK_URL`), it also owns delivery:

1. **On payment** (`checkout.session.completed`) → instant confirmation email: "We're writing [name]'s song right now."
2. **When the render completes** → the Kie callback emails the finished song (both versions) with listen/download links.

Because the render is async and serverless has no shared memory, the buyer's email + names are packed into the callback URL as a base64url token (`lib/kie.ts` `encodeDelivery`) — **no database needed**. Emails are built in `lib/email.ts` (branded, inline-styled).

⚠️ **Verify your domain first.** Resend only sends from a verified domain. Until you verify `tuneofus.com` at [resend.com/domains](https://resend.com/domains) and set `EMAIL_FROM="TuneOfUs <hello@tuneofus.com>"`, delivery only reaches the Resend account owner's inbox. This is the #1 launch blocker for delivery.

Set `RESEND_API_KEY` + `EMAIL_FROM` in Vercel. Verified end-to-end locally: a completion callback delivered a real Suno track by email.

### The song page (mobile-first listen / save / share)

The delivery email's primary button opens **`/song?d=<token>`** — a mobile-first page (`components/SongDelivery.tsx`) where any user can, in one tap:

- **Listen** (native audio players per version)
- **Save to my phone** — a real download. `/api/download` proxies the MP3 back with `Content-Disposition: attachment` so phones save the file instead of opening an in-browser player. (Restricted to known song hosts — not an open proxy.)
- **Send it to [name]** — WhatsApp / native share, gift-framed
- **Share** — native share sheet (covers Instagram, Messages, etc.) + explicit WhatsApp, Facebook, Instagram buttons, and copy-link. Instagram has no web post-intent, so that button copies the caption + link and opens Instagram.

The token (`lib/songlink.ts`) carries names, occasion, style and the track URLs — no email/PII — so the link is safe to forward as a gift. The email also includes direct `↓ Save version N` links (same download proxy) and WhatsApp/Facebook share links for people who never leave their inbox.

**Timing:** delivery fires on the Kie completion callback (~2–4 min), not an hour. Confirmation + `/thanks` + delivery copy all say "within minutes."

⚠️ _Track URLs in the token are Kie CDN links; if they ever expire, the page/download break. To harden, copy each MP3 to Vercel Blob on delivery and encode the Blob URL instead._

_Note: if Kie fires the completion callback more than once, the buyer could get a duplicate song email (no durable dedup without a DB). Rare; acceptable for MVP. Add a KV/Postgres `delivered` flag to harden._

Verified end-to-end via the live API. All eight style previews in `public/audio/` are real Suno-generated songs, each written to its genre:

| File | Style | Story |
|---|---|---|
| `demo-pop.mp3` | Pop | Emma's 30th birthday |
| `demo-acoustic.mp3` | Acoustic | "Charger at the Cafe" (Lisbon) |
| `demo-country.mp3` | Country | Katie's dad, the red pickup |
| `demo-rnb.mp3` | R&B | Marcus & Alicia anniversary |
| `demo-rock.mp3` | Rock | Jake & Danny's garage band |
| `demo-hiphop.mp3` | Hip-Hop | Chris's tribute to mom Denise |
| `demo-latin.mp3` | Latin | Diego & Sofia in Barcelona |
| `demo-folk.mp3` | Indie Folk | Hannah's sister Beth's wedding |

The vibe step also has a free-text "describe your own style" field — when filled, it overrides the chip selection and passes straight into the Suno prompt.

⚠️ **The Kie API key rotates.** If generation returns `401`, mint a fresh key in your Kie dashboard and update `KIE_API_KEY` (locally in `.env.local`, in prod on Vercel).

### Automation payload (what your n8n receives)

```json
{
  "event": "purchase",
  "product": "song" | "video",
  "orderId": "uuid",
  "stripeSessionId": "cs_…",
  "amountTotal": 5400,
  "currency": "usd",
  "briefing": {
    "recipient": "Mum", "occasion": "Birthday",
    "theirName": "Maria", "yourName": "Alex",
    "story": "…", "style": "Acoustic", "mood": "Emotional",
    "email": "buyer@…", "phone": "+61…"
  },
  "bump": true,
  "utm": { "source": "facebook", "campaign": "anniv-v3", "content": "hook-cry" }
}
```

Return a non-200 and Stripe retries the event automatically (built-in reliability).

## Storage

Pending orders live in `data/orders.json` (git-ignored). Fine for dev / a single VPS.
On Vercel, the filesystem is ephemeral — the webhook works anyway because it rebuilds the briefing from Stripe metadata. **Upgrade path:** swap the four functions in `lib/store.ts` for Vercel Marketplace Postgres (Neon) + Prisma when you want an order dashboard; nothing else changes.

## Analytics

Client events push to `window.dataLayer` (GTM) and Meta Pixel if `fbq` is present: `ViewContent`, `StartForm`, `CompleteStep(n)`, `InitiateCheckout`. The authoritative **Purchase** signal is server-side — your n8n receives it from the webhook and can forward to Meta CAPI. UTM params are captured on landing (first touch), persisted through the form, and attached to Stripe metadata, so revenue is attributable per ad creative.

**Meta Pixel is installed** in `app/layout.tsx` (base code + PageView). The ID defaults to `1050133137708301` and can be overridden with `NEXT_PUBLIC_META_PIXEL_ID`. Standard events fire automatically: `StartForm` / `CompleteStep` / `InitiateCheckout` via `lib/analytics.ts`, and **`Purchase`** on the `/thanks` page (deduplicated per order via localStorage, with the real order value + bump). For server-side accuracy, also wire Meta CAPI from the Stripe webhook — that Purchase is the authoritative one.

## Stripe: test → live checklist

1. **Dashboard → Settings → Checkout**: enable Apple Pay & Google Pay (domain verification for Apple Pay).
2. **Settings → Adaptive Pricing**: turn ON → AUD/EUR/GBP shoppers see local prices automatically. No code.
3. Swap `STRIPE_SECRET_KEY` to `sk_live_…` in Vercel env.
4. Create a **live** webhook endpoint → **`https://www.tuneofus.com/api/stripe/webhook`** (⚠️ MUST use the canonical `www` host — the apex `tuneofus.com` 308-redirects and **Stripe does not follow redirects**, so an apex endpoint silently fails every delivery). Event: `checkout.session.completed` → copy the live `whsec_…` to `STRIPE_WEBHOOK_SECRET`.
5. Place one real order. Confirm n8n received the payload and the song delivered.

## Launch checklist

- [ ] Drop 3 real demo MP3s in `public/audio/`
- [ ] Drop at least 4 real reaction videos + posters in `public/reactions/`
- [ ] `public/og/default.jpg` (1200×630) — test with opengraph.xyz
- [ ] GTM container + Meta Pixel in `app/layout.tsx`; verify events in Meta Events Manager
- [ ] Stripe live keys + live webhook (above)
- [ ] `AUTOMATION_WEBHOOK_URL` pointing at production n8n; test an end-to-end order
- [ ] `NEXT_PUBLIC_SITE_URL=https://www.tuneofus.com` in Vercel env (canonical www host)
- [ ] `EMAIL_FROM=TuneOfUs <hello@tuneofus.com>` in Vercel (or rely on the derived default) — must be a verified-domain address, never onboarding@resend.dev
- [ ] Check config anytime: `GET /api/health` reports which delivery env vars are set
- [ ] Real Trustpilot profile linked (or remove the ⭐ trust chip until you have one)
- [ ] Verify `reviewCount` in `app/page.tsx` JSON-LD reflects reality (search engines penalize fake review markup)
- [ ] Run one $1 test ad → confirm UTM shows up in Stripe metadata
