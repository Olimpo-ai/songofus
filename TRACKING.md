# Meta tracking — TuneOfUs

Single-product store: one personalized love song, **US$19**, one-off payment.
The goal is reliable attribution of every funnel step and purchase across both
browser and server signals:

- **Browser pixel ("Song of Us"):** `1050133137708301` (`NEXT_PUBLIC_META_BROWSER_PIXEL_ID`) —
  fires `PageView`, `ViewContent`, `StartForm`, `CompleteStep`, `Lead`,
  `InitiateCheckout`, and `Purchase` (on `/thanks` after server verification).
- **Server CAPI dataset:** `2240086196844764` (`NEXT_PUBLIC_META_PIXEL_ID` +
  `META_CAPI_ACCESS_TOKEN`) — fires `Purchase` via Conversions API inside
  `fulfillCheckoutSession` ([lib/fulfill.ts](lib/fulfill.ts)), so conversions
  also survive iOS users who decline tracking.
- **Graph API version:** `v25.0` — defined once in `GRAPH_API_VERSION`
  ([lib/meta-capi.ts](lib/meta-capi.ts)). Never hardcode it elsewhere.
- **Product:** `content_ids: ["tou_song_19"]`, `content_type: "product"`
- No GTM, no dataLayer, no third-party SDK. Native `fetch` + `crypto` + `fbq` only.

> **Current two-pixel setup & future unification.** Today the browser pixel
> (`1050133137708301`) and the server CAPI dataset (`2240086196844764`) are
> **different pixels**, so Meta does **not** deduplicate between them (and
> neither pixel duplicates purchases on its own). Both already share the same
> `event_id` (`fb_event_id`). Once a Conversions API access token is generated
> for `1050133137708301`, point server CAPI (`NEXT_PUBLIC_META_PIXEL_ID` +
> `META_CAPI_ACCESS_TOKEN`) to `1050133137708301` to unify them and enable
> browser + server deduplication immediately.

---

## 1. Events

| Event | Where it fires | Side (Pixel) | Parameters |
|---|---|---|---|
| `PageView` | Base pixel, every page ([app/layout.tsx](app/layout.tsx)) | Browser (`1050133137708301`) | standard |
| `ViewContent` | Landing page mount ([components/Hero.tsx](components/Hero.tsx)) | Browser (`1050133137708301`) | `content_ids`, `content_type`, `content_name`, `value: 19.00`, `currency: USD` |
| `StartForm` *(custom)* | Wizard mount ([components/create/Wizard.tsx](components/create/Wizard.tsx)) | Browser (`1050133137708301`) | — |
| `CompleteStep` *(custom)* | Each wizard step | Browser (`1050133137708301`) | `step`, `step_name` |
| `Lead` | Wizard submit, before redirect to `/review` ([components/create/Wizard.tsx](components/create/Wizard.tsx)) | Browser (`1050133137708301`) | `content_name: "Song brief"`, `content_category: "love_song"`, **`eventID`** (no `value`; browser-only while server CAPI uses another pixel/token) |
| `InitiateCheckout` | Buy-button handler, before the Stripe redirect ([components/ReviewCard.tsx](components/ReviewCard.tsx)) | Browser (`1050133137708301`) | `content_ids`, `content_type`, `content_name`, `value`, `currency`, **`eventID`** |
| `Purchase` | `/thanks` mount, after `GET /api/purchase-info` confirms paid Stripe session ([components/ThanksContent.tsx](components/ThanksContent.tsx)) | Browser (`1050133137708301`) | `content_ids`, `content_type`, `content_name`, `value`, `currency`, **`eventID`** (`fb_event_id`) |
| `Purchase` | Inside `fulfillCheckoutSession` ([lib/fulfill.ts](lib/fulfill.ts)) | Server CAPI (`2240086196844764`) | see below (`event_id = fb_event_id`) |

- `ViewContent` is guarded by a module-level flag, so it fires **once per page
  session** and never on re-render.
- `Lead` is guarded per `orderId` in `sessionStorage` (`tou_lead_pixel_<orderId>`),
  so it fires at most once per submitted brief.
- Browser `Purchase` is guarded per checkout session by a module-level Set
  (defeating StrictMode/re-renders) and `localStorage` (`tou_purchase_pixel_<sessionId>`,
  written after `fbq` actually fires), with a short retry loop while `window.fbq`
  loads (`afterInteractive`).

### Purchase payload (server CAPI)

