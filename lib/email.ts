import { Resend } from "resend";
import { songPageUrl } from "./songlink";

/**
 * Transactional email via Resend, tuned to the occasion the buyer chose.
 *  - sendConfirmationEmail: fires the moment payment clears
 *  - sendSongEmail: the delivery — adapts headline, lead and "moment"
 *    guidance to the occasion (and stays reverent for memorials)
 *
 * ⚠️ Resend only sends from a VERIFIED domain. Set EMAIL_FROM to an
 * address on your verified domain (e.g. "TuneOfUs <hello@tuneofus.com>").
 */
let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY is not set");
    _resend = new Resend(key);
  }
  return _resend;
}

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tuneofus.com";
const REPLY_TO = "hello@tuneofus.com";

/**
 * Sender address. Prefer EMAIL_FROM; otherwise derive hello@<domain> from
 * the site URL. NEVER fall back to onboarding@resend.dev in production —
 * Resend only lets that address email the account owner, so real customers
 * would silently get nothing (403).
 */
function defaultFrom(): string {
  try {
    const host = new URL(SITE).hostname.replace(/^www\./, "");
    return `TuneOfUs <hello@${host}>`;
  } catch {
    return "TuneOfUs <hello@tuneofus.com>";
  }
}
const FROM = process.env.EMAIL_FROM ?? defaultFrom();

const BURGUNDY = "#8a0f33";
const DEEP = "#3c0416";
const GOLD = "#b8860f";
const GOLD_SHEEN = "#e6b93f";
const LINEN = "#fdf8f0";
const CARD = "#f8edda";
const BLUSH = "#fcdde3";
const INK = "#231d3a";
const MUTE = "#6b6680";

const serif = "Georgia, 'Times New Roman', serif";
const sans = "-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

/** Occasion → headline, lead-in, and how-to-share guidance. Keyword-matched
 *  so free-text and future occasions still land on a sensible theme. */
function occasionTheme(occasion: string, theirName: string, yourName: string) {
  const name = theirName?.trim() || "them";
  const from = yourName?.trim() ? yourName.trim() : "";
  const o = (occasion || "").toLowerCase();

  const share = `The move: put your phone down, press play, and watch ${name}'s face. Film it — you'll want to keep this moment.`;
  const base = {
    eyebrow: "Your personalized song",
    headline: `${name}'s song is here.`,
    lead: `You gave us your story — we turned it into a song made only for ${name}. Press play, then play it for them.`,
    tip: share,
    reverent: false,
  };

  if (o.includes("loving memory") || o.includes("celebration of life") || o.includes("miss")) {
    return {
      eyebrow: "A song to remember them by",
      headline: `In memory of ${name}.`,
      lead: `From the memories you shared, we wrote a song to hold ${name} close. Take a quiet moment with it first — it's yours now, to keep and to share with everyone who loved them.`,
      tip: `When you're ready, share it with the people who carry ${name} in their hearts too.`,
      reverent: true,
    };
  }
  if (o.includes("anniversary")) {
    return { ...base, eyebrow: "Your anniversary song", headline: `For ${name} — every word, true.`, lead: `Your story, turned into a song ${name} can play forever. Happy anniversary${from ? `, from ${from}` : ""}.` };
  }
  if (o.includes("valentine")) {
    return { ...base, eyebrow: "Your Valentine's song", headline: `A love letter you can hear.`, lead: `We wrote ${name} a song straight from your story. This is the one that says it better than a card ever could.` };
  }
  if (o.includes("proposal")) {
    return { ...base, eyebrow: "The big question", headline: `The soundtrack to your yes.`, lead: `Here's ${name}'s song — the one to play at the exact right moment. Deep breath. You've got this.`, tip: `Cue it up for the moment, and have someone ready to film. This is one you'll rewatch forever.` };
  }
  if (o.includes("wedding") || o.includes("first dance")) {
    return { ...base, eyebrow: "Your first-dance song", headline: `${name} & you — your song.`, lead: `A one-of-a-kind song built from your story, ready for the dance floor. Play it loud.`, tip: `Send it to your DJ, and keep a copy for the anniversary replays to come.` };
  }
  if (o.includes("mother")) {
    return { ...base, eyebrow: "A song for Mum", headline: `For ${name}, with everything.`, lead: `From the little things you told us, we wrote your mum a song. This is the kind of gift she keeps forever.` };
  }
  if (o.includes("father")) {
    return { ...base, eyebrow: "A song for Dad", headline: `For ${name}, with everything.`, lead: `From the little things you told us, we wrote your dad a song. This is the kind of gift he keeps forever.` };
  }
  if (o.includes("new baby") || o.includes("baby")) {
    return { ...base, eyebrow: "A song for the new arrival", headline: `${name}'s very first song.`, lead: `Welcome to the world, ${name}. Here's a song written just for you — one to play at bedtime for years to come.`, tip: `Save it somewhere safe. One day ${name} will love hearing the song made for their arrival.` };
  }
  if (o.includes("graduation")) {
    return { ...base, eyebrow: "A graduation song", headline: `${name} did it — here's the anthem.`, lead: `A song to mark everything ${name} worked for. Play it loud and proud.` };
  }
  if (o.includes("gotcha") || o.includes("pet")) {
    return { ...base, eyebrow: "A song for your best friend", headline: `${name}'s very own song.`, lead: `Because ${name} is family. Here's a song written from all the little things that make them the best.` };
  }
  if (o.includes("thank")) {
    return { ...base, eyebrow: "A thank-you, in song", headline: `A proper thank you for ${name}.`, lead: `Some thank-yous are too big for words — so we put yours into a song for ${name}.` };
  }
  if (o.includes("birthday")) {
    return { ...base, eyebrow: "Their birthday song", headline: `Happy birthday, ${name}.`, lead: `Forget the generic tune — this is ${name}'s actual birthday song, written from your story.` };
  }
  return base;
}

