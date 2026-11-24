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
import { randomUUID } from "node:crypto";
import { readFileSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { hashPassword } from "better-auth/crypto";
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
  // Created straight in the database, like tests/e2e/support/db.ts: the sign-up route is rate limited (5 an hour), and what
  // is under test here is billing, not registration
  const userId = randomUUID();
  await db.query(`insert into "user" (id, name, email, "emailVerified", role, "updatedAt") values ($1, $2, $3, true, 'STUDENT', now())`, [userId, `Recette ${tag}`, email]);
  await db.query(`insert into account (id, "userId", "accountId", "providerId", password, "updatedAt") values ($1, $2, $2, 'credential', $3, now())`, [randomUUID(), userId, await hashPassword(password)]);
  const inn = await ctx.request.post("/api/auth/sign-in/email", { headers, data: { email, password } });
  if (!inn.ok()) throw new Error(`sign-in failed (${inn.status()})`);
  const page = await ctx.newPage();
  page.on("pageerror", (e) => console.log(`  [pageerror] ${e.message.slice(0, 200)}`));
  return { ctx, email, userId, page };
}

const snap = (page, name) => page.screenshot({ path: join(OUT, `${name}.png`), fullPage: true }).catch(() => {});

const CARD_OK = "4242424242424242";
const CARD_DECLINED = "4000000000000002";
const CARD_DISPUTE = "4000000000000259"; // charge succeeds, the cardholder then disputes it
const SUBMIT = /Payer et s.abonner|S.abonner|^Payer/;
const NUMBER = 'input[name="number"], input#cardNumber, input[autocomplete="cc-number"]';
const CVC = 'input[name="cvc"], input#cardCvc, input[autocomplete="cc-csc"]';

const paymentFrame = (page) => page.frames().find((f) => f.url().includes("elements-inner-payment") || f.url().includes("elements-inner-habanero")) ?? null;
async function typeInto(frame, selector, value) {
  const f = frame.locator(selector).first();
  await f.click();
  await f.press("Control+A");
  await f.pressSequentially(value, { delay: 25 });
}

/** On Stripe's hosted page: open the card method, fill the card, pay. */
async function payWithCard(page, card, { expect = "success" } = {}) {
  await page.waitForURL(/^https:\/\/checkout\.stripe\.com\//, { timeout: 45_000, waitUntil: "commit" });
  const frame = await until(() => paymentFrame(page), "Stripe payment frame", 45_000);
  const method = frame.getByRole("button", { name: /^Carte bancaire/ });
  for (let attempt = 0; attempt < 4; attempt++) {
    if (await frame.locator(NUMBER).first().isVisible().catch(() => false)) break;
    if (await method.isVisible({ timeout: 5_000 }).catch(() => false)) await method.click().catch(() => {});
    await frame.locator(NUMBER).first().waitFor({ timeout: 6_000 }).catch(() => {});
  }
  await frame.locator(NUMBER).first().waitFor({ timeout: 10_000 }).catch(async (e) => {
    await snap(page, "checkout-unexpected");
    console.log(`  checkout: ${page.url().slice(0, 50)} buttons=${JSON.stringify((await frame.getByRole("button").allInnerTexts()).map((t) => t.trim().slice(0, 40))).slice(0, 260)} inputs=${JSON.stringify(await frame.locator("input").evaluateAll((els) => els.map((x) => x.name || x.id || x.type))).slice(0, 200)}`);
    throw e;
  });
  await typeInto(frame, NUMBER, card);
  await typeInto(frame, 'input[name="expiry"], input#cardExpiry, input[autocomplete="cc-exp"]', "1234");
  await typeInto(frame, CVC, "123");
  const holder = frame.locator('input[name="billingName"], input#billingName, input[autocomplete="cc-name"]').first();
  if (await holder.count()) await holder.fill("Recette Stripe");
  const postal = frame.locator('input[name="postalCode"], input#billingPostalCode, input[autocomplete="postal-code"]').first();
  if (await postal.count()) await postal.fill("75001").catch(() => {});
  await snap(page, "checkout-filled");
  await frame.getByRole("button", { name: SUBMIT }).last().click();
  if (expect === "success") await page.waitForURL((u) => u.hostname === "staging.fygs.dev", { timeout: 90_000 });
}

async function subscribe(page, card = CARD_OK, options) {
  await page.goto("/fr/pricing");
  await ready(page);
  await page.getByRole("button", { name: /Commencer maintenant/ }).first().click();
  await payWithCard(page, card, options);
}

async function buyCourse(page, slug, card = CARD_OK, options) {
  await page.goto(`/fr/formations/${slug}`);
  await ready(page);
  await page.getByRole("button", { name: /Acheter/ }).first().click();
  await payWithCard(page, card, options);
}

/** A brand-new account is first offered a language: choose French, like a person would. */
async function ready(page) {
  await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => {});
  const french = page.getByRole("button", { name: /Français/ });
  if (await french.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await french.click();
    await page.waitForTimeout(800);
  }
}