```
event_name        Purchase
event_time        Unix seconds
event_id          the same id the browser used for InitiateCheckout and Purchase
action_source     website
event_source_url  https://www.tuneofus.com/
user_data
  em                 SHA-256 of the email, lowercased + trimmed before hashing
  client_ip_address  plain text (first value of x-forwarded-for)
  client_user_agent  plain text
  fbp / fbc          plain text
custom_data       value, currency, content_ids, content_type, content_name
```

### How the event_id travels

1. The buy-button handler generates `crypto.randomUUID()`.
2. It fires browser `InitiateCheckout` with that value as `eventID`, and reads
   the `_fbp` / `_fbc` cookies.
3. It posts `eventId`, `fbp`, `fbc` to `/api/checkout`, which writes them —
   plus the **server-derived** IP and user agent — into the Stripe Checkout
   session metadata as `fb_event_id`, `fb_fbp`, `fb_fbc`, `fb_client_ip`,
   `fb_client_ua`.
4. On `/thanks`, `ThanksContent` calls `GET /api/purchase-info?session_id=...`.
   Only if Stripe confirms `payment_status === "paid"` and `metadata.fb_event_id`
   is present does the endpoint return `{ eventId, value, currency }` (no PII).
   The browser then fires `Purchase` on pixel `1050133137708301` with
   `eventID = fb_event_id`.
5. On payment (via `/api/fulfill` or `/api/stripe/webhook`),
   `fulfillCheckoutSession` reads the metadata back and sends server CAPI
   `Purchase` to pixel `2240086196844764` with the same `event_id`.

If `_fbc` is missing but the URL carries `fbclid`, the client builds it as
`fb.1.{timestamp}.{fbclid}` and persists it for 90 days
([lib/analytics.ts](lib/analytics.ts) → `ensureFbc`).

> **Note on deduplication.** Meta deduplicates per (`pixel`, `event_name`,
> `event_id`). Because the browser currently sends `Purchase` to
> `1050133137708301` and the server sends `Purchase` to `2240086196844764`,
> there is **no deduplication between them today**. Within each pixel, a
> purchase is never duplicated: browser `Purchase` is guarded by a module flag
> + `localStorage` (`tou_purchase_pixel_<sessionId>`), and server CAPI
> `Purchase` is guarded by the two-phase claim in `fulfillCheckoutSession`.
> When a CAPI token for `1050133137708301` is provisioned, unifying server CAPI
> onto `1050133137708301` activates browser + server deduplication immediately
> because both already send the exact same `fb_event_id`.

### Advanced matching

Enabled from `/review` onward — the email only exists after the wizard's last
step. `applyAdvancedMatching(email)` re-inits the browser pixel
(`config.metaBrowserPixelId`) with `{ em }`; **fbq hashes it in the browser**,
the raw address is never put into a payload we build. Verified empirically: a
re-init emits **zero** additional events (no duplicate `PageView`).

---

## 2. Environment variables

| Variable | Where to get it | Notes |
|---|---|---|
| `NEXT_PUBLIC_META_BROWSER_PIXEL_ID` | Events Manager → Data sources → "Song of Us" pixel | Defaults to `1050133137708301`. Public by design. Used only in the browser. |
| `NEXT_PUBLIC_META_PIXEL_ID` | Events Manager → Data sources → CAPI pixel | Defaults to `2240086196844764`. Public by design. Used by server CAPI (paired with `META_CAPI_ACCESS_TOKEN`). |
| `META_CAPI_ACCESS_TOKEN` | Events Manager → pixel → Settings → Conversions API → **Generate access token** | **Server-only secret.** Never prefix with `NEXT_PUBLIC_`. |
| `META_CAPI_TEST_EVENT_CODE` | Events Manager → **Test Events** → `TEST#####` | Optional. While set, server CAPI Purchases go to Test Events, **not production**. Must be empty in prod. |
| `NEXT_PUBLIC_FB_DOMAIN_VERIFICATION` | Events Manager → Settings → Verify Domain → meta-tag method | Paste only the `content` value. |
| `NEXT_PUBLIC_SITE_URL` | — | Must be `https://www.tuneofus.com` (canonical host). |
| `STRIPE_WEBHOOK_SECRET` | Stripe → Developers → Webhooks → your **live** endpoint | Per-endpoint **and per-mode**: a test-mode secret will not validate live events. |

Check what production actually has: `GET /api/health` (exposes `metaPixelId` and
`metaBrowserPixelId`, booleans only for secrets).

---

## 3. Manual test plan

### Setup
1. Set `META_CAPI_TEST_EVENT_CODE` in Vercel Production to the code from
   Events Manager → Test Events (for pixel `2240086196844764`). Redeploy.
