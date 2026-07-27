# Meta tracking — TuneOfUs

Single-product store: one personalized love song, **US$19**, one-off payment.
The goal is correct attribution of every purchase to the ad that produced it,
**including iOS users who declined tracking** — which is why `Purchase` is sent
only from the server, via the Conversions API.

- **Pixel / dataset:** `2240086196844764`
- **Graph API version:** `v25.0` — defined once in `GRAPH_API_VERSION`
  ([lib/meta-capi.ts](lib/meta-capi.ts)). Never hardcode it elsewhere.
- **Product:** `content_ids: ["tou_song_19"]`, `content_type: "product"`
- No GTM, no dataLayer, no third-party SDK. Native `fetch` + `crypto` only.

---

## 1. Events

| Event | Where it fires | Side | Parameters |
|---|---|---|---|
| `PageView` | Base pixel, every page | Browser | standard |
| `ViewContent` | Landing page mount ([components/Hero.tsx](components/Hero.tsx)) | Browser | `content_ids`, `content_type`, `content_name`, `value: 19.00`, `currency: USD` |
| `StartForm` *(custom)* | Wizard mount ([components/create/Wizard.tsx](components/create/Wizard.tsx)) | Browser | — |
| `CompleteStep` *(custom)* | Each wizard step | Browser | `step`, `step_name` |
| `InitiateCheckout` | Buy-button handler, before the Stripe redirect ([components/ReviewCard.tsx](components/ReviewCard.tsx)) | Browser | `content_ids`, `content_type`, `content_name`, `value`, `currency`, **`eventID`** |
| `Purchase` | **Server only** — inside `fulfillCheckoutSession` ([lib/fulfill.ts](lib/fulfill.ts)) | CAPI | see below |

`ViewContent` is guarded by a module-level flag, so it fires **once per page
session** and never on re-render.

### Purchase payload (server)

```
event_name        Purchase
event_time        Unix seconds
event_id          the same id the browser used for InitiateCheckout
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
4. On payment, `fulfillCheckoutSession` reads them back and sends `Purchase`.

If `_fbc` is missing but the URL carries `fbclid`, the client builds it as
`fb.1.{timestamp}.{fbclid}` and persists it for 90 days
([lib/analytics.ts](lib/analytics.ts) → `ensureFbc`).

> **Note on deduplication.** `Purchase` has no browser counterpart, so nothing
> is actually being de-duplicated today — Meta de-dupes per
> (`event_name`, `event_id`) pair. Sharing the id with `InitiateCheckout` is a
> deliberate safeguard: it gives one traceable id per order, and if a browser
> `Purchase` is ever added, dedup works immediately. **Do not add a browser
> Purchase** without removing the server one.

### Advanced matching

Enabled from `/review` onward — the email only exists after the wizard's last
step. `applyAdvancedMatching(email)` re-inits the pixel with `{ em }`; **fbq
hashes it in the browser**, the raw address is never put into a payload we
build. Verified empirically: a re-init emits **zero** additional events (no
duplicate `PageView`).

---

## 2. Environment variables

| Variable | Where to get it | Notes |
|---|---|---|
| `NEXT_PUBLIC_META_PIXEL_ID` | Events Manager → Data sources → your pixel | `2240086196844764`. Public by design. |
| `META_CAPI_ACCESS_TOKEN` | Events Manager → pixel → Settings → Conversions API → **Generate access token** | **Server-only secret.** Never prefix with `NEXT_PUBLIC_`. |
| `META_CAPI_TEST_EVENT_CODE` | Events Manager → **Test Events** → `TEST#####` | Optional. While set, Purchases go to Test Events, **not production**. Must be empty in prod. |
| `NEXT_PUBLIC_FB_DOMAIN_VERIFICATION` | Events Manager → Settings → Verify Domain → meta-tag method | Paste only the `content` value. |
| `NEXT_PUBLIC_SITE_URL` | — | Must be `https://www.tuneofus.com` (canonical host). |
| `STRIPE_WEBHOOK_SECRET` | Stripe → Developers → Webhooks → your **live** endpoint | Per-endpoint **and per-mode**: a test-mode secret will not validate live events. |

Check what production actually has: `GET /api/health` (booleans only, no values).

---

## 3. Manual test plan

### Setup
1. Set `META_CAPI_TEST_EVENT_CODE` in Vercel Production to the code from
   Events Manager → Test Events. Redeploy.
2. Open Test Events and keep it visible.
3. Use a real browser (the Meta Pixel Helper extension helps).

### Walkthrough
1. **Landing with an ad click:** open
   `https://www.tuneofus.com/?fbclid=TEST123`.
   Expect in Test Events: `PageView`, then `ViewContent` with
   `content_ids: ["tou_song_19"]`, `value 19.00`, `USD`.
   In DevTools → Application → Cookies: `_fbp` **and** `_fbc` present
   (`_fbc` should start `fb.1.`).
2. **Fill the wizard.** Expect `StartForm` and `CompleteStep` (custom events).
3. **On `/review`:** open the console and confirm no error. Advanced matching is
   now on — Pixel Helper shows the pixel with user data attached.
4. **Click "Continue to secure checkout".** Expect `InitiateCheckout` in Test
   Events. **Copy its Event ID** from the event details.
5. **Pay** with a real card ($19).
6. **Within ~1 min**, expect `Purchase` in Test Events with:
   - **Server** as the source (not Browser)
   - the **same Event ID** you copied in step 4
   - `value 19.00`, `currency USD`, `content_ids ["tou_song_19"]`

### Validating deduplication
Meta shows deduplication when the *same* `event_name` arrives from both
browser and server with a matching `event_id`. Since `Purchase` is server-only,
Test Events will show it **once, from Server** — that is the correct result.
What you are validating here is that:
- there is exactly **one** `Purchase` per order (not two),
- its Event ID **matches** the `InitiateCheckout` from the same session,
- its source is **Server**.

If you refresh `/thanks` or Stripe retries the webhook, `Purchase` must **not**
appear again — the two-phase claim in `fulfillCheckoutSession` guarantees one
per order.

### Also confirm
- `PageView` appears **once** per pageview. (The `<noscript>` fallback image is
  Meta's standard snippet; browsers with JS enabled should not request it.)
- No `Purchase` from **Browser**, ever.

### Going live
Clear `META_CAPI_TEST_EVENT_CODE` in Vercel and redeploy, otherwise real
purchases keep landing in Test Events instead of production.

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