function shell(inner: string, preheader: string): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"></head>
  <body style="margin:0;padding:0;background:${LINEN};">
    <span style="display:none!important;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">${preheader}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${LINEN};">
      <tr><td align="center" style="padding:24px 12px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
          ${inner}
          <tr><td style="padding:24px 8px 8px;text-align:center;font-family:${sans};color:#9a94a8;font-size:12px;line-height:1.6;">
            Your story. Their song. Ready in 1 hour.<br/>
            <a href="mailto:${REPLY_TO}" style="color:${BURGUNDY};text-decoration:none;">${REPLY_TO}</a>
            &nbsp;·&nbsp; <a href="${SITE}" style="color:${BURGUNDY};text-decoration:none;">TuneOfUs.com</a>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body></html>`;
}

function header(eyebrow: string, reverent: boolean): string {
  const grad = reverent
    ? `linear-gradient(135deg,${DEEP},#5a2340)`
    : `linear-gradient(135deg,${BURGUNDY},#a02050)`;
  return `<tr><td style="background:${grad};border-radius:20px 20px 0 0;padding:30px 24px 24px;text-align:center;">
    <img src="${SITE}/logo/logo-mark.png" width="46" height="39" alt="TuneOfUs" style="display:block;margin:0 auto 8px;border:0;outline:none;"/>
    <div style="font-family:${serif};font-size:22px;font-weight:700;letter-spacing:-.3px;color:${LINEN};">TuneOfUs</div>
    <div style="font-family:${sans};margin-top:10px;font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:${GOLD_SHEEN};">${eyebrow}</div>
  </td></tr>`;
}

export async function sendConfirmationEmail(opts: { to: string; theirName: string; occasion?: string }) {
  const { to, theirName } = opts;
  const name = theirName?.trim() || "them";
  const inner =
    header("We're on it", false) +
    `<tr><td style="background:${LINEN};border:1px solid rgba(138,15,51,.1);border-top:0;border-radius:0 0 20px 20px;padding:28px 24px;">
      <h1 style="font-family:${serif};font-size:25px;line-height:1.25;color:${DEEP};margin:0 0 12px;">We're writing ${name}'s song right now.</h1>
      <p style="font-family:${sans};font-size:16px;line-height:1.65;color:${MUTE};margin:0 0 14px;">Your order came through — thank you. Our studio is turning your story into a real, studio-quality song, and it usually lands in this inbox <strong style="color:${INK};">within a few minutes</strong>.</p>
      <p style="font-family:${sans};font-size:15px;line-height:1.65;color:${MUTE};margin:0;">Quick tip: get your camera ready. You'll want to film ${name}'s reaction. Tag <strong style="color:${BURGUNDY};">#MyTuneOfUs</strong>.</p>
    </td></tr>`;
  return getResend().emails.send({
    from: FROM,
    to,
    replyTo: REPLY_TO,
    subject: `We're writing ${name}'s song right now`,
    html: shell(inner, `${name}'s song is being written — it'll arrive in a few minutes.`),
  });
}

export interface SongEmailOpts {
  to: string;
  theirName: string;
  yourName: string;
  style?: string;
  occasion?: string;
  recipient?: string;
  tracks: { title?: string; audioUrl: string }[];
}

/** Builds the delivery email HTML + subject (no send) — used by the
 *  sender and by the dev preview route. */
