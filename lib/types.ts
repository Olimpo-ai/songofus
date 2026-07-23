import type { UtmData } from "./utm";

export interface Briefing {
  recipient: string;
  occasion: string;
  theirName: string;
  yourName: string;
  story: string;
  style: string;
  mood: string;
  voice?: string;
  email: string;
  phone?: string;
}

export interface Order {
  id: string;
  createdAt: string;
  status: "pending" | "paid" | "delivered";
  briefing: Briefing;
  utm: UtmData;
  bump: boolean;
  upsell: boolean;
  stripeSessionId?: string;
  amountTotal?: number;
  currency?: string;
  paidAt?: string;
  kieTaskId?: string;
}