/** Opens a confirmation dialog from its trigger and confirms inside it (the page must be interactive first). */
async function confirmDialog(page, triggerName, confirmName) {
  await ready(page);
  try {
    await page.getByRole("button", { name: triggerName }).first().click({ timeout: 20_000 });
  } catch (e) {
    await snap(page, "dialog-trigger-missing");
    console.log(`  page ${page.url()} | buttons: ${JSON.stringify((await page.getByRole("button").allInnerTexts()).map((t) => t.trim()).filter(Boolean)).slice(0, 300)}`);
    throw e;
  }
  const dialog = page.getByRole("alertdialog");
  await dialog.waitFor({ timeout: 20_000 });
  await dialog.getByRole("button", { name: confirmName }).click();
  await dialog.waitFor({ state: "hidden", timeout: 30_000 }).catch(() => {});
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
  await confirmDialog(page, /Passer à la formule annuelle/, /Confirmer le changement/);
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
  await confirmDialog(page, /Passer à la formule mensuelle/, /Confirmer le changement/);
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
  await ready(page);
  await page.getByRole("button", { name: /Annuler le changement/ }).click();
  await until(async () => !(await stripe(`subscriptions/${sub1.stripeSubscriptionId}`)).schedule, "schedule released");
  check("A13 cancelling the scheduled change releases the Stripe schedule", true);
  await page.reload();
  await confirmDialog(page, /Passer à la formule mensuelle/, /Confirmer le changement/);
  await until(async () => (await stripe(`subscriptions/${sub1.stripeSubscriptionId}`)).schedule, "schedule again");

  // refund, with a schedule still attached
  await page.goto("/fr/dashboard/billing");
  await confirmDialog(page, /Demander un remboursement/, /Confirmer le remboursement/);
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
  await confirmDialog(page, /Annuler l'abonnement/, /Confirmer l'annulation/);
  const s = await until(async () => {
    const x = await stripe(`subscriptions/${sub.stripeSubscriptionId}`);
    return x.cancel_at_period_end ? x : null;
  }, "cancel_at_period_end");
  check("B1 Stripe keeps the subscription until the period end, with no further charge", s.status === "active" && s.cancel_at_period_end);
  const row = (await db.query(`select status, "cancelAtPeriodEnd" from "Subscription" where id = $1`, [sub.id])).rows[0];
  check("B2 the database says ACTIVE with cancelAtPeriodEnd", row.status === "ACTIVE" && row.cancelAtPeriodEnd === true);
  const b3 = await until(async () => {
    await page.reload();
    await ready(page);
    return /vous gardez Premium jusqu/.test(await page.locator("main").innerText());
  }, "the page announcing the scheduled stop", 40_000).catch(() => false);
  check("B3 the page tells the learner access lasts until the end of the period", b3);
  await L.ctx.close();
}

const stripePost = async (path, params) => {
  const r = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: "POST",
    headers: { authorization: `Basic ${Buffer.from(`${SK}:`).toString("base64")}`, "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params),
  });
  const j = await r.json();
  if (j.error) throw new Error(`stripe POST ${path}: ${j.error.message}`);
  return j;
};
const COURSE_A = "backend-architecture-nodejs-scalable";
const COURSE_B = "react-advanced-patterns-performance";
const payRows = async (userId, kind) => (await db.query(`select status, amount from "Payment" where "userId" = $1 and kind = $2 order by "createdAt"`, [userId, kind])).rows;
const mainText = async (page) => page.locator("main").innerText();

