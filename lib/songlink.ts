/**
 * Compact token for the shareable song page (/song?d=...).
 * Carries names, occasion, style and the track URLs — no personal email.
 * Short keys keep the URL small. Server-side encode (Buffer);
 * the page decodes client-side with a UTF-8-safe base64url reader.
 */
export interface SongLinkData {
  n: string; // theirName
  y: string; // yourName
  o: string; // occasion
  s: string; // style
  t: { title: string; url: string }[]; // tracks
}

export function encodeSongLink(d: SongLinkData): string {
  return Buffer.from(JSON.stringify(d), "utf8").toString("base64url");
}

/** Server-side decode (for generateMetadata / OG). */
export function decodeSongLink(token: string): SongLinkData | null {
  try {
    return JSON.parse(Buffer.from(token, "base64url").toString("utf8")) as SongLinkData;
  } catch {
    return null;
  }
}

export function songPageUrl(siteUrl: string, d: SongLinkData): string {
  return `${siteUrl.replace(/\/$/, "")}/song?d=${encodeSongLink(d)}`;
}
