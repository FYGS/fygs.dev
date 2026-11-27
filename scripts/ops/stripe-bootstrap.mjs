#!/usr/bin/env node
/**
 * Idempotent Stripe configuration for the fygs account: Premium product and its two prices, webhook endpoint, customer portal.
 * Same script for test and live: configure test, check it, then run it again with the live key.
 *
 *   node scripts/ops/stripe-bootstrap.mjs --env ~/.config/fygs-dev/stripe.env.txt --webhook https://staging.fygs.dev/api/stripe/webhook
 *   node scripts/ops/stripe-bootstrap.mjs --env <live env file> --webhook https://fygs.dev/api/stripe/webhook --live
 *
 * Reads STRIPE_SECRET_KEY from the file (outside the repository). Refuses a live key without --live and a test key with it.
 * The webhook signing secret is returned by Stripe only at creation: it is written next to the env file
 * (<file>.webhook-<host>.env), never printed. Nothing secret is logged.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const LIVE = args.includes("--live");
const envFile = opt("--env");
const webhookUrl = opt("--webhook");
if (!envFile || !webhookUrl) { console.error("usage: --env <file> --webhook <url> [--live]"); process.exit(2); }

const env = Object.fromEntries(readFileSync(envFile, "utf8").split(/\r?\n/).filter((l) => l.includes("=") && !l.startsWith("#"))
  .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).replace(/["“”\s]/g, "")]; }));
const KEY = env.STRIPE_SECRET_KEY;
if (!KEY) throw new Error("STRIPE_SECRET_KEY missing");
const isLiveKey = /^(sk|rk)_live_/.test(KEY);
if (isLiveKey !== LIVE) throw new Error(`key is ${isLiveKey ? "LIVE" : "TEST"} but ${LIVE ? "--live was given" : "--live was not given"}: refusing`);

function flat(obj, prefix = "", out = []) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}[${k}]` : k;
    if (v === undefined || v === null) continue;
    if (Array.isArray(v)) v.forEach((x, i) => (typeof x === "object" ? flat(x, `${key}[${i}]`, out) : out.push([`${key}[${i}]`, String(x)])));
    else if (typeof v === "object") flat(v, key, out);
    else out.push([key, String(v)]);
  }
  return out;
}
async function api(method, path, body) {
  const res = await fetch(`https://api.stripe.com${path}`, {
    method,
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: body ? new URLSearchParams(flat(body)) : undefined,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`${method} ${path}: ${json.error?.message}`);
  return json;
}

const acct = await api("GET", "/v1/account");
console.log(`account ${acct.id} (${acct.settings?.dashboard?.display_name}) mode=${LIVE ? "LIVE" : "test"}`);

// 1. Product + prices (found by metadata / lookup_key, so a second run changes nothing)
let product = (await api("GET", "/v1/products?limit=100&active=true")).data.find((p) => p.metadata?.fygs_plan === "premium");
if (!product) {
  product = await api("POST", "/v1/products", {
    name: "FYGS DEV Premium",
    description: "Accès à tous les contenus Premium de fygs.dev",
    metadata: { fygs_plan: "premium" },
  });
  console.log("product created", product.id);
} else console.log("product exists", product.id);

async function ensurePrice(lookup_key, unit_amount, interval) {
  const found = (await api("GET", `/v1/prices?lookup_keys[]=${lookup_key}&active=true`)).data[0];
  if (found) { console.log(`price ${lookup_key} exists`, found.id); return found; }
  const p = await api("POST", "/v1/prices", {
    product: product.id, currency: "eur", unit_amount, lookup_key, recurring: { interval },
    metadata: { fygs_plan: "premium", cycle: interval === "year" ? "yearly" : "monthly" },
  });
  console.log(`price ${lookup_key} created`, p.id);
  return p;
}
const monthly = await ensurePrice("fygs_premium_monthly", 2900, "month");
const yearly = await ensurePrice("fygs_premium_yearly", 29000, "year");

// 2. Webhook endpoint: the 13 events the application handles
const EVENTS = [
  "checkout.session.completed", "checkout.session.async_payment_succeeded", "checkout.session.async_payment_failed",
  "customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted",
  "invoice.payment_succeeded", "invoice.payment_failed",
  "charge.refunded", "charge.refund.updated", "charge.dispute.created", "charge.dispute.closed", "refund.updated",
];
const hooks = (await api("GET", "/v1/webhook_endpoints?limit=100")).data;
let hook = hooks.find((h) => h.url === webhookUrl);
if (!hook) {
  hook = await api("POST", "/v1/webhook_endpoints", { url: webhookUrl, enabled_events: EVENTS, description: "fygs.dev application" });
  const out = `${envFile}.webhook-${new URL(webhookUrl).host}.env`;
  writeFileSync(out, `STRIPE_WEBHOOK_SECRET=${hook.secret}\n`, { mode: 0o600 });
  console.log("webhook created", hook.id, `secret written to ${out}`);
} else {
  const missing = EVENTS.filter((e) => !hook.enabled_events.includes(e));
  if (missing.length) { await api("POST", `/v1/webhook_endpoints/${hook.id}`, { enabled_events: EVENTS }); console.log("webhook events updated"); }
  else console.log("webhook exists", hook.id);
}

// 3. Customer portal: no plan change, cancel at period end, payment method + invoice history
const confs = (await api("GET", "/v1/billing_portal/configurations?limit=20")).data;
const portalBody = {
  business_profile: { headline: "Gérez votre abonnement FYGS DEV Premium" },
  features: {
    customer_update: { enabled: true, allowed_updates: ["email", "address", "tax_id"] },
    invoice_history: { enabled: true },
    payment_method_update: { enabled: true },
    subscription_cancel: { enabled: true, mode: "at_period_end", cancellation_reason: { enabled: true, options: ["too_expensive", "missing_features", "switched_service", "unused", "other"] } },
    subscription_update: { enabled: false },
  },
  metadata: { fygs: "portal" },
};
const portal = confs.find((c) => c.metadata?.fygs === "portal");
if (portal) { await api("POST", `/v1/billing_portal/configurations/${portal.id}`, portalBody); console.log("portal updated", portal.id); }
else { const c = await api("POST", "/v1/billing_portal/configurations", portalBody); console.log("portal created", c.id); }

console.log("\nVariables for the application (Coolify):");
console.log(`  STRIPE_MONTHLY_PRICE_ID=${monthly.id}`);
console.log(`  STRIPE_YEARLY_PRICE_ID=${yearly.id}`);
console.log(`  STRIPE_EXPECT_MODE=${LIVE ? "live" : "test"}`);
console.log("  STRIPE_SECRET_KEY / STRIPE_PUBLISHABLE_KEY: from the env file; STRIPE_WEBHOOK_SECRET: from the .webhook-*.env file");
