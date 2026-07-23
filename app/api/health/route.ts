import { NextResponse } from "next/server";

/**
 * Config health check — reports which delivery-critical env vars are
 * present (booleans only, never values). Lets us diagnose production
 * without exposing secrets. Safe to keep, or delete once verified.
 */
export async function GET() {
  return NextResponse.json({
    stripeSecret: !!process.env.STRIPE_SECRET_KEY,
    stripeWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
    kieKey: !!process.env.KIE_API_KEY,
    resendKey: !!process.env.RESEND_API_KEY,
    emailFrom: process.env.EMAIL_FROM ?? null, // not secret
    automationWebhookUrl: !!process.env.AUTOMATION_WEBHOOK_URL, // boolean only
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? null,
    nodeEnv: process.env.NODE_ENV,
  });
}
