import { db } from "@/lib/db";
import { emailService } from "@/lib/email-service";
import { createLogger } from "@/lib/structured-logger";
import { disputeOpenedTemplate, refundConfirmationTemplate } from "@/lib/emails/templates/payments-security";

const log = createLogger({ operation: "payment-notify" });

async function send(userId: string, build: (name: string) => { subject: string; html: string }): Promise<void> {
  try {
    const user = await db.user.findUnique({ where: { id: userId }, select: { email: true, name: true } });
    if (!user) return;
    const template = build(user.name || "apprenant");
    await emailService.sendEmail({ to: user.email, subject: template.subject, html: template.html });
  } catch (error) {
    // The money operation is done: a mail problem is logged, never raised
    log.error("Payment notification failed", { userId, metadata: { error: error instanceof Error ? error.message : String(error) } });
  }
}

export const notifyRefund = (userId: string, input: { product: string; amount: number; currency: string }) =>
  send(userId, (name) => refundConfirmationTemplate({ name, ...input }));

export const notifyDispute = (userId: string, input: { product: string }) =>
  send(userId, (name) => disputeOpenedTemplate({ name, ...input }));
