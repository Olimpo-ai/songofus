import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import type { Order, Briefing } from "./types";
import type { UtmData } from "./utm";

/**
 * Simplest storage that survives a webhook: a JSON file in /data.
 *
 * ⚠️ Works perfectly for local dev and a single always-on server.
 * On Vercel the filesystem is EPHEMERAL — the webhook may land on a
 * different instance than the one that stored the briefing. That's why
 * the full briefing is ALSO chunked into Stripe session metadata
 * (see lib/stripe.ts) so the webhook can reconstruct it with zero storage.
 *
 * Upgrade path (in order of effort):
 *   1. Keep metadata-only (already works on Vercel today).
 *   2. Vercel Marketplace Postgres (Neon) + Prisma — swap the four
 *      functions below, nothing else changes.
 *   3. Add a delivered/failed status column + admin list view.
 */
const DATA_DIR = path.join(process.cwd(), "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

async function readAll(): Promise<Order[]> {
  try {
    const raw = await fs.readFile(ORDERS_FILE, "utf8");
    return JSON.parse(raw) as Order[];
  } catch {
    return [];
  }
}

async function writeAll(orders: Order[]) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf8");
}

export async function createOrder(briefing: Briefing, utm: UtmData): Promise<Order> {
  const order: Order = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: "pending",
    briefing,
    utm,
    bump: false,
    upsell: false,
  };
  const orders = await readAll();
  orders.push(order);
  await writeAll(orders);
  return order;
}

export async function getOrder(id: string): Promise<Order | null> {
  const orders = await readAll();
  return orders.find((o) => o.id === id) ?? null;
}

export async function updateOrder(id: string, patch: Partial<Order>): Promise<Order | null> {
  const orders = await readAll();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) return null;
  orders[idx] = { ...orders[idx], ...patch };
  await writeAll(orders);
  return orders[idx];
}
