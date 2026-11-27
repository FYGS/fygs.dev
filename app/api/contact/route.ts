import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { emailService, ContactFormData } from "@/lib/email-service";
import { qualificationSchema } from "@/lib/contact-qualification";
import { humanProofRefusal, verifyHumanProof } from "@/lib/anti-automation";
import { isDisposableEmail } from "@/lib/anti-automation/disposable-domains";
import { isHoneypotTripped } from "@/lib/anti-automation/honeypot";
import { cleanDisplayName, singleLine } from "@/lib/html-escape";
import { readJsonBody } from "@/lib/http/read-body";
import { checkRateLimit, enforceRateLimit, rateLimit } from "@/lib/rate-limit";

/**
 * POST /api/contact: the contact form. Anonymous, so it is the one endpoint that sends e-mail to an address chosen by
 * a stranger. Layers, cheapest first:
 *  - a streaming cap on the body;
 *  - a rate limit per client address that refuses (503) instead of opening up when the shared store is down;
 *  - the proof-of-work (lib/anti-automation) and the honeypot, whose failure looks like a success to the script;
 *  - a limit per RECIPIENT address and a daily ceiling on confirmations, so the form cannot be used to flood a mailbox;
 *  - no confirmation at all to a disposable-address provider.
 * The message to the site owner is always sent once those checks pass; the confirmation to the sender is a courtesy.
 */
export const runtime = "nodejs";

const MAX_BODY_BYTES = 16 * 1024;
const CONFIRMATIONS_PER_ADDRESS_PER_DAY = 3;
const CONFIRMATIONS_PER_DAY = 300;

const contactSchema = z.object({
  name: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères").max(100),
  email: z.string().trim().toLowerCase().email("Adresse email invalide").max(254),
  subject: z.string().trim().min(5, "Le sujet doit contenir au moins 5 caractères").max(200),
  message: z.string().trim().min(10, "Le message doit contenir au moins 10 caractères").max(5000),
  company: z.string().trim().max(200).optional(),
  position: z.string().trim().max(200).optional(),
}).extend(qualificationSchema.shape); // type (with "project"), timeline, framing

export async function POST(request: NextRequest) {
  const limited = await enforceRateLimit(request, "contact", {
    limit: 5,
    windowSeconds: 3600,
    failMode: "closed",
  });
  if (limited) return limited;

  const proof = await verifyHumanProof(request, "contact");
  if (!proof.ok) return humanProofRefusal(proof);

  const body = await readJsonBody(request, MAX_BODY_BYTES);
  if (!body.ok) {
    return NextResponse.json(
      { error: body.status === 413 ? "Message trop volumineux" : "Requête invalide" },
      { status: body.status },
    );
  }

  // A script that filled the invisible field is told it worked, and nothing is sent
  if (body.value && typeof body.value === "object" && isHoneypotTripped(body.value as Record<string, unknown>)) {
    return NextResponse.json({ success: true, message: "Emails envoyés avec succès" }, { status: 200 });
  }

  try {
    const validated = contactSchema.parse(body.value);

    const contactData: ContactFormData = {
      // Line breaks and invisible characters have no place in a name or a subject (headers, spoofing)
      name: cleanDisplayName(validated.name),
      email: validated.email,
      subject: singleLine(validated.subject),
      message: validated.message,
      type: validated.type || "general",
      timeline: validated.timeline,
      framing: validated.framing,
      company: validated.company ? singleLine(validated.company) : undefined,
      position: validated.position ? singleLine(validated.position) : undefined,
    };

    if (!process.env.EMAIL_SERVER_USER || !process.env.EMAIL_SERVER_PASSWORD) {
      console.error("Email service not configured");
      return NextResponse.json({ error: "Service d'email non configuré" }, { status: 500 });
    }

    // The courtesy confirmation to the sender: not to a disposable provider, at most three a day to one mailbox,
    // and a daily ceiling for the whole site. The message to the owner does not depend on any of this.
    let confirm = !isDisposableEmail(contactData.email);
    if (confirm) {
      const perAddress = await checkRateLimit(request, "contact-recipient", {
        subject: `email:${contactData.email}`,
        limit: CONFIRMATIONS_PER_ADDRESS_PER_DAY,
        windowSeconds: 86_400,
        failMode: "closed",
      });
      confirm = perAddress.allowed;
    }
    if (confirm) {
      const globalBudget = await rateLimit("contact-confirmation-global", CONFIRMATIONS_PER_DAY, 86_400);
      confirm = globalBudget.allowed;
    }

    let adminSent: boolean;
    let userSent = false;
    if (confirm) {
      ({ adminSent, userSent } = await emailService.sendContactFormEmails(contactData));
    } else {
      const adminTemplate = emailService.contactFormAdminEmail(contactData);
      adminSent = await emailService.sendEmail({
        to: process.env.CONTACT_EMAIL || process.env.EMAIL_SERVER_USER || "contact@fygs.dev",
        subject: adminTemplate.subject,
        html: adminTemplate.html,
      });
    }

    if (!adminSent || (confirm && !userSent)) {
      console.error("Failed to send emails:", { adminSent, userSent });
      return NextResponse.json({ error: "Échec de l'envoi d'email" }, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Emails envoyés avec succès",
        data: { adminSent, userSent },
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid form data", details: error.issues }, { status: 400 });
    }
    console.error("Contact form error:", error instanceof Error ? error.name : "unknown");
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
