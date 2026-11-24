#!/usr/bin/env node
/**
 * Stripe TEST-mode smoke test: the Stripe calls the app makes, run against the
 * real API with the SDK's default API version.
 *
 *   customer -> product/price -> subscription (pm_card_visa) -> invoice + payment
 *   -> invoice preview -> plan switch -> checkout sessions (both modes) -> refund
 *   (idempotent) -> cancel -> billing portal -> cleanup
 *
 * Usage:   node scripts/stripe-smoke.mjs            (key from the environment)
 *          node --env-file=.env scripts/stripe-smoke.mjs
 * Env:     STRIPE_SECRET_KEY must be a TEST key (sk_test_...). Anything else is
 *          refused before any request is made. A local `.env` is read when the
 *          variable is not set.
 *
 * Only objects created by this run are touched, and they are removed at the end
 * (customer deleted, subscription canceled, prices deactivated, product archived,
 * open checkout sessions expired). Nothing secret is ever printed.
 */
import { existsSync } from "node:fs";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY && existsSync(".env")) {
  try {
    process.loadEnvFile(".env");
  } catch {
    /* unreadable .env: handled by the key check below */
  }
}

const key = process.env.STRIPE_SECRET_KEY ?? "";
if (!key.startsWith("sk_test_")) {
  console.error(
    "Refusing to run: STRIPE_SECRET_KEY is missing or is not a TEST key (sk_test_...).",
  );
  process.exit(2);
}

const stripe = new Stripe(key); // SDK default API version, like lib/stripe.ts
const tag = `smoke-${Date.now()}`;
const created = { customers: [], subscriptions: [], prices: [], products: [], sessions: [] };
const results = [];

const refId = (ref) => (ref ? (typeof ref === "string" ? ref : ref.id) : null);
const short = (id) => (id ? `${String(id).slice(0, 8)}...` : "null");

async function step(name, fn) {
  try {
    const detail = await fn();
    results.push({ name, ok: true });
    console.log(`PASS  ${name}${detail ? `  (${detail})` : ""}`);
  } catch (error) {
    results.push({ name, ok: false });
    console.log(`FAIL  ${name}  -> ${error instanceof Error ? error.message : String(error)}`);
  }
}

function expect(condition, message) {
  if (!condition) throw new Error(message);
}

async function cleanup() {
  const attempt = async (label, fn) => {
    try {
      await fn();
    } catch (error) {
      console.log(`WARN  cleanup ${label}: ${error instanceof Error ? error.message : error}`);
    }
  };
  for (const id of created.sessions) {
    await attempt("session", () => stripe.checkout.sessions.expire(id));
  }
  for (const id of created.subscriptions) {
    await attempt("subscription", async () => {
      const sub = await stripe.subscriptions.retrieve(id);
      if (sub.status !== "canceled") await stripe.subscriptions.cancel(id);
    });
  }
  for (const id of created.customers) {
    await attempt("customer", () => stripe.customers.del(id));
  }
  for (const id of created.prices) {
    await attempt("price", () => stripe.prices.update(id, { active: false }));
  }
  for (const id of created.products) {
    await attempt("product", () => stripe.products.update(id, { active: false }));
  }
}

const ctx = {};

