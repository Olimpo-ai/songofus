import type { Briefing } from "./types";

/**
 * Kie.ai music API (Suno models). The site can generate songs directly
 * when KIE_API_KEY is set — used as the fallback pipeline when no
 * AUTOMATION_WEBHOOK_URL (n8n) is configured, and by /api/generate-song
 * for testing.
 *
 * Endpoints:
 *   POST https://api.kie.ai/api/v1/generate            → { taskId }
 *   GET  https://api.kie.ai/api/v1/generate/record-info?taskId=…
 */
const KIE_BASE = "https://api.kie.ai/api/v1";

function key(): string {
  const k = process.env.KIE_API_KEY;
  if (!k) throw new Error("KIE_API_KEY is not set");
  return k;
}

/** Turn a briefing into a Suno prompt. Non-custom mode: Suno writes the lyrics from this description. */
export function briefingToPrompt(b: Briefing): string {
  const tone = b.mood === "Fun" || b.mood === "Uplifting" ? "bright, joyful" : "warm, heartfelt";
  const voiceMap: Record<string, string> = {
    Female: "female lead vocal",
    Male: "male lead vocal",
    Duet: "male and female duet",
    "Surprise me": "the best-fitting vocal",
  };
  const vocal = `${tone} ${voiceMap[b.voice ?? "Surprise me"] ?? "the best-fitting vocal"}`;
  return [
    `A ${b.mood.toLowerCase()} ${b.style.toLowerCase()} song for ${b.theirName}, from ${b.yourName}.`,
    `Occasion: ${b.occasion}. The recipient is their ${b.recipient.toLowerCase()}.`,
    `Their story, to be woven into the lyrics with real details and names:`,
    b.story,
    `${vocal}, studio quality, a memorable chorus that uses the name ${b.theirName}, around 2 minutes.`,
  ].join("\n");
}

/**
 * The song render is async and the Kie callback arrives on a fresh
 * serverless instance with no memory of the order. So we pack the
 * delivery details into the callback URL itself (base64url) and read
 * them back when Kie calls us. No database required.
 */
export interface DeliveryData {
  to: string;
  theirName: string;
  yourName: string;
  style: string;
  occasion: string;
  recipient: string;
}
export function encodeDelivery(d: DeliveryData): string {
  return Buffer.from(JSON.stringify(d)).toString("base64url");
}
export function decodeDelivery(s: string | null): DeliveryData | null {
  if (!s) return null;
  try {
    return JSON.parse(Buffer.from(s, "base64url").toString("utf8")) as DeliveryData;
  } catch {
    return null;
  }
}

export async function startSongGeneration(b: Briefing, callBackUrl: string): Promise<string> {
  const res = await fetch(`${KIE_BASE}/generate`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key()}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.KIE_SUNO_MODEL ?? "V5",
      customMode: false,
      instrumental: false,
      callBackUrl,
      prompt: briefingToPrompt(b).slice(0, 3900),
    }),
  });
  const json = await res.json();
  if (json.code !== 200 || !json.data?.taskId) {
    throw new Error(`Kie generate failed: ${json.msg ?? res.status}`);
  }
  return json.data.taskId as string;
}

export interface KieTrack {
  id: string;
  audioUrl?: string;
  streamAudioUrl?: string;
  imageUrl?: string;
  title?: string;
  duration?: number;
}

export async function getSongTask(taskId: string): Promise<{
  status: string;
  tracks: KieTrack[];
}> {
  const res = await fetch(`${KIE_BASE}/generate/record-info?taskId=${encodeURIComponent(taskId)}`, {
    headers: { Authorization: `Bearer ${key()}` },
    cache: "no-store",
  });
  const json = await res.json();
  if (json.code !== 200) throw new Error(`Kie record-info failed: ${json.msg ?? res.status}`);
  const data = json.data ?? {};
  const list = data.response?.sunoData ?? [];
  return {
    status: data.status ?? "UNKNOWN",
    tracks: list.map((t: Record<string, unknown>) => ({
      id: String(t.id ?? ""),
      audioUrl: (t.audioUrl as string) || undefined,
      streamAudioUrl: (t.streamAudioUrl as string) || undefined,
      imageUrl: (t.imageUrl as string) || undefined,
      title: (t.title as string) || undefined,
      duration: (t.duration as number) || undefined,
    })),
  };
}
