import { SITE_URL } from "@/app/_lib/constants";

import { escapeHtml, singleLine } from "@/lib/html-escape";

import { createBaseTemplate } from "./base";

/** Stars for a rating, whatever the value received (never throws, never longer than five). */
const starsFor = (rating: number) => {
  const filled = Math.min(5, Math.max(0, Math.round(Number(rating) || 0)));
  return "★".repeat(filled) + "☆".repeat(5 - filled);
};

/** Review notification emails (instructors, moderators). */
export class ReviewEmailTemplates {
  // ============ REVIEW NOTIFICATION TEMPLATES ============

  // Notification d'un nouvel avis (pour l'instructeur)
  static newReviewForInstructor({
    instructorName,
    reviewerName,
    courseTitle,
    rating,
    comment,
    courseSlug,
    reviewId,
    siteUrl = SITE_URL,
  }: {
    instructorName: string;
    reviewerName: string;
    courseTitle: string;
    rating: number;
    comment?: string;
    courseSlug: string;
    reviewId: string;
    siteUrl?: string;
  }) {
    const stars = starsFor(rating);
    const content = `
      <div class="header">
        <h1>⭐ Nouvel avis sur votre formation</h1>
        <p>Un étudiant vient d'évaluer votre cours</p>
      </div>
      <div class="content">
        <h2>Bonjour ${escapeHtml(instructorName)} !</h2>
        <p><strong>${escapeHtml(reviewerName)}</strong> vient de laisser un avis sur votre formation :</p>
        
        <div class="highlight">
          <h3>📚 ${escapeHtml(courseTitle)}</h3>
          <p class="rating" style="font-size: 24px; color: #fbbf24; margin: 10px 0;">${stars} (${rating}/5)</p>
          ${
            comment
              ? `<p style="font-style: italic; color: #6b7280; background: #f9fafb; padding: 15px; border-radius: 8px; margin: 15px 0;">"${escapeHtml(comment)}"</p>`
              : ""
          }
        </div>

        <a href="${escapeHtml(siteUrl)}/courses/${encodeURIComponent(courseSlug)}/reviews/${encodeURIComponent(reviewId)}" class="cta-button">Voir l'avis complet</a>

        <p style="margin-top: 25px;">
          ${
            rating >= 4
              ? "Félicitations pour cet excellent retour ! 🎉"
              : rating >= 3
              ? "Continuez votre excellent travail ! 💪"
              : "N'hésitez pas à répondre à cet avis pour engager la conversation. 💬"
          }
        </p>

        <div class="features-list">
          <h4>Actions recommandées :</h4>
          <ul>
            <li>Répondre à l'avis pour remercier l'étudiant</li>
            <li>Analyser les retours pour améliorer votre contenu</li>
            <li>Encourager d'autres étudiants à laisser des avis</li>
          </ul>
        </div>
      </div>
      <div class="footer">
        <p>FYGS Learning Platform</p>
        <p><a href="${escapeHtml(siteUrl)}">fygs.dev</a> | <a href="${escapeHtml(siteUrl)}/dashboard/instructor">Tableau de bord instructeur</a></p>
      </div>
    `;

    return {
      subject: `⭐ Nouvel avis ${rating}/5 sur "${singleLine(courseTitle, 100)}"`,
      html: createBaseTemplate(content, "Nouvel avis"),
    };
  }

  // Notification de réponse de l'instructeur (pour l'étudiant)
  static instructorReplyToReview({
    studentName,
    instructorName,
    courseTitle,
    replyContent,
    originalRating,
    courseSlug,
    reviewId,
    siteUrl = SITE_URL,
  }: {
    studentName: string;
    instructorName: string;
    courseTitle: string;
    replyContent: string;
    originalRating: number;
    courseSlug: string;
    reviewId: string;
    siteUrl?: string;
  }) {
    const stars = starsFor(originalRating);
    const content = `
      <div class="header">
        <h1>💬 Réponse à votre avis</h1>
        <p>L'instructeur a répondu à votre évaluation</p>
      </div>
      <div class="content">
        <h2>Bonjour ${escapeHtml(studentName)} !</h2>
        <p><strong>${escapeHtml(instructorName)}</strong> a répondu à votre avis sur :</p>
        
        <div class="highlight">
          <h3>📚 ${escapeHtml(courseTitle)}</h3>
          <p class="rating" style="font-size: 20px; color: #fbbf24; margin: 10px 0;">Votre note : ${stars} (${originalRating}/5)</p>
        </div>

        <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h4 style="color: #0ea5e9; margin-bottom: 10px;">💬 Réponse de ${escapeHtml(instructorName)} :</h4>
          <p style="font-style: italic; line-height: 1.6;">"${escapeHtml(replyContent)}"</p>
        </div>

        <a href="${escapeHtml(siteUrl)}/courses/${encodeURIComponent(courseSlug)}/reviews/${encodeURIComponent(reviewId)}" class="cta-button">Voir la conversation</a>

        <p style="margin-top: 25px;">
          Merci d'avoir partagé votre expérience ! Vos retours nous aident à améliorer constamment la qualité de nos formations.
        </p>
      </div>
      <div class="footer">
        <p>FYGS Learning Platform</p>
        <p><a href="${escapeHtml(siteUrl)}">fygs.dev</a> | <a href="${escapeHtml(siteUrl)}/courses/${encodeURIComponent(courseSlug)}">Retour à la formation</a></p>
      </div>
    `;

    return {
      subject: `💬 ${singleLine(instructorName, 100)} a répondu à votre avis sur "${singleLine(courseTitle, 100)}"`,
      html: createBaseTemplate(content, "Réponse instructeur"),
    };
  }

