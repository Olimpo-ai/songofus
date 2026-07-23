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
- `POST /api/kie/callback` — Kie pings this when rendering finishes; extend it to email/SMS the customer, or keep delivery in n8n.

Verified end-to-end: a real test order generated "Charger at the Cafe" (two takes) via the live API; the hero demo MP3s in `public/audio/` are those takes. Replace them with your curated demos before launch, and generate style-true samples for the Pop/Country tabs (all three currently carry the acoustic test takes).

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

Add your GTM/Pixel snippets to `app/layout.tsx` when you have the IDs.

## Stripe: test → live checklist

1. **Dashboard → Settings → Checkout**: enable Apple Pay & Google Pay (domain verification for Apple Pay).
2. **Settings → Adaptive Pricing**: turn ON → AUD/EUR/GBP shoppers see local prices automatically. No code.
3. Swap `STRIPE_SECRET_KEY` to `sk_live_…` in Vercel env.
4. Create a **live** webhook endpoint → `https://tuneofus.com/api/stripe/webhook`, event `checkout.session.completed` → copy the live `whsec_…` to `STRIPE_WEBHOOK_SECRET`.
5. Place one real order. Confirm n8n received the payload and the song delivered.

## Launch checklist

- [ ] Drop 3 real demo MP3s in `public/audio/`
- [ ] Drop at least 4 real reaction videos + posters in `public/reactions/`
- [ ] `public/og/default.jpg` (1200×630) — test with opengraph.xyz
- [ ] GTM container + Meta Pixel in `app/layout.tsx`; verify events in Meta Events Manager
- [ ] Stripe live keys + live webhook (above)
- [ ] `AUTOMATION_WEBHOOK_URL` pointing at production n8n; test an end-to-end order
- [ ] `NEXT_PUBLIC_SITE_URL=https://tuneofus.com` in Vercel env
- [ ] Real Trustpilot profile linked (or remove the ⭐ trust chip until you have one)
- [ ] Verify `reviewCount` in `app/page.tsx` JSON-LD reflects reality (search engines penalize fake review markup)
- [ ] Run one $1 test ad → confirm UTM shows up in Stripe metadata
