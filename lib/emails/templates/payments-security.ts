import { escapeHtml } from "@/lib/html-escape";
import { formatPrice } from "@/lib/price-format";
import { SUPPORT_EMAIL } from "@/lib/refund-policy";
import type { EmailTemplate } from "../service/types";
import { createBaseTemplate } from "./base";

/** E-mails about money going back (refund) or being contested (dispute). Every value is escaped; no link is built from data. */

const wrap = (heading: string, intro: string, body: string): EmailTemplate => {
  const content = `
    <div class="header">
      <h1>${escapeHtml(heading)}</h1>
      <p>${escapeHtml(intro)}</p>
    </div>
    <div class="content">
      ${body}
      <p>Une question ? Répondez à ce message ou écrivez à <a href="mailto:${escapeHtml(SUPPORT_EMAIL)}">${escapeHtml(SUPPORT_EMAIL)}</a>.</p>
      <p>L’équipe FYGS</p>
    </div>`;
  return { subject: heading, html: createBaseTemplate(content, heading) };
};

export function refundConfirmationTemplate(input: {
  name: string;
  /** "l’abonnement Premium" or « Titre de la formation ». */
  product: string;
  amount: number;
  currency: string;
}): EmailTemplate {
  return wrap(
    "Votre remboursement est en route",
    input.product,
    `<h2>Bonjour ${escapeHtml(input.name)},</h2>
     <p>Nous vous remboursons <strong>${escapeHtml(formatPrice(input.amount, { currency: input.currency, freeLabel: false }))}</strong> pour ${escapeHtml(input.product)}.
     Le montant revient sur votre moyen de paiement sous 5 à 10 jours ouvrés, selon votre banque.</p>
     <p>L’accès correspondant s’arrête avec le remboursement ; votre progression est conservée.</p>`,
  );
}

export function disputeOpenedTemplate(input: { name: string; product: string }): EmailTemplate {
  return wrap(
    "Votre paiement est contesté auprès de votre banque",
    input.product,
    `<h2>Bonjour ${escapeHtml(input.name)},</h2>
     <p>Votre banque nous a signalé une contestation du paiement de ${escapeHtml(input.product)}. Pendant que la banque instruit le dossier, l’accès correspondant est suspendu ; il revient automatiquement si le paiement est confirmé.</p>
     <p>Si vous avez contesté ce paiement par erreur, contactez votre banque pour retirer la contestation, ou écrivez-nous : nous pouvons vous aider.</p>`,
  );
}
