import { SITE_URL } from "@/app/_lib/constants";
import { escapeHtml } from "@/lib/html-escape";
import { createBaseTemplate } from "./base";
import { emailLink } from "./links";

/** Account-security e-mails: a change of address asked for, a second factor turned on or off. */
export class SecurityEmailTemplates {
  /**
   * Sent to the CURRENT address when someone asks to move the account to `newEmail`. Nothing changes until the link is
   * used; the new address is then asked to confirm itself.
   */
  static emailChangeConfirmation(userName: string, newEmail: string, confirmUrl: string) {
    const content = `
      <div class="header">
        <h1>Changement d'adresse e-mail</h1>
        <p>Une confirmation est nécessaire</p>
      </div>
      <div class="content">
        <h2>Bonjour ${escapeHtml(userName)},</h2>
        <p>Une demande de changement d'adresse e-mail a été faite sur votre compte FYGS. Votre adresse deviendrait :</p>
        <div class="highlight"><p><strong>${escapeHtml(newEmail)}</strong></p></div>
        <p>Si c'est bien vous, confirmez en cliquant ci-dessous. Un second e-mail sera alors envoyé à la nouvelle adresse pour qu'elle confirme à son tour.</p>
        <a href="${emailLink(confirmUrl)}" class="cta-button">Confirmer le changement</a>
        <p><strong>Si vous n'êtes pas à l'origine de cette demande</strong>, ignorez ce message : votre adresse ne changera pas. Changez ensuite votre mot de passe depuis votre profil.</p>
        <p>Le lien expire dans 24 heures.</p>
      </div>
      <div class="footer">
        <p>FYGS Learning Platform - Équipe Sécurité</p>
        <p><a href="${escapeHtml(SITE_URL)}/profile">Mon profil</a></p>
      </div>
    `;
    return {
      subject: "Confirmez le changement de votre adresse e-mail - FYGS",
      html: createBaseTemplate(content, "Changement d'adresse e-mail"),
    };
  }

  /** Sent after the second factor was turned on or off. */
  static twoFactorChanged(userName: string, enabled: boolean) {
    const verb = enabled ? "activée" : "désactivée";
    const content = `
      <div class="header">
        <h1>Double authentification ${verb}</h1>
        <p>Votre sécurité est notre priorité</p>
      </div>
      <div class="content">
        <h2>Bonjour ${escapeHtml(userName)},</h2>
        <p>La double authentification de votre compte FYGS vient d'être <strong>${verb}</strong>.</p>
        <p><strong>Si vous n'êtes pas à l'origine de cette modification</strong>, changez immédiatement votre mot de passe et contactez <a href="mailto:security@fygs.dev">security@fygs.dev</a>.</p>
        <a href="${escapeHtml(SITE_URL)}/profile/security" class="cta-button">Gérer la sécurité de mon compte</a>
      </div>
      <div class="footer"><p>FYGS Learning Platform - Équipe Sécurité</p></div>
    `;
    return {
      subject: `Double authentification ${verb} - FYGS`,
      html: createBaseTemplate(content, `Double authentification ${verb}`),
    };
  }

  /** Sent when the account was erased at its owner's request (the address is the one the account had). */
  static accountDeleted(userName: string) {
    const content = `
      <div class="header">
        <h1>Compte supprimé</h1>
        <p>Votre demande a été traitée</p>
      </div>
      <div class="content">
        <h2>Bonjour ${escapeHtml(userName)},</h2>
        <p>Votre compte FYGS a été supprimé et vos données personnelles anonymisées. Les justificatifs de paiement sont conservés pour la durée que la loi impose.</p>
        <p><strong>Vous n'êtes pas à l'origine de cette suppression ?</strong> Écrivez immédiatement à <a href="mailto:security@fygs.dev">security@fygs.dev</a>.</p>
      </div>
      <div class="footer"><p>FYGS Learning Platform</p></div>
    `;
    return {
      subject: "Votre compte FYGS a été supprimé",
      html: createBaseTemplate(content, "Compte supprimé"),
    };
  }
}
