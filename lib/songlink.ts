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

export function songPageUrl(siteUrl: string, d: SongLinkData): string {
  return `${siteUrl.replace(/\/$/, "")}/song?d=${encodeSongLink(d)}`;
}