// ── scenario C: a course bought on its own, then refunded ───────────────────────────────────────────────────────────
async function scenarioC(browser) {
  console.log("\nScenario C — one course bought on its own, then refunded");
  const L = await newLearner(browser, "c");
  const { page, userId } = L;
  await buyCourse(page, COURSE_A);
  const rows = await until(async () => {
    const r = await payRows(userId, "COURSE");
    return r.some((x) => x.status === "COMPLETED") ? r : null;
  }, "course payment (webhook)");
  check("C1 one COMPLETED course payment of 199.99", rows.length === 1 && Number(rows[0].amount) === 199.99, rows.map((x) => `${x.status} ${Number(x.amount)}`).join(", "));
  const charge = (await stripe("charges?limit=5")).data.find((c) => c.amount === 19999 && c.paid);
  check("C2 Stripe holds a paid charge of 199.99", Boolean(charge));
  await page.goto(`/fr/formations/${COURSE_A}`);
  await ready(page);
  const owned = await mainText(page);
  check("C3 the course page no longer offers to buy it", !/Acheter\s*·/.test(owned), (owned.match(/Acheter[^\n]*/) || ["no buy button"])[0]);
  await page.goto("/fr/dashboard/billing");
  await snap(page, "billing-course-bought");
  await confirmDialog(page, /Demander un remboursement/, /Confirmer le remboursement/);
  await until(async () => (await payRows(userId, "COURSE"))[0]?.status === "REFUNDED", "course payment REFUNDED");
  check("C4 the course payment row is REFUNDED", true);
  const ch = await stripe(`charges/${charge.id}`);
  check("C5 Stripe refunded the charge in full", ch.amount_refunded === 19999, `${ch.amount_refunded / 100}`);
  const audit = (await db.query(`select type, amount from "InvoiceAudit" where "userId" = $1 and type like 'REFUND%'`, [userId])).rows;
  check("C6 a refund audit of 199.99 exists", audit.some((a) => Number(a.amount) === 199.99), audit.map((a) => `${a.type} ${Number(a.amount)}`).join(", "));
  await page.goto(`/fr/formations/${COURSE_A}`);
  await ready(page);
  const after = await mainText(page);
  check("C7 access is closed again after the refund (the buy offer is back)", /Acheter|Racheter/.test(after), (after.match(/(Racheter|Acheter)[^\n]*/) || ["none"])[0]);
  await L.ctx.close();
}

