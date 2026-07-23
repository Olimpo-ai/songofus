import { put, list } from "@vercel/blob";
import type { SongLinkData } from "./songlink";

/**
 * Short links via Vercel Blob. When BLOB_READ_WRITE_TOKEN is set (enable a
 * Blob store in the Vercel dashboard — one click), the delivered song gets
 * a tidy /s/<id> link and its data is stored durably. Without Blob, callers
 * fall back to the long self-contained /song?d=<token> link.
 *
 * IDs are short, URL-safe, and unguessable enough for gift links.
 */
const PREFIX = "songs/";

export function blobEnabled(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

/** 10-char id from the delivery seed (deterministic-ish, no RNG needed). */
function makeId(seed: string): string {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const a = (h >>> 0).toString(36);
  const b = Math.imul(h ^ seed.length, 2654435761) >>> 0;
  return (a + b.toString(36)).slice(0, 10);
}

/** Store the song data and return a short id, or null if Blob is unavailable. */
export async function createShortSong(data: SongLinkData): Promise<string | null> {
  if (!blobEnabled()) return null;
  try {
    const seed = JSON.stringify(data) + (data.t?.[0]?.url ?? "");
    const id = makeId(seed);
    await put(`${PREFIX}${id}.json`, JSON.stringify(data), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 31536000,
    });
    return id;
  } catch (err) {
    console.error("createShortSong failed", err);
    return null;
  }
}

/** Fetch song data by short id. */
export async function getShortSong(id: string): Promise<SongLinkData | null> {
  if (!blobEnabled() || !/^[a-z0-9]{1,16}$/i.test(id)) return null;
  try {
    const { blobs } = await list({ prefix: `${PREFIX}${id}.json`, limit: 1 });
    const blob = blobs.find((b) => b.pathname === `${PREFIX}${id}.json`);
    if (!blob) return null;
    const res = await fetch(blob.url, { cache: "force-cache" });
    if (!res.ok) return null;
    return (await res.json()) as SongLinkData;
  } catch (err) {
    console.error("getShortSong failed", err);
    return null;
  }
}
