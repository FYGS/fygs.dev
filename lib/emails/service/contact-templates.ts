import { SITE_BASE_URL } from "@/app/_lib/constants";

import { escapeHtml, singleLine } from "@/lib/html-escape";

import type { ContactFormData, EmailTemplate } from "./types";

/** An address in a mailto: link: percent-encoded (the @ stays readable), never able to leave the attribute. */
const mailtoAddress = (value: string) => encodeURIComponent(String(value ?? "")).replace(/%40/g, "@");
/** Text put in a mailto: query (subject, body): percent-encoded, one line. */
const mailtoText = (value: string, maxLength = 150) => encodeURIComponent(singleLine(value, maxLength));

/** Contact form emails (admin notification and user confirmation). */
export class ContactEmailTemplates {
  // Contact Form Templates - Intelligent templates based on contact type
  contactFormAdminEmail(data: ContactFormData): EmailTemplate {
    const {
      name,
      email,
      subject,
      message,
      type = "general",
      company,
      position,
      timeline,
      framing,
    } = data;

    const timelineLabels: Record<string, string> = {
      asap: "Dès que possible",
      "one-to-three-months": "Dans 1 à 3 mois",
      later: "Plus tard",
      exploring: "Je me renseigne",
    };
    const framingLabels: Record<string, string> = {
      "written-spec": "Cadrage et spec écrite existants",
      partial: "Cadrage partiel",
      none: "Pas de cadrage",
    };

    const getTypeIcon = (type: string) => {
      switch (type) {
        case "project":
          return "🚀";
        case "recruitment":
          return "💼";
        case "collaboration":
          return "🤝";
        case "training":
          return "📚";
        default:
          return "📧";
      }
    };

    const getTypeLabel = (type: string) => {
      switch (type) {
        case "project":
          return "Demande de Projet";
        case "recruitment":
          return "Opportunité de Recrutement";
        case "collaboration":
          return "Proposition de Collaboration";
        case "training":
          return "Demande de Formation";
        default:
          return "Contact Général";
      }
    };

    const getTypeColor = (type: string) => {
      switch (type) {
        case "project":
          return "#f59e0b";
        case "recruitment":
          return "#10b981";
        case "collaboration":
          return "#3b82f6";
        case "training":
          return "#8b5cf6";
        default:
          return "#6b7280";
      }
    };

    // Qualification rows: empty (no whitespace at all) when the visitor did not fill them, so older mails stay identical
    const qualificationRow = (label: string, value: string) =>
      `<div class="metadata-item"><div class="metadata-label">${label}</div><div class="metadata-value">${escapeHtml(value)}</div></div>`;
    const qualificationRows =
      (timeline ? qualificationRow("Délai", timelineLabels[timeline] ?? timeline) : "") +
      (framing ? qualificationRow("Cadrage", framingLabels[framing] ?? framing) : "");

    // The subject is a header: one line, bounded, whatever the visitor typed
    const adminSubject = `${getTypeIcon(type)} [FYGS.dev] ${getTypeLabel(
      type
    )} - ${singleLine(subject, 150)}`;

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${escapeHtml(adminSubject)}</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f9fafb; }
                .container { max-width: 700px; margin: 0 auto; background: white; }
                .header { background: linear-gradient(135deg, ${getTypeColor(
                  type
                )} 0%, ${getTypeColor(
      type
    )}dd 100%); color: white; padding: 40px 30px; text-align: center; }
                .content { padding: 40px 30px; }
                .contact-info { background: #f8fafc; border-left: 4px solid ${getTypeColor(
                  type
                )}; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0; }
                .message-box { background: #ffffff; border: 1px solid #e5e7eb; padding: 25px; margin: 25px 0; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
                .priority-badge { display: inline-block; background: ${getTypeColor(
                  type
                )}; color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
                .footer { background: #f8fafc; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; }
                .quick-actions { display: flex; gap: 15px; margin: 25px 0; flex-wrap: wrap; }
                .action-btn { display: inline-block; padding: 12px 20px; background: ${getTypeColor(
                  type
                )}; color: white; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 14px; }
                .metadata { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
                .metadata-item { background: white; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; }
                .metadata-label { font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 600; margin-bottom: 5px; }
                .metadata-value { font-size: 14px; color: #1f2937; font-weight: 500; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>${getTypeIcon(type)} ${getTypeLabel(type)}</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">Nouveau message via FYGS.dev</p>
                </div>
                
                <div class="content">
                    <div style="margin-bottom: 25px;">
                        <span class="priority-badge">${getTypeLabel(
                          type
                        )}</span>
                    </div>

                    <div class="contact-info">
                        <h3 style="margin: 0 0 15px 0; color: #1f2937;">📋 Informations du contact</h3>
                        <div class="metadata">
                            <div class="metadata-item">
                                <div class="metadata-label">Nom</div>
                                <div class="metadata-value">${escapeHtml(name)}</div>
                            </div>
                            <div class="metadata-item">
                                <div class="metadata-label">Email</div>
                                <div class="metadata-value"><a href="mailto:${mailtoAddress(email)}" style="color: ${getTypeColor(
      type
    )};">${escapeHtml(email)}</a></div>
                            </div>
                            ${
                              company
                                ? `
                            <div class="metadata-item">
                                <div class="metadata-label">Entreprise</div>
                                <div class="metadata-value">${escapeHtml(company)}</div>
                            </div>
                            `
                                : ""
                            }
                            ${
                              position
                                ? `
                            <div class="metadata-item">
                                <div class="metadata-label">Poste</div>
                                <div class="metadata-value">${escapeHtml(position)}</div>
                            </div>
                            `
                                : ""
                            }${qualificationRows}
                        </div>
                    </div>

                    <div class="message-box">
                        <h3 style="margin: 0 0 15px 0; color: #1f2937;">💬 Sujet: ${escapeHtml(subject)}</h3>
                        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid ${getTypeColor(
                          type
                        )};">
                            <p style="margin: 0; white-space: pre-wrap; line-height: 1.7;">${escapeHtml(message)}</p>
                        </div>
                    </div>

                    <div class="quick-actions">
                        <a href="mailto:${mailtoAddress(email)}?subject=Re: ${mailtoText(subject)}" class="action-btn">
                            📧 Répondre par email
                        </a>
                        ${
                          type === "recruitment"
                            ? `
                        <a href="mailto:${mailtoAddress(email)}?subject=Re: ${mailtoText(subject)}&body=Bonjour ${mailtoText(name, 80)},%0D%0A%0D%0AMerci pour votre intérêt concernant mes services. Je serais ravi de discuter de cette opportunité avec vous.%0D%0A%0D%0APouvons-nous planifier un appel cette semaine ?%0D%0A%0D%0ACordialement,%0D%0AFernand" class="action-btn">
                            💼 Réponse recrutement
                        </a>
                        `
                            : ""
                        }
                        ${
                          type === "collaboration"
                            ? `
                        <a href="mailto:${mailtoAddress(email)}?subject=Re: ${mailtoText(subject)}&body=Bonjour ${mailtoText(name, 80)},%0D%0A%0D%0AMerci pour votre proposition de collaboration. Votre projet m'intéresse.%0D%0A%0D%0APouvons-nous organiser une visioconférence pour en discuter plus en détail ?%0D%0A%0D%0ACordialement,%0D%0AFernand" class="action-btn">
                            🤝 Réponse collaboration
                        </a>
                        `
                            : ""
                        }
                        ${
                          type === "training"
                            ? `
                        <a href="mailto:${mailtoAddress(email)}?subject=Re: ${mailtoText(subject)}&body=Bonjour ${mailtoText(name, 80)},%0D%0A%0D%0AMerci pour votre intérêt pour nos formations. Je serais ravi de vous accompagner dans votre apprentissage.%0D%0A%0D%0AConsultez notre catalogue: ${SITE_BASE_URL}/formations%0D%0A%0D%0ACordialement,%0D%0AFernand" class="action-btn">
                            📚 Réponse formation
                        </a>
                        `
                            : ""
                        }
                    </div>
                </div>

                <div class="footer">
                    <p style="margin: 0 0 10px 0;">
                        <strong>FYGS Learning Platform</strong> - Plateforme d'apprentissage premium
                    </p>
                    <p style="margin: 0; font-size: 12px;">
                        Message reçu le ${new Date().toLocaleDateString(
                          "fr-FR",
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                    </p>
                </div>
            </div>
        </body>
        </html>
        `;

    return { subject: adminSubject, html };
  }

  contactFormUserConfirmation(data: ContactFormData): EmailTemplate {
    const { name, type = "general" } = data;

    const getTypeResponse = (type: string) => {
      switch (type) {
        case "recruitment":
          return {
            title: "💼 Opportunité de Recrutement Reçue",
            message:
              "Merci pour votre intérêt concernant mes services de développement. Je reviendrai vers vous rapidement pour discuter de cette opportunité.",
            nextSteps: [
              "Analyse de votre demande et du profil recherché",
              "Évaluation de la compatibilité avec mes disponibilités",
              "Retour sous 24-48h avec une proposition de rendez-vous",
            ],
            cta: "Voir mon profil",
            ctaUrl: `${SITE_BASE_URL}/me`,
          };
        case "collaboration":
          return {
            title: "🤝 Proposition de Collaboration Reçue",
            message:
              "Votre projet m'intéresse ! Je vais étudier votre proposition et vous contacter pour organiser une discussion approfondie.",
            nextSteps: [
              "Analyse détaillée de votre projet",
              "Évaluation de la faisabilité technique",
              "Proposition de collaboration personnalisée",
            ],
            cta: "Découvrir mes projets",
            ctaUrl: `${SITE_BASE_URL}/projects`,
          };
        case "training":
          return {
            title: "📚 Demande de Formation Reçue",
            message:
              "Merci pour votre intérêt pour nos formations ! Je vais vous contacter pour comprendre vos besoins spécifiques et vous proposer un parcours adapté.",
            nextSteps: [
              "Analyse de vos objectifs d'apprentissage",
              "Recommandation de formations personnalisées",
              "Proposition de suivi et d'accompagnement",
            ],
            cta: "Explorer les formations",
            ctaUrl: `${SITE_BASE_URL}/formations`,
          };
        default:
          return {
            title: "📧 Message Reçu avec Succès",
            message:
              "Merci de m'avoir contacté ! Je reviendrai vers vous dans les plus brefs délais.",
            nextSteps: [
              "Analyse de votre demande",
              "Préparation d'une réponse personnalisée",
              "Retour sous 24-48h maximum",
            ],
            cta: "Découvrir FYGS.dev",
            ctaUrl: SITE_BASE_URL,
          };
      }
    };

    const response = getTypeResponse(type);
    const subject = `✅ ${response.title} - Confirmation de réception`;

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${escapeHtml(subject)}</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f9fafb; }
                .container { max-width: 600px; margin: 0 auto; background: white; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
                .content { padding: 40px 30px; }
                .success-badge { background: #10b981; color: white; padding: 8px 16px; border-radius: 25px; font-size: 14px; font-weight: 600; display: inline-block; margin-bottom: 25px; }
                .next-steps { background: #f0f9ff; border: 1px solid #0ea5e9; padding: 25px; border-radius: 12px; margin: 25px 0; }
                .step { display: flex; align-items: flex-start; margin: 15px 0; }
                .step-number { background: #0ea5e9; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; margin-right: 15px; flex-shrink: 0; }
                .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 600; margin: 25px 0; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); transition: transform 0.2s; }
                .cta-button:hover { transform: translateY(-2px); }
                .resources { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
                .resource-card { background: #f8fafc; padding: 20px; border-radius: 12px; text-align: center; border: 1px solid #e2e8f0; }
                .footer { background: #f8fafc; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>✅ Message Reçu !</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">Merci ${escapeHtml(name)} pour votre confiance</p>
                </div>
                
                <div class="content">
                    <div class="success-badge">
                        ${response.title}
                    </div>

                    <p style="font-size: 16px; line-height: 1.7; margin-bottom: 25px;">
                        Bonjour <strong>${escapeHtml(name)}</strong>,
                    </p>

                    <p style="font-size: 16px; line-height: 1.7; margin-bottom: 25px;">
                        ${response.message}
                    </p>

                    <div class="next-steps">
                        <h3 style="margin: 0 0 20px 0; color: #0ea5e9;">🚀 Prochaines étapes</h3>
                        ${response.nextSteps
                          .map(
                            (step, index) => `
                            <div class="step">
                                <div class="step-number">${index + 1}</div>
                                <div>${step}</div>
                            </div>
                        `
                          )
                          .join("")}
                    </div>

                    <div style="text-align: center; margin: 35px 0;">
                        <a href="${response.ctaUrl}" class="cta-button">
                            ${response.cta}
                        </a>
                    </div>

                    <div class="resources">
                        <a href="${SITE_BASE_URL}/formations" class="resource-card">
                            <div class="resource-card">
                            <h4 style="margin: 0 0 10px 0; color: #1f2937;">📚 Formations</h4>
                            <p style="margin: 0; font-size: 14px; color: #6b7280;">Découvrez nos cours premium</p>
                            </div>
                        </a>
                        <a href="${SITE_BASE_URL}/projects" class="resource-card">
                            <div class="resource-card">
                            <h4 style="margin: 0 0 10px 0; color: #1f2937;">💼 Portfolio</h4>
                            <p style="margin: 0; font-size: 14px; color: #6b7280;">Explorez mes réalisations</p>
                            </div>
                        </a>
                        <a href="${SITE_BASE_URL}/blog" class="resource-card">
                            <div class="resource-card">
                            <h4 style="margin: 0 0 10px 0; color: #1f2937;">📝 Blog</h4>
                            <p style="margin: 0; font-size: 14px; color: #6b7280;">Articles et tutoriels</p>
                            </div>
                        </a>
                    </div>

                    <p style="font-size: 16px; line-height: 1.7; margin-top: 30px;">
                        En attendant ma réponse, n'hésitez pas à explorer la plateforme et découvrir tout ce que FYGS.dev a à offrir !
                    </p>

                    <p style="font-size: 16px; line-height: 1.7;">
                        À très bientôt,<br>
                        <strong>Fernand Soualo</strong><br>
                        <span style="color: #6b7280;">Développeur Full-Stack & Formateur</span>
                    </p>
                </div>

                <div class="footer">
                    <p style="margin: 0 0 15px 0;">
                        <strong>FYGS Learning Platform</strong>
                    </p>
                    <p style="margin: 0; font-size: 12px;">
                        <a href="${SITE_BASE_URL}" style="color: #667eea;">fygs.dev</a> | 
                        <a href="mailto:contact@fygs.dev" style="color: #667eea;">contact@fygs.dev</a>
                    </p>
                    <p style="margin: 15px 0 0 0; font-size: 12px;">
                        © 2025 FYGS Learning Platform. Tous droits réservés.
                    </p>
                </div>
            </div>
        </body>
        </html>
        `;

    return { subject, html };
  }
}

export const contactEmailTemplates = new ContactEmailTemplates();
