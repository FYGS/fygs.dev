import { SITE_BASE_URL } from "@/app/_lib/constants";
import { escapeHtml, singleLine } from "@/lib/html-escape";
import { createBaseTemplate } from "./base";
import { emailLink } from "./links";
import type { EmailTemplate } from "../service/types";


const button = (href: string, label: string) =>
  `<p style="text-align: center;"><a href="${emailLink(href)}" class="cta-button">${label}</a></p>`;

const footer = `
  <div class="footer">
    <p>FYGS, formations pour développeurs</p>
    <p><a href="${SITE_BASE_URL}/dashboard/my-courses">Mon apprentissage</a></p>
  </div>`;

/** After an enrolment: the course is open, here is the way in. */
export function enrollmentConfirmationTemplate(name: string, courseTitle: string, learnUrl: string): EmailTemplate {
  const title = escapeHtml(courseTitle);
  const subject = `Inscription confirmée : ${singleLine(courseTitle, 120)}`;
  const content = `
    <div class="header">
      <h1>Inscription confirmée</h1>
      <p>${title}</p>
    </div>
    <div class="content">
      <h2>Bonjour ${escapeHtml(name)},</h2>
      <p>Votre inscription à la formation <strong>${title}</strong> est confirmée. Vous pouvez commencer dès maintenant : votre progression est enregistrée et vous reprenez là où vous vous êtes arrêté, sur tous vos appareils.</p>
      ${button(learnUrl, "Commencer la formation")}
      <p>Bon apprentissage,<br>L’équipe FYGS</p>
    </div>
    ${footer}`;
  return { subject, html: createBaseTemplate(content, subject) };
}

/** After a certificate (course or path) is delivered: the link opens the learner's certificate page (PDF, sharing). */
export function certificateEarnedTemplate(
  name: string,
  title: string,
  certificateUrl: string,
  kind: "course" | "path" = "course",
): EmailTemplate {
  const safeTitle = escapeHtml(title);
  const what = kind === "path" ? "le parcours" : "la formation";
  const subject = kind === "path" ? `Certificat de parcours obtenu : ${singleLine(title, 120)}` : `Certificat obtenu : ${singleLine(title, 120)}`;
  const content = `
    <div class="header">
      <h1>Félicitations</h1>
      <p>${safeTitle}</p>
    </div>
    <div class="content">
      <h2>Bravo ${escapeHtml(name)},</h2>
      <p>Vous avez terminé ${what} <strong>${safeTitle}</strong>. Votre certificat est disponible : téléchargez-le en PDF, ajoutez-le à votre profil LinkedIn ou partagez son lien de vérification.</p>
      ${button(certificateUrl, "Voir mon certificat")}
      <p>Envie de continuer ? <a href="${SITE_BASE_URL}/formations">Découvrir les formations</a></p>
      <p>L’équipe FYGS</p>
    </div>
    ${footer}`;
  return { subject, html: createBaseTemplate(content, subject) };
}