// ── scenario D: refused card, recovery, failed renewal ──────────────────────────────────────────────────────────────
async function scenarioD(browser) {
  console.log("\nScenario D — refused card at checkout, retry with a good card, then a failed renewal");
  const L = await newLearner(browser, "d");
  const { page, userId } = L;
  await subscribe(page, CARD_DECLINED, { expect: "none" });
  const declined = await until(async () => {
    for (const f of page.frames()) if (await f.getByText(/refusée|declined|insuffisants/i).first().isVisible().catch(() => false)) return true;
    return false;
  }, "decline message on the checkout page", 30_000).catch(() => false);
  await snap(page, "checkout-declined");
  check("D1 the refused card is reported on Stripe's page, the learner stays there", declined && /checkout\.stripe\.com/.test(page.url()));
  const active = (await db.query(`select count(*)::int n from "Subscription" where "userId" = $1 and status = 'ACTIVE' and "stripeSubscriptionId" is not null`, [userId])).rows[0].n;
  const paid = (await payRows(userId, "SUBSCRIPTION")).filter((p) => p.status === "COMPLETED").length;
  check("D2 nothing was granted: no active subscription, no completed payment", active === 0 && paid === 0, `active ${active}, completed ${paid}`);
  // recovery on the same page with a good card
  const frame = paymentFrame(page);
  await typeInto(frame, NUMBER, CARD_OK);
  await typeInto(frame, CVC, "123");
  await frame.getByRole("button", { name: SUBMIT }).last().click();
  await page.waitForURL((u) => u.hostname === "staging.fygs.dev", { timeout: 90_000 });
  const sub = await until(async () => (await db.query(`select * from "Subscription" where "userId" = $1 and status = 'ACTIVE' and "stripeSubscriptionId" is not null`, [userId])).rows[0], "subscription after the retry");
  check("D3 retrying with a good card on the same page completes the subscription", Boolean(sub));

  // failed renewal: the default card becomes one that fails when charged, then a new period is invoiced at once
  const stripeSub = await stripe(`subscriptions/${sub.stripeSubscriptionId}`);
  const bad = await stripePost("payment_methods/pm_card_chargeCustomerFail/attach", { customer: stripeSub.customer });
  await stripePost(`customers/${stripeSub.customer}`, { "invoice_settings[default_payment_method]": bad.id });
  // A charge that must happen now and fails: moving the subscription to the yearly price invoices 261 EUR at once; the card
  // refuses it and, with allow_incomplete, the subscription stays but turns past_due (what a failed renewal looks like)
  const yearly = "price_1SBfFOHORHAFva9IYfXuLWhc"; // the yearly Premium price of the fygs Stripe account (test mode)
  await stripePost(`subscriptions/${sub.stripeSubscriptionId}`, {
    default_payment_method: bad.id,
    "items[0][id]": stripeSub.items.data[0].id,
    "items[0][price]": yearly,
    proration_behavior: "always_invoice",
    payment_behavior: "allow_incomplete",
  });
  const past = await until(async () => {
    const row = (await db.query(`select status from "Subscription" where id = $1`, [sub.id])).rows[0];
    return row?.status === "PAST_DUE" ? row : null;
  }, "PAST_DUE after the failed charge", 120_000).catch(() => null);
  const live = await stripe(`subscriptions/${sub.stripeSubscriptionId}`);
  check("D4 Stripe reports the renewal failed (past_due)", live.status === "past_due", live.status);
  check("D5 the database follows: PAST_DUE", Boolean(past), past ? "PAST_DUE" : "status unchanged");
  await page.goto("/fr/dashboard/billing");
  await ready(page);
  await snap(page, "billing-past-due");
  check("D6 the billing page tells the learner to update the payment method", /dernier prélèvement a échoué/.test(await mainText(page)));
  await L.ctx.close();
}

// ── scenario E: disputes ────────────────────────────────────────────────────────────────────────────────────────────
let webhookEndpoint = null;
/** Ask Stripe to deliver again the events of a charge (the handler refuses them until the payment is recorded). */
async function resendDisputeEvents(chargeId, types = ["charge.dispute.created"]) {
  webhookEndpoint ??= (await stripe("webhook_endpoints?limit=20")).data.find((e) => e.url === `${BASE}/api/stripe/webhook`)?.id;
  for (const type of types) {
    const events = (await stripe(`events?type=${type}&limit=10`)).data.filter((e) => e.data.object.charge === chargeId);
    for (const e of events) await stripePost(`events/${e.id}/retry`, { webhook_endpoint: webhookEndpoint }).catch(() => {});
  }
}

async function closeDispute(chargeId, outcome) {
  const d = await until(async () => (await stripe(`disputes?charge=${chargeId}&limit=1`)).data[0], "dispute on the charge", 90_000);
  await stripePost(`disputes/${d.id}`, { "evidence[uncategorized_text]": `${outcome}_evidence`, submit: "true" });
  return d.id;
}