try {
  console.log(`Stripe SDK ${Stripe.API_VERSION} (test mode), run ${tag}`);

  await step("customer with a test card", async () => {
    const customer = await stripe.customers.create({
      email: `${tag}@example.test`,
      metadata: { smoke: tag, userId: "smoke_user" },
      payment_method: "pm_card_visa",
      invoice_settings: { default_payment_method: "pm_card_visa" },
    });
    created.customers.push(customer.id);
    expect(customer.livemode === false, "customer is not in test mode");
    ctx.customer = customer.id;
    return short(customer.id);
  });

  await step("product and monthly + yearly prices", async () => {
    const product = await stripe.products.create({ name: `Smoke ${tag}`, metadata: { smoke: tag } });
    created.products.push(product.id);
    const monthly = await stripe.prices.create({
      product: product.id,
      unit_amount: 900,
      currency: "eur",
      recurring: { interval: "month" },
    });
    const yearly = await stripe.prices.create({
      product: product.id,
      unit_amount: 9000,
      currency: "eur",
      recurring: { interval: "year" },
    });
    created.prices.push(monthly.id, yearly.id);
    ctx.monthly = monthly.id;
    ctx.yearly = yearly.id;
  });

  await step("subscription is active; periods live on the item, metadata kept", async () => {
    const subscription = await stripe.subscriptions.create({
      customer: ctx.customer,
      items: [{ price: ctx.monthly }],
      metadata: { userId: "smoke_user", priceId: ctx.monthly, billingCycle: "monthly" },
    });
    created.subscriptions.push(subscription.id);
    ctx.subscription = subscription.id;
    const item = subscription.items.data[0];
    expect(subscription.status === "active", `status ${subscription.status}`);
    expect(typeof item.current_period_start === "number", "no item.current_period_start");
    expect(typeof item.current_period_end === "number", "no item.current_period_end");
    expect(
      subscription.current_period_end === undefined,
      "unexpected root current_period_end: the code reads the item first, re-check the fallback",
    );
    expect(subscription.metadata.userId === "smoke_user", "metadata lost");
    ctx.itemId = item.id;
    ctx.invoice = refId(subscription.latest_invoice);
    return `item period ${item.current_period_end - item.current_period_start}s`;
  });

  await step("first invoice: billing_reason, parent.subscription_details, no root subscription", async () => {
    const invoice = await stripe.invoices.retrieve(ctx.invoice);
    expect(invoice.billing_reason === "subscription_create", `reason ${invoice.billing_reason}`);
    const parent = refId(invoice.parent?.subscription_details?.subscription);
    const legacy = refId(invoice.subscription);
    expect((parent ?? legacy) === ctx.subscription, "invoice does not point to the subscription");
    expect(invoice.amount_paid === 900, `amount_paid ${invoice.amount_paid}`);
    return parent ? "basil+ location" : "legacy location";
  });

  await step("payment of the latest paid invoice found the way requestRefund does", async () => {
    const invoices = await stripe.invoices.list({
      subscription: ctx.subscription,
      status: "paid",
      limit: 1,
    });
    expect(invoices.data.length === 1, "invoices.list({subscription}) found nothing");
    const payments = await stripe.invoicePayments.list({
      invoice: invoices.data[0].id,
      status: "paid",
      limit: 1,
    });
    const payment = payments.data[0]?.payment;
    expect(payment?.type === "payment_intent", `payment type ${payment?.type}`);
    ctx.paymentIntent = refId(payment.payment_intent);
    ctx.amountPaid = invoices.data[0].amount_paid;
    expect(ctx.paymentIntent?.startsWith("pi_"), "no payment intent id");
    return short(ctx.paymentIntent);
  });

  await step("invoices.createPreview replaces retrieveUpcoming", async () => {
    expect(stripe.invoices.retrieveUpcoming === undefined, "retrieveUpcoming still exists in the SDK");
    const preview = await stripe.invoices.createPreview({ subscription: ctx.subscription });
    expect(Array.isArray(preview.lines.data), "no lines");
    expect(typeof preview.amount_due === "number", "no amount_due");
  });

  await step("plan switch: item price swap with prorations, then preview", async () => {
    await stripe.subscriptions.update(ctx.subscription, {
      cancel_at_period_end: false,
      proration_behavior: "create_prorations",
      items: [{ id: ctx.itemId, price: ctx.yearly }],
    });
    const preview = await stripe.invoices.createPreview({ subscription: ctx.subscription });
    const proration = preview.lines.data.filter(
      (line) => line.parent?.subscription_item_details?.proration,
    );
    const after = await stripe.subscriptions.retrieve(ctx.subscription);
    expect(after.items.data[0].price.id === ctx.yearly, "price not switched");
    return `${proration.length} proration line(s), period end on item: ${typeof after.items.data[0].current_period_end}`;
  });

  await step("hosted Checkout Session, subscription mode (the payload the app sends)", async () => {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: ctx.monthly, quantity: 1 }],
      customer_email: `${tag}@example.test`,
      success_url: "https://example.com/dashboard?subscription=success",
      cancel_url: "https://example.com/dashboard?subscription=canceled",
      metadata: { userId: "smoke_user", type: "subscription", priceId: ctx.monthly, billingCycle: "monthly" },
      subscription_data: { metadata: { userId: "smoke_user", priceId: ctx.monthly, billingCycle: "monthly" } },
      allow_promotion_codes: true,
    });
    created.sessions.push(session.id);
    expect(typeof session.url === "string" && session.url.startsWith("https://"), "no url");
    expect(session.payment_intent === null, "subscription-mode session has a payment_intent");
    return `ui_mode ${session.ui_mode}`;
  });

  await step("hosted Checkout Session, payment mode (the payload the app sends)", async () => {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name: "Formation - smoke", description: "Accès à vie à la formation" },
            unit_amount: 4990,
          },
          quantity: 1,
        },
      ],
      customer_email: `${tag}@example.test`,
      success_url: "https://example.com/formations/x?success=true",
      cancel_url: "https://example.com/formations/x?canceled=true",
      metadata: { userId: "smoke_user", productId: "course_x", type: "course_purchase", courseSlug: "x" },
      allow_promotion_codes: true,
    });
    created.sessions.push(session.id);
    expect(typeof session.url === "string" && session.url.startsWith("https://"), "no url");
    return `payment_intent before payment: ${session.payment_intent}`;
  });

  await step("refund of the PaymentIntent, idempotent on the key", async () => {
    const params = { payment_intent: ctx.paymentIntent, amount: ctx.amountPaid };
    const options = { idempotencyKey: `${tag}-refund` };
    const first = await stripe.refunds.create(params, options);
    const second = await stripe.refunds.create(params, options);
    expect(first.id === second.id, "same idempotency key created two refunds");
    expect(first.status === "succeeded" || first.status === "pending", `status ${first.status}`);
    return `${first.status}, ${short(first.id)}`;
  });

  await step("immediate cancellation", async () => {
    const canceled = await stripe.subscriptions.cancel(ctx.subscription);
    expect(canceled.status === "canceled", `status ${canceled.status}`);
  });

  await step("billing portal session", async () => {
    const portal = await stripe.billingPortal.sessions.create({
      customer: ctx.customer,
      return_url: "https://example.com/dashboard/billing",
    });
    expect(typeof portal.url === "string" && portal.url.startsWith("https://"), "no portal url");
  });
} finally {
  await cleanup();
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} steps passed`);
process.exit(failed.length ? 1 : 0);