2. Open Test Events for browser pixel `1050133137708301` (and separately for
   server pixel `2240086196844764` if checking CAPI).
3. Use a real browser (the Meta Pixel Helper extension helps confirm only
   `1050133137708301` fires in the browser — never `2240086196844764`).

### Walkthrough
1. **Landing with an ad click:** open
   `https://www.tuneofus.com/?fbclid=TEST123`.
   Expect on pixel `1050133137708301`: `PageView`, then `ViewContent` with
   `content_ids: ["tou_song_19"]`, `value 19.00`, `USD`.
   In DevTools → Application → Cookies: `_fbp` **and** `_fbc` present
   (`_fbc` should start `fb.1.`).
2. **Fill and submit the wizard.** Expect `StartForm`, `CompleteStep` (custom
   events), and on submit `Lead` (`content_name: "Song brief"`,
   `content_category: "love_song"`, no `value`, with an `eventID`).
3. **On `/review`:** open the console and confirm no error. Advanced matching is
   now on for pixel `1050133137708301` — Pixel Helper shows user data attached.
4. **Click "Continue to secure checkout".** Expect `InitiateCheckout` on pixel
   `1050133137708301`. **Copy its Event ID** from the event details.
5. **Pay** with a real card ($19) and land on `/thanks`.
6. **Confirm both Purchases:**
   - **Browser (`1050133137708301`):** `Purchase` fires on `/thanks` with the
     **same Event ID** from step 4, `value 19.00`, `currency USD`,
     `content_ids ["tou_song_19"]`.
   - **Server CAPI (`2240086196844764`):** within ~1 min, `Purchase` arrives
     from **Server** with the **same Event ID**, `value 19.00`, `currency USD`,
     `content_ids ["tou_song_19"]`.

### Validating non-duplication
- Refreshing `/thanks` must **not** fire a second browser `Purchase`
  (`localStorage` key `tou_purchase_pixel_<sessionId>` + module guard).
- Refreshing `/thanks` or Stripe webhook retries must **not** send a second
  server CAPI `Purchase` (two-phase claim in `fulfillCheckoutSession`).
- No browser event should ever be sent to `2240086196844764`.
- Once server CAPI is unified onto `1050133137708301`, Test Events on that pixel
  will show Browser + Server `Purchase` deduplicated by matching `event_id`.

### Also confirm
- `PageView` appears **once** per pageview. (The `<noscript>` fallback image is
  Meta's standard snippet; browsers with JS enabled should not request it.)

### Going live
Clear `META_CAPI_TEST_EVENT_CODE` in Vercel and redeploy, otherwise real
server CAPI purchases keep landing in Test Events instead of production.

---

## 4. Resending a failed Purchase

A failed send never breaks the order. It logs one structured line:

```
[meta] PURCHASE_FAILED — resend manually, see TRACKING.md
  { event_id, session_id, status, error }
```

Find it in **Vercel → your project → Logs**, filter `PURCHASE_FAILED`.
No personal data is logged — the email only ever leaves hashed, inside the payload.

To resend, take `session_id` from the log line, read the values you need from
the Stripe session metadata (`fb_event_id`, `fb_fbp`, `fb_fbc`,
`fb_client_ip`, `fb_client_ua`, `customer_email`), then:

```bash
# 1) hash the email exactly as the app does (lowercase + trim, then SHA-256)
EMAIL_HASH=$(printf '%s' "buyer@example.com" | tr '[:upper:]' '[:lower:]' | shasum -a 256 | cut -d' ' -f1)

# 2) resend with the ORIGINAL event_id so it stays de-duplicable
curl -X POST "https://graph.facebook.com/v25.0/2240086196844764/events?access_token=$META_CAPI_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "data": [{
      "event_name": "Purchase",
      "event_time": 1785000000,
      "event_id": "PASTE_EVENT_ID_FROM_LOG",
      "action_source": "website",
      "event_source_url": "https://www.tuneofus.com/",
      "user_data": {
        "em": ["'"$EMAIL_HASH"'"],
        "client_ip_address": "PASTE_fb_client_ip",
        "client_user_agent": "PASTE_fb_client_ua",
        "fbp": "PASTE_fb_fbp",
        "fbc": "PASTE_fb_fbc"
      },
      "custom_data": {
        "value": 19.00,
        "currency": "USD",
        "content_ids": ["tou_song_19"],
        "content_type": "product"
      }
    }]
  }'
```

`event_time` must be the original purchase time in Unix seconds and **within
the last 7 days**; older events are rejected. Reusing the original `event_id`
means a resend can never double-count.