  // Notification de signalement d'avis (pour les modérateurs)
  static reviewReported({
    moderatorName,
    reporterName,
    reviewerName,
    courseTitle,
    rating,
    comment,
    reportReason,
    reportDetails,
    reviewId,
    siteUrl = SITE_URL,
  }: {
    moderatorName: string;
    reporterName: string;
    reviewerName: string;
    courseTitle: string;
    rating: number;
    comment?: string;
    reportReason: string;
    reportDetails?: string;
    reviewId: string;
    siteUrl?: string;
  }) {
    const stars = starsFor(rating);
    const content = `
      <div class="header">
        <h1>🚨 Avis signalé</h1>
        <p>Intervention requise pour modération</p>
      </div>
      <div class="content">
        <h2>Bonjour ${escapeHtml(moderatorName)},</h2>
        <p>Un avis a été signalé et nécessite votre attention :</p>
        
        <div class="highlight">
          <h3>📚 Formation : ${escapeHtml(courseTitle)}</h3>
          <p><strong>Auteur de l'avis :</strong> ${escapeHtml(reviewerName)}</p>
          <p><strong>Note :</strong> ${stars} (${rating}/5)</p>
          ${
            comment
              ? `<p style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 15px 0;"><strong>Commentaire :</strong><br>"${escapeHtml(comment)}"</p>`
              : ""
          }
        </div>

        <div style="background: #fef2f2; border: 1px solid #f87171; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h4 style="color: #dc2626; margin-bottom: 10px;">🚨 Détails du signalement :</h4>
          <p><strong>Signalé par :</strong> ${escapeHtml(reporterName)}</p>
          <p><strong>Raison :</strong> ${escapeHtml(reportReason)}</p>
          ${
            reportDetails
              ? `<p><strong>Détails :</strong> ${escapeHtml(reportDetails)}</p>`
              : ""
          }
        </div>

        <a href="${escapeHtml(siteUrl)}/admin/reviews/${encodeURIComponent(reviewId)}" class="cta-button" style="background: #dc2626;">Modérer cet avis</a>

        <div class="features-list">
          <h4>Actions disponibles :</h4>
          <ul>
            <li>Approuver l'avis si conforme</li>
            <li>Rejeter l'avis si inapproprié</li>
            <li>Contacter l'auteur pour clarification</li>
            <li>Marquer comme faux signalement</li>
          </ul>
        </div>
      </div>
      <div class="footer">
        <p>FYGS Learning Platform - Administration</p>
        <p><a href="${escapeHtml(siteUrl)}/admin/reviews">Centre de modération</a></p>
      </div>
    `;

    return {
      subject: `🚨 [MODÉRATION] Avis signalé sur "${singleLine(courseTitle, 100)}"`,
      html: createBaseTemplate(content, "Avis signalé"),
    };
  }

  // Notification de vote utile sur un avis (pour l'auteur)
  static reviewHelpfulVote({
    reviewerName,
    courseTitle,
    rating,
    totalHelpfulVotes,
    courseSlug,
    reviewId,
    siteUrl = SITE_URL,
  }: {
    reviewerName: string;
    courseTitle: string;
    rating: number;
    totalHelpfulVotes: number;
    courseSlug: string;
    reviewId: string;
    siteUrl?: string;
  }) {
    const stars = starsFor(rating);
    const content = `
      <div class="header">
        <h1>👍 Votre avis a été trouvé utile</h1>
        <p>D'autres étudiants apprécient votre contribution</p>
      </div>
      <div class="content">
        <h2>Félicitations ${escapeHtml(reviewerName)} !</h2>
        <p>Votre avis sur <strong>${escapeHtml(courseTitle)}</strong> vient de recevoir un nouveau vote "utile" !</p>
        
        <div class="highlight">
          <h3>📚 ${escapeHtml(courseTitle)}</h3>
          <p class="rating" style="font-size: 20px; color: #fbbf24; margin: 10px 0;">Votre note : ${stars} (${rating}/5)</p>
          <p style="font-size: 18px; color: #059669; font-weight: 600;">
            👍 ${totalHelpfulVotes} personne${
      totalHelpfulVotes > 1 ? "s ont" : " a"
    } trouvé votre avis utile
          </p>
        </div>

        <a href="${escapeHtml(siteUrl)}/courses/${encodeURIComponent(courseSlug)}/reviews/${encodeURIComponent(reviewId)}" class="cta-button">Voir votre avis</a>