export function renderSongEmail(opts: SongEmailOpts): { subject: string; html: string } {
  const { theirName, yourName, style, occasion = "", tracks } = opts;
  const t = occasionTheme(occasion, theirName, yourName);
  const name = theirName?.trim() || "them";
  const clean = tracks.filter((x) => x.audioUrl);
  const styleTag = style ? `<span style="font-family:${sans};font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:${BURGUNDY};opacity:.75;">${style}${occasion ? ` &nbsp;·&nbsp; ${occasion}` : ""}</span>` : "";

  // The song page: listen, save-to-phone, and one-tap sharing all live here.
  const link = songPageUrl(SITE, {
    n: theirName,
    y: yourName,
    o: occasion,
    s: style ?? "",
    t: clean.map((x, i) => ({ title: x.title || `${name}'s song${clean.length > 1 ? ` (v${i + 1})` : ""}`, url: x.audioUrl })),
  });

  const primary = `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:4px auto 0;"><tr><td style="border-radius:999px;background:linear-gradient(180deg,${GOLD_SHEEN},${GOLD});">
    <a href="${link}" style="display:inline-block;padding:16px 34px;font-family:${sans};font-weight:800;font-size:17px;color:${LINEN};text-decoration:none;">▶&nbsp; Open ${name}'s song</a>
  </td></tr></table>`;

  const doThis = `<p style="font-family:${sans};font-size:13.5px;line-height:1.6;color:${MUTE};margin:12px 0 0;text-align:center;">
    Listen, <strong style="color:${INK};">save it to your phone</strong>, and share it — all in one tap.
  </p>`;

  // Direct save-to-phone links (force download via our proxy)
  const dlLinks = clean
    .map((x, i) => {
      const fn = `${name}-song${clean.length > 1 ? `-v${i + 1}` : ""}`;
      const href = `${SITE}/api/download?u=${encodeURIComponent(x.audioUrl)}&name=${encodeURIComponent(fn)}`;
      const label = clean.length > 1 ? `Save version ${i + 1}` : "Save the MP3";
      return `<a href="${href}" style="font-family:${sans};font-size:13px;font-weight:700;color:${BURGUNDY};text-decoration:none;white-space:nowrap;">↓ ${label}</a>`;
    })
    .join(`<span style="color:#d9c9b0;">&nbsp;&nbsp;·&nbsp;&nbsp;</span>`);

  const shareText = encodeURIComponent(`Listen to the song we made for ${name} 🎵\n${link}`);
  const waHref = `https://wa.me/?text=${shareText}`;
  const fbHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`;

  const shareRow = t.reverent
    ? ""
    : `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0 0;">
        <tr><td style="border-top:1px solid rgba(138,15,51,.12);padding-top:18px;text-align:center;">
          <p style="font-family:${sans};font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${BURGUNDY};opacity:.7;margin:0 0 10px;">Share the moment</p>
          <a href="${waHref}" style="display:inline-block;margin:0 4px;padding:10px 18px;border-radius:999px;background:${CARD};font-family:${sans};font-size:14px;font-weight:700;color:${DEEP};text-decoration:none;">WhatsApp</a>
          <a href="${fbHref}" style="display:inline-block;margin:0 4px;padding:10px 18px;border-radius:999px;background:${CARD};font-family:${sans};font-size:14px;font-weight:700;color:${DEEP};text-decoration:none;">Facebook</a>
          <a href="${link}" style="display:inline-block;margin:0 4px;padding:10px 18px;border-radius:999px;background:${CARD};font-family:${sans};font-size:14px;font-weight:700;color:${DEEP};text-decoration:none;">Instagram &amp; more</a>
          <p style="font-family:${sans};font-size:12.5px;color:#9a94a8;margin:12px 0 0;">Post ${name}'s reaction and tag <strong style="color:${BURGUNDY};">#MyTuneOfUs</strong>.</p>
        </td></tr>
      </table>`;

  const giftLine = t.reverent
    ? ""
    : `<p style="font-family:${sans};font-size:14px;line-height:1.6;color:${MUTE};margin:16px 0 0;text-align:center;">
        Want to send it straight to ${name}? Open the song and tap <strong style="color:${INK};">Send it to ${name}</strong>.
      </p>`;

  const tipBox = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0 0;">
    <tr><td style="background:${t.reverent ? "#f3ece4" : BLUSH};border-radius:14px;padding:16px 18px;font-family:${sans};font-size:14px;line-height:1.6;color:${DEEP};">
      ${t.tip}
    </td></tr>
  </table>`;

  const inner =
    header(t.eyebrow, t.reverent) +
    `<tr><td style="background:${LINEN};border:1px solid rgba(138,15,51,.1);border-top:0;border-radius:0 0 20px 20px;padding:28px 24px;">
      ${styleTag ? `<div style="margin:0 0 8px;text-align:center;">${styleTag}</div>` : ""}
      <h1 style="font-family:${serif};font-size:27px;line-height:1.22;color:${DEEP};margin:0 0 12px;text-align:center;">${t.headline}</h1>
      <p style="font-family:${sans};font-size:16px;line-height:1.65;color:${MUTE};margin:0 0 22px;text-align:center;">${t.lead}</p>
      ${primary}
      ${doThis}
      <p style="font-family:${sans};font-size:13px;margin:14px 0 0;text-align:center;">${dlLinks}</p>
      ${giftLine}
      ${shareRow}
      ${tipBox}
      <p style="font-family:${sans};font-size:13px;line-height:1.6;color:#9a94a8;margin:18px 0 0;text-align:center;">
        Not quite right? Just reply to this email — one free revision, always.
      </p>
    </td></tr>`;

  return {
    subject: t.reverent ? `A song in memory of ${name}` : `${name}'s song is ready — listen, save & share`,
    html: shell(inner, t.lead.slice(0, 110)),
  };
}

export async function sendSongEmail(opts: SongEmailOpts) {
  const { subject, html } = renderSongEmail(opts);
  return getResend().emails.send({
    from: FROM,
    to: opts.to,
    replyTo: REPLY_TO,
    subject,
    html,
  });
}