async function scenarioE(browser) {
  console.log("\nScenario E — a disputed subscription payment (lost) and a disputed course payment (won)");
  // E1: subscription, dispute lost
  const L1 = await newLearner(browser, "e1");
  await subscribe(L1.page, CARD_DISPUTE);
  const sub = await until(async () => (await db.query(`select * from "Subscription" where "userId" = $1 and "stripeSubscriptionId" is not null`, [L1.userId])).rows[0], "subscription");
  const customer = (await stripe(`subscriptions/${sub.stripeSubscriptionId}`)).customer;
  const charge = (await stripe(`charges?customer=${customer}&limit=3`)).data[0];
  // recorded = settled, whether the dispute was already applied to it or not
  await until(async () => (await payRows(L1.userId, "SUBSCRIPTION")).some((p) => p.status !== "PENDING"), "subscription payment recorded");
  await resendDisputeEvents(charge.id);
  const opened = await until(async () => (await payRows(L1.userId, "SUBSCRIPTION")).some((p) => p.status === "DISPUTED"), "payment DISPUTED", 120_000).catch(() => false);
  check("E1 the opened dispute turns the subscription payment into DISPUTED", opened);
  const ended = await until(async () => ["CANCELED", "UNPAID"].includes((await db.query(`select status from "Subscription" where id = $1`, [sub.id])).rows[0].status), "subscription ended", 60_000).catch(() => false);
  check("E2 the disputed subscription is ended so the card is not billed again", ended);
  const audits1 = (await db.query(`select type from "InvoiceAudit" where "userId" = $1`, [L1.userId])).rows.map((a) => a.type);
  check("E3 a DISPUTE_OPENED audit exists", audits1.includes("DISPUTE_OPENED"), audits1.join(","));
  await closeDispute(charge.id, "losing");
  await sleep(8000);
  await resendDisputeEvents(charge.id, ["charge.dispute.closed"]);
  const lost = await until(async () => (await payRows(L1.userId, "SUBSCRIPTION")).some((p) => p.status === "REFUNDED"), "payment REFUNDED after the lost dispute", 180_000).catch(() => false);
  check("E4 a lost dispute ends as REFUNDED (the money is gone, so is the access)", lost);
  await L1.ctx.close();

  // E2: course, dispute won
  const L2 = await newLearner(browser, "e2");
  await buyCourse(L2.page, COURSE_B, CARD_DISPUTE);
  await until(async () => (await payRows(L2.userId, "COURSE")).some((p) => p.status !== "PENDING"), "course payment recorded");
  const refCourse = (await db.query(`select "stripePaymentIntentId" ref from "Payment" where "userId" = $1 and kind = 'COURSE'`, [L2.userId])).rows[0].ref;
  const piCourse = refCourse.startsWith("pi_") ? refCourse : (await stripe(`checkout/sessions/${refCourse}`)).payment_intent;
  const chCourse = (await stripe(`payment_intents/${piCourse}`)).latest_charge;
  await resendDisputeEvents(chCourse);
  const opened2 = await until(async () => (await payRows(L2.userId, "COURSE")).some((p) => p.status === "DISPUTED"), "course payment DISPUTED", 120_000).catch(() => false);
  check("E5 the opened dispute turns the course payment into DISPUTED", opened2);
  await L2.page.goto(`/fr/formations/${COURSE_B}`);
  await ready(L2.page);
  check("E6 access is suspended while the dispute is open (the buy offer is back)", /Acheter|Racheter/.test(await mainText(L2.page)));
  const ch2 = chCourse;
  await closeDispute(ch2, "winning");
  await sleep(8000);
  await resendDisputeEvents(ch2, ["charge.dispute.closed"]);
  const won = await until(async () => (await payRows(L2.userId, "COURSE")).some((p) => p.status === "COMPLETED"), "payment COMPLETED after the won dispute", 180_000).catch(() => false);
  check("E7 a won dispute puts the payment back to COMPLETED", won);
  await L2.page.goto(`/fr/formations/${COURSE_B}`);
  await ready(L2.page);
  check("E8 access returns after the won dispute", !/Acheter\s*·/.test(await mainText(L2.page)));
  await L2.ctx.close();
}

const SCENARIOS = { A: scenarioA, B: scenarioB, C: scenarioC, D: scenarioD, E: scenarioE };
const wanted = (process.env.RECETTE_SCENARIOS || "A,B,C,D,E").split(",").map((x) => x.trim().toUpperCase());

// System Chrome first: the browsers Playwright downloads on this machine do not match its version
const browser = await chromium.launch({ headless: true, channel: "chrome" }).catch(() => chromium.launch({ headless: true }));
try {
  for (const name of wanted) {
    try {
      await SCENARIOS[name](browser);
    } catch (e) {
      check(`UNEXPECTED in scenario ${name}: ${e.message}`.replace(/\s+/g, " ").slice(0, 170), false);
    }
  }
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
