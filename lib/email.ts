import { Resend } from "resend";

/**
 * Transactional email via Resend.
 *  - sendConfirmationEmail: fires the moment payment clears ("we're on it")
 *  - sendSongEmail: fires when the Kie/Suno render is ready (the delivery)
 *
 * ⚠️ Resend only sends from a VERIFIED domain. Until you verify
 * tuneofus.com at resend.com/domains, sends only reach the account owner.
 * Set EMAIL_FROM to "TuneOfUs <hello@tuneofus.com>" once verified.
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

const FROM = process.env.EMAIL_FROM ?? "TuneOfUs <onboarding@resend.dev>";
const REPLY_TO = "hello@tuneofus.com";

const BURGUNDY = "#8a0f33";
const DEEP = "#3c0416";
const GOLD = "#b8860f";
const LINEN = "#fdf8f0";
const INK = "#231d3a";

function shell(inner: string): string {
  return `<!doctype html><html><body style="margin:0;padding:0;background:${LINEN};">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:${INK};">
    <div style="text-align:center;margin-bottom:24px;">
      <span style="font-size:22px;font-weight:800;letter-spacing:-.5px;color:${BURGUNDY};">TuneOfUs</span>
    </div>
    ${inner}
    <div style="margin-top:32px;padding-top:20px;border-top:1px solid rgba(138,15,51,.12);text-align:center;color:#8a8598;font-size:12px;">
      Your story. Their song. Ready in 1 hour.<br/>
      <a href="mailto:${REPLY_TO}" style="color:${BURGUNDY};text-decoration:none;">${REPLY_TO}</a> · TuneOfUs.com
    </div>
  </div></body></html>`;
}

function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:linear-gradient(180deg,#e6b93f,${GOLD});color:${LINEN};font-weight:700;text-decoration:none;padding:14px 28px;border-radius:999px;font-size:16px;">${label}</a>`;
}

export async function sendConfirmationEmail(opts: { to: string; theirName: string }) {
  const { to, theirName } = opts;
  const name = theirName?.trim() || "them";
  const html = shell(`
    <h1 style="font-size:26px;line-height:1.25;color:${DEEP};margin:0 0 12px;">We're writing ${name}'s song right now.</h1>
    <p style="font-size:16px;line-height:1.6;color:#55506e;margin:0 0 16px;">
      Your payment came through — thank you. Our studio is turning your story into a real, studio-quality song.
      It'll land in this inbox <strong>within the hour</strong>.
    </p>
    <p style="font-size:16px;line-height:1.6;color:#55506e;margin:0;">
      While you wait: get your camera ready. You'll want to film ${name}'s reaction. Tag <strong>#MyTuneOfUs</strong>.
    </p>`);
  return getResend().emails.send({
    from: FROM,
    to,
    replyTo: REPLY_TO,
    subject: `We're writing ${name}'s song right now`,
    html,
  });
}

export async function sendSongEmail(opts: {
  to: string;
  theirName: string;
  yourName: string;
  style?: string;
  tracks: { title?: string; audioUrl: string }[];
}) {
  const { to, theirName, yourName, style, tracks } = opts;
  const name = theirName?.trim() || "them";
  const from = yourName?.trim() ? ` from ${yourName.trim()}` : "";
  const styleLine = style ? `${style} · ` : "";

  const trackBlocks = tracks
    .filter((t) => t.audioUrl)
    .map(
      (t, i) => `
      <div style="background:#f8edda;border:1px solid rgba(138,15,51,.12);border-radius:14px;padding:18px;margin:0 0 12px;text-align:center;">
        <p style="margin:0 0 12px;font-weight:700;color:${DEEP};font-size:15px;">${t.title || `Version ${i + 1}`}</p>
        ${button(t.audioUrl, "▶  Listen & download")}
      </div>`
    )
    .join("");

  const html = shell(`
    <h1 style="font-size:26px;line-height:1.25;color:${DEEP};margin:0 0 8px;">${name}'s song is ready.</h1>
    <p style="font-size:15px;line-height:1.6;color:#55506e;margin:0 0 20px;">
      ${styleLine}A one-of-a-kind song${from}, written from your story. Press play — then play it for ${name}.
    </p>
    ${trackBlocks}
    <p style="font-size:14px;line-height:1.6;color:#8a8598;margin:16px 0 0;text-align:center;">
      Tip: open on your phone, hit play, and film ${name}'s face. Tag <strong>#MyTuneOfUs</strong>.<br/>
      Not quite right? Just reply to this email — one free revision, always.
    </p>`);

  return getResend().emails.send({
    from: FROM,
    to,
    replyTo: REPLY_TO,
    subject: `🎵 ${name}'s song is ready`,
    html,
  });
}
