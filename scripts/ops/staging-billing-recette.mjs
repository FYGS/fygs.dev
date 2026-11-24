#!/usr/bin/env node
/**
 * Billing workflow recette on the STAGING site, in a real browser, with the Stripe TEST card.
 * Every step is cross-checked three ways: what the page shows, what Stripe holds, what the database holds.
 *
 *   STAGING_DB_URL=postgres://…@127.0.0.1:15433/fygs node scripts/ops/staging-billing-recette.mjs [outDir]
 *
 * STAGING_DB_URL points at the staging database through an SSH tunnel (the database is not reachable from outside).
 * Credentials: ~/.config/fygs-dev/staging-admin.env (STAGING_URL) and ~/.config/fygs-dev/stripe.env.txt (test key).
 * Refuses to run against anything that is not a *.fygs.dev staging host or with a live Stripe key.
 */
import { readFileSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { chromium } from "@playwright/test";
import pg from "pg";

const OUT = process.argv[2] || "recette-out";
mkdirSync(OUT, { recursive: true });

const readEnv = (file, sep = "=") => {
  const out = {};
  for (const l of readFileSync(file, "utf8").split(/\r?\n/)) {
    const i = l.indexOf(sep);
    if (i > 0 && !l.startsWith("#")) out[l.slice(0, i).trim()] = l.slice(i + 1).replace(/[^\x20-\x7E]/g, "").trim();
  }
  return out;
};
const admin = readEnv(join(homedir(), ".config", "fygs-dev", "staging-admin.env"));
const stripeEnv = readEnv(join(homedir(), ".config", "fygs-dev", "stripe.env.txt"));
const BASE = admin.STAGING_URL;
const SK = (stripeEnv.STRIPE_SECRET_KEY || "").replace(/[^A-Za-z0-9_]/g, "");
if (!/^https:\/\/staging\.fygs\.dev$/.test(BASE)) throw new Error(`refusing to run against ${BASE}`);
if (!SK.startsWith("sk_test_") && !SK.startsWith("rk_test_")) throw new Error("a Stripe TEST key is required");
if (!process.env.STAGING_DB_URL) throw new Error("STAGING_DB_URL is required (tunnel to the staging database)");

const db = new pg.Client({ connectionString: process.env.STAGING_DB_URL });
await db.connect();

const stripe = async (path) => {
  const r = await fetch(`https://api.stripe.com/v1/${path}`, { headers: { authorization: `Basic ${Buffer.from(`${SK}:`).toString("base64")}` } });
  const j = await r.json();
  if (j.error) throw new Error(`stripe ${path}: ${j.error.message}`);
  return j;
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function until(fn, label, ms = 90_000) {
  const end = Date.now() + ms;
  let last;
  while (Date.now() < end) {
    try {
      last = await fn();
      if (last) return last;
    } catch (e) {
      last = e;
    }
    await sleep(2000);
  }
  throw new Error(`timeout waiting for ${label}`);
}

const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "  PASS" : "  FAIL"}  ${name}${detail ? `  (${detail})` : ""}`);
}

// ── learner ─────────────────────────────────────────────────────────────────────────────────────────────────────────
async function newLearner(browser, tag) {
  const email = `recette-${tag}-${Date.now()}@fygs.dev`;
  const password = `Rc-${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}Aa1`;
  const ctx = await browser.newContext({ baseURL: BASE, locale: "fr-FR", timezoneId: "Europe/Paris", viewport: { width: 1280, height: 1000 } });
  const headers = { origin: BASE, "content-type": "application/json" };
  const up = await ctx.request.post("/api/auth/sign-up/email", { headers, data: { email, password, name: `Recette ${tag}` } });
  if (!up.ok()) throw new Error(`sign-up failed (${up.status()})`);
  await db.query(`update "user" set "emailVerified" = true where email = $1`, [email]);
  const inn = await ctx.request.post("/api/auth/sign-in/email", { headers, data: { email, password } });
  if (!inn.ok()) throw new Error(`sign-in failed (${inn.status()})`);
  const { rows } = await db.query(`select id from "user" where email = $1`, [email]);
  return { ctx, email, userId: rows[0].id, page: await ctx.newPage() };
}

const snap = (page, name) => page.screenshot({ path: join(OUT, `${name}.png`), fullPage: true }).catch(() => {});

async function subscribe(page, planLabel = /Commencer maintenant/) {
  await page.goto("/fr/pricing");
  await page.getByRole("button", { name: planLabel }).first().click();
  await page.waitForURL(/^https:\/\/checkout\.stripe\.com\//, { timeout: 45_000, waitUntil: "commit" });
  // Stripe's payment form lives in an iframe: open the card method, then fill the card fields inside it
  const frame = await until(() => page.frames().find((f) => f.url().includes("elements-inner-payment") || f.url().includes("elements-inner-habanero")) ?? null, "Stripe payment frame", 45_000);
  const card = frame.getByRole("button", { name: /^Carte bancaire/ });
  await card.waitFor({ timeout: 30_000 });
  await card.click();
  const fields = async () => frame.locator("input").evaluateAll((els) => els.map((x) => x.name || x.id || x.type));
  await frame.locator('input[name="number"], input#cardNumber, input[autocomplete="cc-number"]').first().waitFor({ timeout: 20_000 }).catch(async (e) => {
    await snap(page, "checkout-unexpected");
    console.log(`  checkout fields: ${JSON.stringify(await fields())}`);
    throw e;
  });
  const type = async (selector, value) => {
    const f = frame.locator(selector).first();
    await f.click();
    await f.pressSequentially(value, { delay: 25 });
  };
  await type('input[name="number"], input#cardNumber, input[autocomplete="cc-number"]', "4242424242424242");
  await type('input[name="expiry"], input#cardExpiry, input[autocomplete="cc-exp"]', "1234");
  await type('input[name="cvc"], input#cardCvc, input[autocomplete="cc-csc"]', "123");
  const holder = frame.locator('input[name="billingName"], input#billingName, input[autocomplete="cc-name"]').first();
  if (await holder.count()) await holder.fill("Recette Stripe");
  const postal = frame.locator('input[name="postalCode"], input#billingPostalCode, input[autocomplete="postal-code"]').first();
  if (await postal.count()) await postal.fill("75001").catch(() => {});
  await snap(page, "checkout-filled");
  await frame.getByRole("button", { name: /Payer et s.abonner|S.abonner/ }).click();
  await page.waitForURL((u) => u.hostname === "staging.fygs.dev", { timeout: 90_000 });
}

const invoicesOf = async (customer) => (await stripe(`invoices?customer=${customer}&limit=20`)).data.sort((a, b) => a.created - b.created);

// ── scenario A: subscribe, upgrade, scheduled downgrade, refund ─────────────────────────────────────────────────────
async function scenarioA(browser) {
  console.log("\nScenario A — monthly subscription, upgrade to yearly, scheduled downgrade, refund");
  const L = await newLearner(browser, "a");
  const { page, userId } = L;

  await subscribe(page);
  const sub1 = await until(async () => (await db.query(`select * from "Subscription" where "userId" = $1 and status = 'ACTIVE'`, [userId])).rows[0], "active subscription (webhook)");
  check("A1 monthly subscription is ACTIVE in the database after the webhook", true, `priceId ${sub1.priceId?.slice(-8)}`);
  const stripeSub = await stripe(`subscriptions/${sub1.stripeSubscriptionId}`);
  const customer = stripeSub.customer;
  const pay1 = await until(async () => (await db.query(`select * from "Payment" where "userId" = $1 and kind = 'SUBSCRIPTION' and status = 'COMPLETED'`, [userId])).rows, "first payment row");
  check("A2 one COMPLETED payment of 29", pay1.length === 1 && Number(pay1[0].amount) === 29, pay1.map((p) => Number(p.amount)).join("+"));

  // upgrade
  await page.goto("/fr/dashboard/billing");
  await snap(page, "billing-monthly");
  await page.getByRole("button", { name: /Passer à la formule annuelle/ }).click();
  await page.getByRole("button", { name: /Confirmer le changement/ }).click();
  await until(async () => (await invoicesOf(customer)).filter((i) => i.status === "paid").length >= 2, "second paid invoice (the switch)");
  const inv = (await invoicesOf(customer)).filter((i) => i.status === "paid");
  const upgrade = inv.find((i) => i.billing_reason === "subscription_update");
  check("A3 the switch is invoiced at once: 261 EUR paid", upgrade && upgrade.amount_paid === 26100, `invoices ${inv.map((i) => `${i.billing_reason}:${i.amount_paid / 100}`).join(", ")}`);
  const after = await stripe(`subscriptions/${sub1.stripeSubscriptionId}`);
  const item = after.items.data[0];
  const days = Math.round((item.current_period_end - item.current_period_start) / 86400);
  check("A4 the yearly period lasts a year (no zero-length period)", days >= 364 && days <= 366, `${days} days`);
  const pending = await stripe(`invoiceitems?customer=${customer}&pending=true&limit=5`);
  check("A5 no pending invoice item left behind", pending.data.length === 0);
  const dbSub = await until(async () => {
    const r = (await db.query(`select * from "Subscription" where id = $1`, [sub1.id])).rows[0];
    return r?.priceId?.length && r.priceId !== sub1.priceId ? r : null;
  }, "database follows the switch");
  check("A6 the database holds the yearly price and a period of about a year", (new Date(dbSub.currentPeriodEnd) - new Date(dbSub.currentPeriodStart)) / 86400000 > 360);
  const audits = (await db.query(`select type, amount, "stripeInvoiceId" from "InvoiceAudit" where "userId" = $1`, [userId])).rows;
  const prorat = audits.find((a) => a.type === "PRORATION");
  check("A7 PRORATION audit carries the amount really charged (261) and the invoice id", prorat && Number(prorat.amount) === 261 && prorat.stripeInvoiceId === upgrade?.id, prorat ? `${Number(prorat.amount)} ${prorat.stripeInvoiceId}` : "missing");
  const pays = await until(async () => {
    const r = (await db.query(`select amount from "Payment" where "userId" = $1 and kind = 'SUBSCRIPTION' and status = 'COMPLETED' order by "createdAt"`, [userId])).rows;
    return r.length >= 2 ? r : null;
  }, "adjustment payment row");
  check("A8 two COMPLETED payments (29 then 261)", pays.map((p) => Number(p.amount)).join("+") === "29+261", pays.map((p) => Number(p.amount)).join("+"));

  await page.goto("/fr/dashboard/billing");
  await snap(page, "billing-yearly");
  const text = await page.locator("main").innerText();
  check("A9 billing page announces a refund of 290.00 EUR", /vous récupérez 290\.00 EUR/.test(text), (text.match(/vous récupérez[^.]*\./) || [""])[0].slice(0, 90));

  // scheduled downgrade, cancelled, scheduled again
  await page.getByRole("button", { name: /Passer à la formule mensuelle/ }).click();
  await page.getByRole("button", { name: /Confirmer le changement/ }).click();
  const scheduled = await until(async () => {
    const s = await stripe(`subscriptions/${sub1.stripeSubscriptionId}`);
    return s.schedule ? s : null;
  }, "subscription schedule");
  const sched = await stripe(`subscription_schedules/${scheduled.schedule}`);
  const invAfter = (await invoicesOf(customer)).filter((i) => i.status === "paid").length;
  check("A10 yearly -> monthly is scheduled: two phases, nothing invoiced", sched.phases.length === 2 && invAfter === 2, `phases ${sched.phases.length}, paid invoices ${invAfter}`);
  const stillYearly = (await db.query(`select "priceId" from "Subscription" where id = $1`, [sub1.id])).rows[0].priceId;
  check("A11 the database still holds the yearly price until the period ends", stillYearly === dbSub.priceId);
  await page.reload();
  await snap(page, "billing-scheduled");
  check("A12 the page shows the scheduled change and its cancel button", await page.getByRole("button", { name: /Annuler le changement/ }).isVisible());
  await page.getByRole("button", { name: /Annuler le changement/ }).click();
  await until(async () => !(await stripe(`subscriptions/${sub1.stripeSubscriptionId}`)).schedule, "schedule released");
  check("A13 cancelling the scheduled change releases the Stripe schedule", true);
  await page.reload();
  await page.getByRole("button", { name: /Passer à la formule mensuelle/ }).click();
  await page.getByRole("button", { name: /Confirmer le changement/ }).click();
  await until(async () => (await stripe(`subscriptions/${sub1.stripeSubscriptionId}`)).schedule, "schedule again");

  // refund, with a schedule still attached
  await page.goto("/fr/dashboard/billing");
  await page.getByRole("button", { name: /Demander un remboursement/ }).click();
  await page.getByRole("button", { name: /Confirmer le remboursement/ }).click();
  await until(async () => (await db.query(`select status from "Subscription" where id = $1`, [sub1.id])).rows[0].status === "CANCELED", "subscription canceled after refund");
  const charges = (await stripe(`charges?customer=${customer}&limit=10`)).data;
  check("A14 every charge is refunded in full (29 and 261)", charges.length === 2 && charges.every((c) => c.amount_refunded === c.amount), charges.map((c) => `${c.amount / 100}/${c.amount_refunded / 100}`).join(", "));
  const endSub = await stripe(`subscriptions/${sub1.stripeSubscriptionId}`);
  check("A15 the Stripe subscription is canceled (the schedule went with it)", endSub.status === "canceled");
  const refunded = (await db.query(`select count(*)::int n from "Payment" where "userId" = $1 and status = 'REFUNDED'`, [userId])).rows[0].n;
  check("A16 both payment rows are REFUNDED", refunded === 2, `${refunded}`);
  const ra = (await db.query(`select amount from "InvoiceAudit" where "userId" = $1 and type = 'REFUND_PROCESSED'`, [userId])).rows;
  check("A17 one REFUND_PROCESSED audit of 290", ra.length === 1 && Number(ra[0].amount) === 290, ra.map((r) => Number(r.amount)).join(","));
  await page.goto("/fr/dashboard/billing");
  await snap(page, "billing-after-refund");
  await L.ctx.close();
}

// ── scenario B: cancel at the end of the period ─────────────────────────────────────────────────────────────────────
async function scenarioB(browser) {
  console.log("\nScenario B — monthly subscription cancelled at the end of the period");
  const L = await newLearner(browser, "b");
  const { page, userId } = L;
  await subscribe(page);
  const sub = await until(async () => (await db.query(`select * from "Subscription" where "userId" = $1 and status = 'ACTIVE'`, [userId])).rows[0], "active subscription");
  await page.goto("/fr/dashboard/billing");
  await page.getByRole("button", { name: /Annuler l'abonnement/ }).click();
  await page.getByRole("button", { name: /Confirmer l'annulation/ }).click();
  const s = await until(async () => {
    const x = await stripe(`subscriptions/${sub.stripeSubscriptionId}`);
    return x.cancel_at_period_end ? x : null;
  }, "cancel_at_period_end");
  check("B1 Stripe keeps the subscription until the period end, with no further charge", s.status === "active" && s.cancel_at_period_end);
  const row = (await db.query(`select status, "cancelAtPeriodEnd" from "Subscription" where id = $1`, [sub.id])).rows[0];
  check("B2 the database says ACTIVE with cancelAtPeriodEnd", row.status === "ACTIVE" && row.cancelAtPeriodEnd === true);
  await page.reload();
  check("B3 the page tells the learner access lasts until the end of the period", /vous gardez Premium jusqu/.test(await page.locator("main").innerText()));
  await L.ctx.close();
}

// System Chrome first: the browsers Playwright downloads on this machine do not match its version
const browser = await chromium.launch({ headless: true, channel: "chrome" }).catch(() => chromium.launch({ headless: true }));
try {
  await scenarioA(browser);
  await scenarioB(browser);
} catch (e) {
  check(`UNEXPECTED: ${e.message}`.slice(0, 160), false);
  console.error(e.stack?.split("\n").slice(0, 4).join("\n"));
} finally {
  await browser.close();
  await db.end();
}
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed${failed.length ? `; failed: ${failed.map((f) => f.name.split(" ")[0]).join(", ")}` : ""}. Screenshots in ${OUT}`);
process.exit(failed.length ? 1 : 0);