        <p style="margin-top: 25px;">
          Merci pour votre contribution à la communauté ! Vos retours authentiques aident d'autres étudiants à faire les bons choix.
        </p>

        ${
          totalHelpfulVotes >= 10
            ? `
          <div style="background: #f0fdf4; border: 1px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h4 style="color: #059669;">🏆 Avis populaire !</h4>
            <p>Votre avis a atteint ${totalHelpfulVotes} votes utiles ! Il sera mis en avant pour aider d'autres étudiants.</p>
          </div>
        `
            : ""
        }
      </div>
      <div class="footer">
        <p>FYGS Learning Platform</p>
        <p><a href="${escapeHtml(siteUrl)}">fygs.dev</a> | <a href="${escapeHtml(siteUrl)}/profile/reviews">Mes avis</a></p>
      </div>
    `;

    return {
      subject: `👍 Votre avis sur "${singleLine(courseTitle, 100)}" a été trouvé utile !`,
      html: createBaseTemplate(content, "Avis utile"),
    };
  }

  // Résumé hebdomadaire des avis (pour les instructeurs)
  static weeklyReviewSummary({
    instructorName,
    weeklyStats,
    topCourses,
    siteUrl = SITE_URL,
  }: {
    instructorName: string;
    weeklyStats: {
      totalReviews: number;
      averageRating: number;
      positiveReviews: number;
      responseRate: number;
    };
    topCourses: Array<{
      title: string;
      slug: string;
      newReviews: number;
      averageRating: number;
    }>;
    siteUrl?: string;
  }) {
    const { totalReviews, averageRating, positiveReviews, responseRate } =
      weeklyStats;
    const content = `
      <div class="header">
        <h1>📊 Résumé hebdomadaire des avis</h1>
        <p>Vos performances de la semaine</p>
      </div>
      <div class="content">
        <h2>Bonjour ${escapeHtml(instructorName)} !</h2>
        <p>Voici un résumé de l'activité des avis sur vos formations cette semaine :</p>
        
        <div class="highlight">
          <h3>📈 Statistiques de la semaine</h3>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0;">
            <div style="text-align: center; padding: 15px; background: #f0f9ff; border-radius: 8px;">
              <p style="font-size: 24px; font-weight: bold; color: #0ea5e9; margin: 0;">${totalReviews}</p>
              <p style="margin: 5px 0 0 0; color: #6b7280;">Nouveaux avis</p>
            </div>
            <div style="text-align: center; padding: 15px; background: #f0fdf4; border-radius: 8px;">
              <p style="font-size: 24px; font-weight: bold; color: #10b981; margin: 0;">${averageRating.toFixed(
                1
              )}/5</p>
              <p style="margin: 5px 0 0 0; color: #6b7280;">Note moyenne</p>
            </div>
            <div style="text-align: center; padding: 15px; background: #fef3c7; border-radius: 8px;">
              <p style="font-size: 24px; font-weight: bold; color: #d97706; margin: 0;">${Math.round(
                (positiveReviews / totalReviews) * 100
              )}%</p>
              <p style="margin: 5px 0 0 0; color: #6b7280;">Avis positifs</p>
            </div>
            <div style="text-align: center; padding: 15px; background: #f3e8ff; border-radius: 8px;">
              <p style="font-size: 24px; font-weight: bold; color: #8b5cf6; margin: 0;">${Math.round(
                responseRate
              )}%</p>
              <p style="margin: 5px 0 0 0; color: #6b7280;">Taux de réponse</p>
            </div>
          </div>
        </div>

        ${
          topCourses.length > 0
            ? `
          <div class="features-list">
            <h4>🏆 Formations les plus commentées :</h4>
            <ul>
              ${topCourses
                .map(
                  (course) => `
                <li><strong>${escapeHtml(course.title)}</strong> - ${
                    course.newReviews
                  } nouv. avis (${course.averageRating.toFixed(1)}/5)</li>
              `
                )
                .join("")}
            </ul>
          </div>
        `
            : ""
        }

        <a href="${escapeHtml(siteUrl)}/dashboard/instructor/reviews" class="cta-button">Voir tous mes avis</a>

        <p style="margin-top: 25px;">
          ${
            averageRating >= 4.5
              ? "Excellent travail ! Vos étudiants sont très satisfaits. 🌟"
              : averageRating >= 4.0
              ? "Très bonne performance ! Continuez comme ça. 👏"
              : "N'oubliez pas de répondre aux avis pour améliorer l'engagement. 💬"
          }
        </p>
      </div>
      <div class="footer">
        <p>FYGS Learning Platform</p>
        <p><a href="${escapeHtml(siteUrl)}/dashboard/instructor">Tableau de bord instructeur</a></p>
      </div>
    `;

    return {
      subject: `📊 Résumé hebdomadaire : ${totalReviews} nouveaux avis (${averageRating.toFixed(
        1
      )}/5)`,
      html: createBaseTemplate(content, "Résumé des avis"),
    };
  }
}
