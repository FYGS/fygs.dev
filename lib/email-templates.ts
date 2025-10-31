import { SITE_URL } from "@/app/_lib/constants";

interface EmailTemplateProps {
  userName: string;
  siteUrl?: string;
}

interface CourseTemplateProps extends EmailTemplateProps {
  courseTitle: string;
  courseSlug: string;
  coursePrice?: number;
}

interface SubscriptionTemplateProps extends EmailTemplateProps {
  planName: string;
  price: number;
  billingPeriod: "monthly" | "yearly";
  nextBillingDate?: string;
}

interface PasswordChangeTemplateProps extends EmailTemplateProps {
  changeDate: string;
  ipAddress?: string;
}

// Base email template with modern design
const createBaseTemplate = (content: string, title: string) => `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background-color: #f9fafb;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        .header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
        }
        .header p {
            font-size: 16px;
            opacity: 0.9;
        }
        .content {
            padding: 40px 30px;
        }
        .content h2 {
            color: #1f2937;
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 20px;
        }
        .content p {
            margin-bottom: 16px;
            color: #4b5563;
            font-size: 16px;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white !important;
            text-decoration: none;
            padding: 14px 28px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: transform 0.2s ease;
        }
        .cta-button:hover {
            transform: translateY(-2px);
        }
        .features-list {
            background-color: #f8fafc;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .features-list ul {
            list-style: none;
        }
        .features-list li {
            padding: 8px 0;
            position: relative;
            padding-left: 24px;
        }
        .features-list li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #10b981;
            font-weight: bold;
        }
        .highlight {
            background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
            border-left: 4px solid #667eea;
            padding: 16px;
            border-radius: 0 8px 8px 0;
            margin: 20px 0;
        }
        .footer {
            background-color: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        .footer p {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 8px;
        }
        .footer a {
            color: #667eea;
            text-decoration: none;
        }
        .social-links {
            margin-top: 20px;
        }
        .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: #6b7280;
            text-decoration: none;
        }
        @media only screen and (max-width: 600px) {
            .container { margin: 0 10px; }
            .header, .content, .footer { padding: 20px; }
            .header h1 { font-size: 24px; }
            .content h2 { font-size: 20px; }
        }
    </style>
</head>
<body>
    <div style="padding: 20px 0;">
        <div class="container">
            ${content}
        </div>
    </div>
</body>
</html>
`;

export class ModernEmailTemplates {
  // Email de bienvenue à l'inscription
  static welcomeRegistration({
    userName,
    siteUrl = SITE_URL,
  }: EmailTemplateProps) {
    const content = `
      <div class="header">
        <h1>🎉 Bienvenue sur FYGS !</h1>
        <p>Votre parcours d'apprentissage commence maintenant</p>
      </div>
      <div class="content">
        <h2>Salut ${userName} !</h2>
        <p>Félicitations ! Vous venez de rejoindre la communauté FYGS, la plateforme d'apprentissage moderne qui va transformer votre carrière en développement.</p>
        
        <div class="highlight">
          <p><strong>🚀 Prêt à commencer ?</strong></p>
          <p>Explorez notre catalogue de formations premium et découvrez les technologies les plus demandées du marché.</p>
        </div>

        <a href="${siteUrl}/formations" class="cta-button">Découvrir les formations</a>

        <div class="features-list">
          <h3>Ce qui vous attend :</h3>
          <ul>
            <li>Formations complètes en JavaScript, TypeScript, React, Next.js</li>
            <li>Projets pratiques et cas d'usage réels</li>
            <li>Accès à vie aux contenus achetés</li>
            <li>Certificats de completion</li>
            <li>Support communautaire</li>
          </ul>
        </div>

        <p>Des questions ? N'hésitez pas à nous contacter à <a href="mailto:support@fygs.dev">support@fygs.dev</a></p>
      </div>
      <div class="footer">
        <p>FYGS Learning Platform</p>
        <p><a href="${siteUrl}">fygs.dev</a> | <a href="${siteUrl}/contact">Contact</a> | <a href="${siteUrl}/privacy">Confidentialité</a></p>
      </div>
    `;

    return {
      subject: "🎉 Bienvenue sur FYGS - Votre parcours commence maintenant !",
      html: createBaseTemplate(content, "Bienvenue sur FYGS"),
    };
  }

  // Email d'achat de cours individuel
  static coursePurchase({
    userName,
    courseTitle,
    courseSlug,
    coursePrice,
    siteUrl = SITE_URL,
  }: CourseTemplateProps) {
    const content = `
      <div class="header">
        <h1>✅ Achat confirmé !</h1>
        <p>Votre formation est maintenant accessible</p>
      </div>
      <div class="content">
        <h2>Merci ${userName} !</h2>
        <p>Votre achat de la formation <strong>"${courseTitle}"</strong> a été confirmé avec succès.</p>
        
        <div class="highlight">
          <p><strong>💡 Votre formation est prête !</strong></p>
          <p>Vous avez maintenant un accès à vie à tous les contenus de cette formation.</p>
        </div>

        <a href="${siteUrl}/formations/${courseSlug}" class="cta-button">Commencer la formation</a>

        <div class="features-list">
          <h3>Inclus dans votre achat :</h3>
          <ul>
            <li>Accès à vie à tous les cours et leçons</li>
            <li>Ressources téléchargeables</li>
            <li>Projets pratiques avec corrections</li>
            <li>Certificat de completion</li>
            <li>Mises à jour gratuites du contenu</li>
          </ul>
        </div>

        ${
          coursePrice
            ? `<p><strong>Prix payé :</strong> ${coursePrice}€</p>`
            : ""
        }
        
        <p>Besoin d'aide ? Notre équipe est là pour vous accompagner à <a href="mailto:support@fygs.dev">support@fygs.dev</a></p>
      </div>
      <div class="footer">
        <p>FYGS Learning Platform</p>
        <p><a href="${siteUrl}/dashboard">Mon tableau de bord</a> | <a href="${siteUrl}/contact">Support</a></p>
      </div>
    `;

    return {
      subject: `✅ Formation "${courseTitle}" - Accès confirmé !`,
      html: createBaseTemplate(content, "Achat confirmé"),
    };
  }

  // Email de souscription premium
  static premiumSubscription({
    userName,
    planName,
    price,
    billingPeriod,
    siteUrl = SITE_URL,
  }: SubscriptionTemplateProps) {
    const content = `
      <div class="header">
        <h1>🌟 Bienvenue Premium !</h1>
        <p>Accès illimité à toutes nos formations</p>
      </div>
      <div class="content">
        <h2>Félicitations ${userName} !</h2>
        <p>Votre abonnement <strong>${planName}</strong> est maintenant actif. Vous avez désormais accès à l'intégralité du catalogue FYGS !</p>
        
        <div class="highlight">
          <p><strong>🎯 Accès Premium Activé</strong></p>
          <p>Toutes nos formations sont maintenant à votre disposition, sans limitation.</p>
        </div>

        <a href="${siteUrl}/formations" class="cta-button">Explorer toutes les formations</a>

        <div class="features-list">
          <h3>Vos avantages Premium :</h3>
          <ul>
            <li>Accès illimité à toutes les formations existantes et futures</li>
            <li>Nouveau contenu ajouté chaque mois</li>
            <li>Sessions live exclusives avec l'instructeur</li>
            <li>Accès prioritaire aux nouvelles formations</li>
            <li>Support technique prioritaire</li>
            <li>Certificats illimités</li>
          </ul>
        </div>

        <p><strong>Votre abonnement :</strong> ${price}€/${
      billingPeriod === "monthly" ? "mois" : "an"
    }</p>
        
        <p>Gérez votre abonnement depuis votre <a href="${siteUrl}/dashboard/billing">espace facturation</a></p>
      </div>
      <div class="footer">
        <p>FYGS Learning Platform - Abonnement Premium</p>
        <p><a href="${siteUrl}/dashboard">Tableau de bord</a> | <a href="${siteUrl}/dashboard/billing">Facturation</a></p>
      </div>
    `;

    return {
      subject: `🌟 Abonnement Premium activé - Accès illimité !`,
      html: createBaseTemplate(content, "Premium activé"),
    };
  }

  // Email de mise à jour d'abonnement
  static subscriptionUpdated({
    userName,
    planName,
    price,
    billingPeriod,
    nextBillingDate,
    siteUrl = SITE_URL,
  }: SubscriptionTemplateProps) {
    const content = `
      <div class="header">
        <h1>📋 Abonnement mis à jour</h1>
        <p>Vos modifications ont été enregistrées</p>
      </div>
      <div class="content">
        <h2>Bonjour ${userName},</h2>
        <p>Votre abonnement <strong>${planName}</strong> a été mis à jour avec succès.</p>
        
        <div class="highlight">
          <p><strong>Nouvel abonnement :</strong> ${price}€/${
      billingPeriod === "monthly" ? "mois" : "an"
    }</p>
          ${
            nextBillingDate
              ? `<p><strong>Prochaine facturation :</strong> ${nextBillingDate}</p>`
              : ""
          }
        </div>

        <a href="${siteUrl}/dashboard/billing" class="cta-button">Gérer mon abonnement</a>

        <p>Ces modifications prendront effet lors de votre prochaine période de facturation.</p>
        
        <p>Questions sur votre abonnement ? Contactez-nous à <a href="mailto:support@fygs.dev">support@fygs.dev</a></p>
      </div>
      <div class="footer">
        <p>FYGS Learning Platform</p>
        <p><a href="${siteUrl}/dashboard/billing">Facturation</a> | <a href="${siteUrl}/contact">Support</a></p>
      </div>
    `;

    return {
      subject: "📋 Votre abonnement FYGS a été mis à jour",
      html: createBaseTemplate(content, "Abonnement mis à jour"),
    };
  }

  // Email de changement de mot de passe
  static passwordChanged({
    userName,
    changeDate,
    ipAddress,
    siteUrl = SITE_URL,
  }: PasswordChangeTemplateProps) {
    const content = `
      <div class="header">
        <h1>🔐 Mot de passe modifié</h1>
        <p>Votre sécurité est notre priorité</p>
      </div>
      <div class="content">
        <h2>Bonjour ${userName},</h2>
        <p>Votre mot de passe a été modifié avec succès le <strong>${changeDate}</strong>.</p>
        
        <div class="highlight">
          <p><strong>🛡️ Détails de la modification :</strong></p>
          <p><strong>Date :</strong> ${changeDate}</p>
          ${
            ipAddress ? `<p><strong>Adresse IP :</strong> ${ipAddress}</p>` : ""
          }
        </div>

        <p><strong>Si vous n'êtes pas à l'origine de cette modification :</strong></p>
        <ol>
          <li>Connectez-vous immédiatement à votre compte</li>
          <li>Changez votre mot de passe</li>
          <li>Contactez notre support à <a href="mailto:security@fygs.dev">security@fygs.dev</a></li>
        </ol>

        <a href="${siteUrl}/profile" class="cta-button">Gérer mon profil</a>

        <p>Pour votre sécurité, nous vous recommandons d'utiliser un mot de passe unique et complexe.</p>
      </div>
      <div class="footer">
        <p>FYGS Learning Platform - Équipe Sécurité</p>
        <p><a href="${siteUrl}/profile">Mon profil</a> | <a href="mailto:security@fygs.dev">Sécurité</a></p>
      </div>
    `;

    return {
      subject: "🔐 Confirmation de changement de mot de passe - FYGS",
      html: createBaseTemplate(content, "Mot de passe modifié"),
    };
  }

  // Email d'échec de paiement
  static paymentFailed({ userName, siteUrl = SITE_URL }: EmailTemplateProps) {
    const content = `
      <div class="header" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">
        <h1>⚠️ Problème de paiement</h1>
        <p>Action requise pour maintenir votre accès</p>
      </div>
      <div class="content">
        <h2>Bonjour ${userName},</h2>
        <p>Nous n'avons pas pu traiter le paiement de votre abonnement FYGS Premium.</p>
        
        <div class="highlight" style="border-left-color: #ef4444;">
          <p><strong>⏰ Action requise</strong></p>
          <p>Mettez à jour vos informations de paiement dans les 7 jours pour éviter la suspension de votre accès.</p>
        </div>

        <a href="${siteUrl}/dashboard/billing" class="cta-button" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">Mettre à jour le paiement</a>

        <p><strong>Que faire ?</strong></p>
        <ol>
          <li>Vérifiez que votre carte n'a pas expiré</li>
          <li>Assurez-vous d'avoir suffisamment de fonds</li>
          <li>Mettez à jour vos informations si nécessaire</li>
        </ol>

        <p>Notre équipe est là pour vous aider : <a href="mailto:billing@fygs.dev">billing@fygs.dev</a></p>
      </div>
      <div class="footer">
        <p>FYGS Learning Platform - Service Facturation</p>
        <p><a href="${siteUrl}/dashboard/billing">Facturation</a> | <a href="mailto:billing@fygs.dev">Support Paiement</a></p>
      </div>
    `;

    return {
      subject: "⚠️ Action requise - Problème de paiement FYGS",
      html: createBaseTemplate(content, "Problème de paiement"),
    };
  }

  // Email de suppression d'abonnement
  static subscriptionCanceled({
    userName,
    siteUrl = SITE_URL,
  }: EmailTemplateProps) {
    const content = `
      <div class="header" style="background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);">
        <h1>📋 Abonnement annulé</h1>
        <p>Nous espérons vous revoir bientôt</p>
      </div>
      <div class="content">
        <h2>Au revoir ${userName},</h2>
        <p>Votre abonnement FYGS Premium a été annulé avec succès.</p>
        
        <div class="highlight">
          <p><strong>📅 Accès maintenu jusqu'à la fin de période</strong></p>
          <p>Vous conservez l'accès à toutes les formations jusqu'à la fin de votre période de facturation actuelle.</p>
        </div>

        <p><strong>Vos formations individuelles restent accessibles</strong> - Seul l'accès Premium sera suspendu.</p>

        <a href="${siteUrl}/formations" class="cta-button">Parcourir les formations</a>

        <p>Vous nous manquez déjà ! Si vous changez d'avis, vous pouvez réactiver votre abonnement à tout moment.</p>
        
        <p>Merci d'avoir fait partie de la communauté FYGS.</p>
      </div>
      <div class="footer">
        <p>FYGS Learning Platform</p>
        <p><a href="${siteUrl}/pricing">Réabonnement</a> | <a href="${siteUrl}/contact">Nous dire pourquoi</a></p>
      </div>
    `;

    return {
      subject: "📋 Confirmation d'annulation - FYGS Premium",
      html: createBaseTemplate(content, "Abonnement annulé"),
    };
  }

  // Email d'annulation immédiate
  static subscriptionCanceledImmediate({
    userName,
    siteUrl = SITE_URL,
  }: EmailTemplateProps) {
    const content = `
      <div class="header" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">
        <h1>❌ Abonnement résilié immédiatement</h1>
        <p>Votre accès Premium est désormais désactivé</p>
      </div>
      <div class="content">
        <h2>Bonjour ${userName},</h2>
        <p>Votre abonnement Premium a été résilié immédiatement comme demandé. Vous n'avez plus accès au catalogue illimité.</p>
        <div class="highlight" style="border-left-color:#ef4444;">
          <p><strong>Ce que cela signifie :</strong></p>
          <p>- Accès Premium retiré dès maintenant<br/>- Vos formations achetées individuellement restent disponibles<br/>- Aucune facturation future</p>
        </div>
        <p>Vous pouvez réactiver un abonnement à tout moment.</p>
        <a href="${siteUrl}/pricing" class="cta-button" style="background: linear-gradient(135deg,#2563eb 0%,#4338ca 100%);">Voir les offres</a>
      </div>
      <div class="footer">
        <p>FYGS Learning Platform</p>
        <p><a href="${siteUrl}/pricing">Revenir en Premium</a></p>
      </div>
    `;
    return {
      subject: "❌ Résiliation immédiate de votre abonnement",
      html: createBaseTemplate(content, "Abonnement résilié"),
    };
  }

  // Email de changement de formule (switch monthly/yearly)
  static subscriptionPlanSwitched({
    userName,
    planName,
    price,
    billingPeriod,
    nextBillingDate,
    siteUrl = SITE_URL,
  }: SubscriptionTemplateProps) {
    const content = `
      <div class="header" style="background: linear-gradient(135deg,#6366f1 0%,#7c3aed 100%);">
        <h1>🔄 Changement d'abonnement</h1>
        <p>Votre nouvelle formule est en place</p>
      </div>
      <div class="content">
        <h2>Bonjour ${userName},</h2>
        <p>Votre abonnement a été basculé vers la formule <strong>${planName}</strong> (${price}€ / ${
      billingPeriod === "monthly" ? "mois" : "an"
    }).</p>
        <div class="highlight">
          <p><strong>Détails :</strong></p>
          ${
            nextBillingDate
              ? `<p>Nouvelle prochaine facturation : <strong>${nextBillingDate}</strong></p>`
              : ""
          }
          <p>Une facture de régularisation (proration) peut apparaître selon votre précédent cycle.</p>
        </div>
        <p>Vous pouvez consulter l'historique dans votre espace facturation.</p>
        <a href="${siteUrl}/dashboard/billing" class="cta-button">Voir la facturation</a>
      </div>
      <div class="footer">
        <p>FYGS Learning Platform</p>
        <p><a href="${siteUrl}/dashboard/billing">Facturation</a></p>
      </div>
    `;
    return {
      subject: "🔄 Votre abonnement a été modifié",
      html: createBaseTemplate(content, "Abonnement modifié"),
    };
  }

  // Email de remboursement
  static refundIssued({
    userName,
    courseTitle,
    amount,
    siteUrl = SITE_URL,
  }: {
    userName: string;
    courseTitle?: string;
    amount?: number;
    siteUrl?: string;
  }) {
    const content = `
      <div class="header" style="background: linear-gradient(135deg,#0ea5e9 0%,#0369a1 100%);">
        <h1>💸 Remboursement effectué</h1>
        <p>Votre demande a été traitée</p>
      </div>
      <div class="content">
        <h2>Bonjour ${userName},</h2>
        <p>Votre remboursement ${
          amount ? `de <strong>${amount}€</strong>` : ""
        } a été traité avec succès${
      courseTitle ? ` pour la formation <strong>${courseTitle}</strong>` : ""
    }.</p>
        <div class="highlight">
          <p>Le crédit apparaîtra sur votre moyen de paiement dans 5 à 10 jours ouvrés.</p>
        </div>
        <p>Vous pouvez continuer d'explorer nos formations gratuites ou revenir plus tard.</p>
        <a href="${siteUrl}/formations" class="cta-button">Explorer</a>
      </div>
      <div class="footer">
        <p>FYGS Learning Platform</p>
        <p><a href="${siteUrl}/contact">Support</a></p>
      </div>
    `;
    return {
      subject: "💸 Confirmation de remboursement",
      html: createBaseTemplate(content, "Remboursement effectué"),
    };
  }

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
    const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
    const content = `
      <div class="header">
        <h1>⭐ Nouvel avis sur votre formation</h1>
        <p>Un étudiant vient d'évaluer votre cours</p>
      </div>
      <div class="content">
        <h2>Bonjour ${instructorName} !</h2>
        <p><strong>${reviewerName}</strong> vient de laisser un avis sur votre formation :</p>
        
        <div class="highlight">
          <h3>📚 ${courseTitle}</h3>
          <p class="rating" style="font-size: 24px; color: #fbbf24; margin: 10px 0;">${stars} (${rating}/5)</p>
          ${
            comment
              ? `<p style="font-style: italic; color: #6b7280; background: #f9fafb; padding: 15px; border-radius: 8px; margin: 15px 0;">"${comment}"</p>`
              : ""
          }
        </div>

        <a href="${siteUrl}/courses/${courseSlug}/reviews/${reviewId}" class="cta-button">Voir l'avis complet</a>

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
        <p><a href="${siteUrl}">fygs.dev</a> | <a href="${siteUrl}/dashboard/instructor">Tableau de bord instructeur</a></p>
      </div>
    `;

    return {
      subject: `⭐ Nouvel avis ${rating}/5 sur "${courseTitle}"`,
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
    const stars = "★".repeat(originalRating) + "☆".repeat(5 - originalRating);
    const content = `
      <div class="header">
        <h1>💬 Réponse à votre avis</h1>
        <p>L'instructeur a répondu à votre évaluation</p>
      </div>
      <div class="content">
        <h2>Bonjour ${studentName} !</h2>
        <p><strong>${instructorName}</strong> a répondu à votre avis sur :</p>
        
        <div class="highlight">
          <h3>📚 ${courseTitle}</h3>
          <p class="rating" style="font-size: 20px; color: #fbbf24; margin: 10px 0;">Votre note : ${stars} (${originalRating}/5)</p>
        </div>

        <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h4 style="color: #0ea5e9; margin-bottom: 10px;">💬 Réponse de ${instructorName} :</h4>
          <p style="font-style: italic; line-height: 1.6;">"${replyContent}"</p>
        </div>

        <a href="${siteUrl}/courses/${courseSlug}/reviews/${reviewId}" class="cta-button">Voir la conversation</a>

        <p style="margin-top: 25px;">
          Merci d'avoir partagé votre expérience ! Vos retours nous aident à améliorer constamment la qualité de nos formations.
        </p>
      </div>
      <div class="footer">
        <p>FYGS Learning Platform</p>
        <p><a href="${siteUrl}">fygs.dev</a> | <a href="${siteUrl}/courses/${courseSlug}">Retour à la formation</a></p>
      </div>
    `;

    return {
      subject: `💬 ${instructorName} a répondu à votre avis sur "${courseTitle}"`,
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
    const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
    const content = `
      <div class="header">
        <h1>🚨 Avis signalé</h1>
        <p>Intervention requise pour modération</p>
      </div>
      <div class="content">
        <h2>Bonjour ${moderatorName},</h2>
        <p>Un avis a été signalé et nécessite votre attention :</p>
        
        <div class="highlight">
          <h3>📚 Formation : ${courseTitle}</h3>
          <p><strong>Auteur de l'avis :</strong> ${reviewerName}</p>
          <p><strong>Note :</strong> ${stars} (${rating}/5)</p>
          ${
            comment
              ? `<p style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 15px 0;"><strong>Commentaire :</strong><br>"${comment}"</p>`
              : ""
          }
        </div>

        <div style="background: #fef2f2; border: 1px solid #f87171; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h4 style="color: #dc2626; margin-bottom: 10px;">🚨 Détails du signalement :</h4>
          <p><strong>Signalé par :</strong> ${reporterName}</p>
          <p><strong>Raison :</strong> ${reportReason}</p>
          ${
            reportDetails
              ? `<p><strong>Détails :</strong> ${reportDetails}</p>`
              : ""
          }
        </div>

        <a href="${siteUrl}/admin/reviews/${reviewId}" class="cta-button" style="background: #dc2626;">Modérer cet avis</a>

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
        <p><a href="${siteUrl}/admin/reviews">Centre de modération</a></p>
      </div>
    `;

    return {
      subject: `🚨 [MODÉRATION] Avis signalé sur "${courseTitle}"`,
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
    const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
    const content = `
      <div class="header">
        <h1>👍 Votre avis a été trouvé utile</h1>
        <p>D'autres étudiants apprécient votre contribution</p>
      </div>
      <div class="content">
        <h2>Félicitations ${reviewerName} !</h2>
        <p>Votre avis sur <strong>${courseTitle}</strong> vient de recevoir un nouveau vote "utile" !</p>
        
        <div class="highlight">
          <h3>📚 ${courseTitle}</h3>
          <p class="rating" style="font-size: 20px; color: #fbbf24; margin: 10px 0;">Votre note : ${stars} (${rating}/5)</p>
          <p style="font-size: 18px; color: #059669; font-weight: 600;">
            👍 ${totalHelpfulVotes} personne${
      totalHelpfulVotes > 1 ? "s ont" : " a"
    } trouvé votre avis utile
          </p>
        </div>

        <a href="${siteUrl}/courses/${courseSlug}/reviews/${reviewId}" class="cta-button">Voir votre avis</a>

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
        <p><a href="${siteUrl}">fygs.dev</a> | <a href="${siteUrl}/profile/reviews">Mes avis</a></p>
      </div>
    `;

    return {
      subject: `👍 Votre avis sur "${courseTitle}" a été trouvé utile !`,
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
        <h2>Bonjour ${instructorName} !</h2>
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
                <li><strong>${course.title}</strong> - ${
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

        <a href="${siteUrl}/dashboard/instructor/reviews" class="cta-button">Voir tous mes avis</a>

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
        <p><a href="${siteUrl}/dashboard/instructor">Tableau de bord instructeur</a></p>
      </div>
    `;

    return {
      subject: `📊 Résumé hebdomadaire : ${totalReviews} nouveaux avis (${averageRating.toFixed(
        1
      )}/5)`,
      html: createBaseTemplate(content, "Résumé des avis"),
    };
  }

  // ============ COMMUNITY NOTIFICATION TEMPLATES ============

  /**
   * Send notification when someone replies to a discussion
   */
  static discussionReply({
    authorName,
    replierName,
    discussionTitle,
    replyContent,
    discussionId,
    siteUrl = SITE_URL,
  }: {
    authorName: string;
    replierName: string;
    discussionTitle: string;
    replyContent: string;
    discussionId: string;
    siteUrl?: string;
  }) {
    const content = `
      <div class="content">
        <h2>💬 Nouvelle réponse à votre discussion</h2>
        
        <p>Bonjour <strong>${authorName}</strong>,</p>

        <p><strong>${replierName}</strong> a répondu à votre discussion "<strong>${discussionTitle}</strong>".</p>

        <div class="features-list" style="background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
          <p style="margin: 0; white-space: pre-wrap; line-height: 1.7;">${replyContent}</p>
        </div>

        <a href="${siteUrl}/community/discussions/${discussionId}" class="cta-button">Voir la discussion</a>

        <p style="margin-top: 25px; color: #6b7280; font-size: 14px;">
          Continuez la conversation et engagez-vous avec la communauté ! 🚀
        </p>
      </div>
      <div class="footer">
        <p>FYGS Learning Platform - Communauté</p>
        <p><a href="${siteUrl}/community">Explorer la communauté</a></p>
      </div>
    `;

    return {
      subject: `💬 ${replierName} a répondu à votre discussion`,
      html: createBaseTemplate(content, "Nouvelle réponse"),
    };
  }

  /**
   * Send notification when someone follows you
   */
  static newFollower({
    recipientName,
    followerName,
    followerAvatar,
    followerId,
    siteUrl = SITE_URL,
  }: {
    recipientName: string;
    followerName: string;
    followerAvatar?: string | null;
    followerId: string;
    siteUrl?: string;
  }) {
    const content = `
      <div class="content">
        <h2>👥 Nouveau follower !</h2>
        
        <p>Bonjour <strong>${recipientName}</strong>,</p>

        <p><strong>${followerName}</strong> vous suit maintenant dans la communauté FYGS !</p>

        ${
          followerAvatar
            ? `
          <div style="text-align: center; margin: 25px 0;">
            <img src="${followerAvatar}" alt="${followerName}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid #667eea;" />
          </div>
        `
            : ""
        }

        <div class="features-list">
          <h4>Pourquoi suivre des membres ?</h4>
          <ul>
            <li>Restez informé de leurs nouvelles discussions</li>
            <li>Découvrez leurs réponses utiles</li>
            <li>Construisez votre réseau d'apprentissage</li>
          </ul>
        </div>

        <a href="${siteUrl}/community/users/${followerId}" class="cta-button">Voir le profil</a>

        <p style="margin-top: 25px; color: #6b7280; font-size: 14px;">
          Votre réseau grandit ! Continuez à partager vos connaissances. 🌟
        </p>
      </div>
      <div class="footer">
        <p>FYGS Learning Platform - Communauté</p>
        <p><a href="${siteUrl}/community/following">Gérer mes abonnements</a></p>
      </div>
    `;

    return {
      subject: `👥 ${followerName} vous suit maintenant`,
      html: createBaseTemplate(content, "Nouveau follower"),
    };
  }

  /**
   * Send notification for mentor request
   */
  static mentorRequest({
    mentorName,
    studentName,
    message,
    siteUrl = SITE_URL,
  }: {
    mentorName: string;
    studentName: string;
    message?: string | null;
    courseId?: string | null;
    requestId: string;
    siteUrl?: string;
  }) {
    const content = `
      <div class="content">
        <h2>🎓 Nouvelle demande de mentorat</h2>
        
        <p>Bonjour <strong>${mentorName}</strong>,</p>

        <p><strong>${studentName}</strong> souhaite bénéficier de votre expertise et vous a envoyé une demande de mentorat.</p>

        ${
          message
            ? `
          <div class="features-list" style="background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
            <h4>Message :</h4>
            <p style="margin: 10px 0 0 0; white-space: pre-wrap; line-height: 1.7;">${message}</p>
          </div>
        `
            : ""
        }

        <div class="features-list">
          <h4>💡 Avantages du mentorat :</h4>
          <ul>
            <li>Partagez votre expérience et expertise</li>
            <li>Guidez un apprenant dans son parcours</li>
            <li>Renforcez votre réputation dans la communauté</li>
            <li>Gagnez des points communautaires</li>
          </ul>
        </div>

        <a href="${siteUrl}/community/mentorship" class="cta-button">Voir la demande</a>

        <p style="margin-top: 25px; color: #6b7280; font-size: 14px;">
          Votre expertise peut faire la différence ! 🌟
        </p>
      </div>
      <div class="footer">
        <p>FYGS Learning Platform - Mentorat</p>
        <p><a href="${siteUrl}/community/mentorship">Gérer mes demandes</a></p>
      </div>
    `;

    return {
      subject: `🎓 ${studentName} demande votre mentorat`,
      html: createBaseTemplate(content, "Demande de mentorat"),
    };
  }

  /**
   * Send notification when mentor responds to request
   */
  static mentorResponse({
    studentName,
    mentorName,
    action,
    siteUrl = SITE_URL,
  }: {
    studentName: string;
    mentorName: string;
    action: "accept" | "decline";
    siteUrl?: string;
  }) {
    const isAccepted = action === "accept";

    const content = `
      <div class="content">
        <h2>${
          isAccepted
            ? "✅ Demande de mentorat acceptée !"
            : "📌 Réponse à votre demande de mentorat"
        }</h2>
        
        <p>Bonjour <strong>${studentName}</strong>,</p>

        <p><strong>${mentorName}</strong> a ${
      isAccepted ? "accepté" : "décliné"
    } votre demande de mentorat.</p>

        ${
          isAccepted
            ? `
          <div class="features-list" style="background: #ecfdf5; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
            <h4>🎉 Félicitations !</h4>
            <p style="margin: 10px 0 0 0;">Vous pouvez maintenant échanger avec votre mentor et bénéficier de son expertise pour progresser dans votre apprentissage.</p>
          </div>

          <div class="features-list">
            <h4>💡 Prochaines étapes :</h4>
            <ul>
              <li>Présentez vos objectifs d'apprentissage</li>
              <li>Planifiez vos sessions de mentorat</li>
              <li>Posez vos questions et demandez des conseils</li>
              <li>Partagez vos progrès régulièrement</li>
            </ul>
          </div>
        `
            : `
          <div class="features-list" style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
            <p style="margin: 0;">Ne vous découragez pas ! De nombreux mentors sont disponibles dans la communauté.</p>
          </div>

          <div class="features-list">
            <h4>💡 Alternatives :</h4>
            <ul>
              <li>Trouvez d'autres mentors dans votre domaine</li>
              <li>Participez aux discussions de la communauté</li>
              <li>Consultez nos formations premium</li>
              <li>Rejoignez des groupes d'étude</li>
            </ul>
          </div>
        `
        }

        <a href="${siteUrl}/community/mentorship" class="cta-button">${
      isAccepted ? "Contacter mon mentor" : "Trouver d'autres mentors"
    }</a>

        <p style="margin-top: 25px; color: #6b7280; font-size: 14px;">
          ${
            isAccepted
              ? "Profitez pleinement de cette opportunité d'apprentissage ! 🚀"
              : "Continuez votre parcours d'apprentissage avec la communauté ! 💪"
          }
        </p>
      </div>
      <div class="footer">
        <p>FYGS Learning Platform - Mentorat</p>
        <p><a href="${siteUrl}/community">Explorer la communauté</a></p>
      </div>
    `;

    return {
      subject: isAccepted
        ? `✅ ${mentorName} a accepté votre demande de mentorat`
        : `📌 ${mentorName} a répondu à votre demande`,
      html: createBaseTemplate(content, "Réponse de mentorat"),
    };
  }

  /**
   * Send notification when user earns a badge
   */
  static badgeEarned({
    userName,
    badgeName,
    badgeDescription,
    badgeIcon,
    points,
    siteUrl = SITE_URL,
  }: {
    userName: string;
    badgeName: string;
    badgeDescription: string;
    badgeIcon: string;
    points: number;
    siteUrl?: string;
  }) {
    const content = `
      <div class="content">
        <h2>🏆 Nouveau badge débloqué !</h2>
        
        <p>Bonjour <strong>${userName}</strong>,</p>

        <p>Félicitations ! Vous venez de débloquer le badge <strong>${badgeName}</strong> ! 🎉</p>

        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 16px; box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);">
            <div style="font-size: 64px; margin-bottom: 10px;">${badgeIcon}</div>
            <h3 style="color: white; margin: 10px 0;">${badgeName}</h3>
            <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 14px;">+${points} points</p>
          </div>
        </div>

        <div class="features-list" style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; text-align: center; font-style: italic; color: #6b7280;">"${badgeDescription}"</p>
        </div>

        <div class="features-list">
          <h4>🎯 Vos accomplissements :</h4>
          <ul>
            <li>Badge ${badgeName} débloqué</li>
            <li>+${points} points communautaires gagnés</li>
            <li>Votre réputation augmente dans la communauté</li>
          </ul>
        </div>

        <a href="${siteUrl}/community/users/${userName}" class="cta-button">Voir mon profil</a>

        <p style="margin-top: 25px; color: #6b7280; font-size: 14px;">
          Continuez comme ça ! D'autres badges vous attendent. 🚀
        </p>
      </div>
      <div class="footer">
        <p>FYGS Learning Platform - Badges</p>
        <p><a href="${siteUrl}/community">Explorer la communauté</a></p>
      </div>
    `;

    return {
      subject: `🏆 Badge débloqué : ${badgeName} (+${points} points)`,
      html: createBaseTemplate(content, "Nouveau badge"),
    };
  }

  /**
   * Send weekly digest of community activity
   */
  static communityWeeklyDigest({
    userName,
    weeklyStats,
    topDiscussions,
    newBadges,
    siteUrl = SITE_URL,
  }: {
    userName: string;
    weeklyStats: {
      totalDiscussions: number;
      totalReplies: number;
      pointsEarned: number;
      newFollowers: number;
    };
    topDiscussions: Array<{
      id: string;
      title: string;
      replyCount: number;
    }>;
    newBadges: Array<{
      name: string;
      icon: string;
    }>;
    siteUrl?: string;
  }) {
    const { totalDiscussions, totalReplies, pointsEarned, newFollowers } =
      weeklyStats;

    const content = `
      <div class="content">
        <h2>📊 Votre semaine dans la communauté</h2>
        
        <p>Bonjour <strong>${userName}</strong>,</p>

        <p>Voici un résumé de votre activité cette semaine dans la communauté FYGS :</p>

        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 25px 0;">
          <div style="background: #eff6ff; padding: 20px; border-radius: 12px; text-align: center; border: 2px solid #3b82f6;">
            <div style="font-size: 32px; font-weight: bold; color: #3b82f6;">${totalDiscussions}</div>
            <div style="color: #6b7280; font-size: 14px;">Discussions créées</div>
          </div>
          <div style="background: #f0fdf4; padding: 20px; border-radius: 12px; text-align: center; border: 2px solid #10b981;">
            <div style="font-size: 32px; font-weight: bold; color: #10b981;">${totalReplies}</div>
            <div style="color: #6b7280; font-size: 14px;">Réponses postées</div>
          </div>
          <div style="background: #fef3c7; padding: 20px; border-radius: 12px; text-align: center; border: 2px solid #f59e0b;">
            <div style="font-size: 32px; font-weight: bold; color: #f59e0b;">${pointsEarned}</div>
            <div style="color: #6b7280; font-size: 14px;">Points gagnés</div>
          </div>
          <div style="background: #fce7f3; padding: 20px; border-radius: 12px; text-align: center; border: 2px solid #ec4899;">
            <div style="font-size: 32px; font-weight: bold; color: #ec4899;">${newFollowers}</div>
            <div style="color: #6b7280; font-size: 14px;">Nouveaux followers</div>
          </div>
        </div>

        ${
          newBadges.length > 0
            ? `
          <div class="features-list" style="background: linear-gradient(135deg, #667eea20 0%, #764ba220 100%); border: 2px solid #667eea; padding: 20px; border-radius: 12px; margin: 25px 0;">
            <h4>🏆 Nouveaux badges débloqués :</h4>
            <div style="display: flex; gap: 15px; justify-content: center; margin-top: 15px;">
              ${newBadges
                .map(
                  (badge) => `
                <div style="text-align: center;">
                  <div style="font-size: 48px;">${badge.icon}</div>
                  <div style="font-size: 12px; color: #6b7280;">${badge.name}</div>
                </div>
              `
                )
                .join("")}
            </div>
          </div>
        `
            : ""
        }

        ${
          topDiscussions.length > 0
            ? `
          <div class="features-list">
            <h4>🔥 Discussions populaires cette semaine :</h4>
            <ul>
              ${topDiscussions
                .map(
                  (discussion) => `
                <li><a href="${siteUrl}/community/discussions/${discussion.id}" style="color: #667eea; text-decoration: none;"><strong>${discussion.title}</strong></a> - ${discussion.replyCount} réponses</li>
              `
                )
                .join("")}
            </ul>
          </div>
        `
            : ""
        }

        <a href="${siteUrl}/community" class="cta-button">Explorer la communauté</a>

        <p style="margin-top: 25px; color: #6b7280; font-size: 14px;">
          ${
            pointsEarned > 50
              ? "Excellente semaine ! Vous êtes très actif dans la communauté. 🌟"
              : pointsEarned > 20
              ? "Belle activité ! Continuez à partager vos connaissances. 👏"
              : "N'hésitez pas à participer davantage aux discussions ! 💪"
          }
        </p>
      </div>
      <div class="footer">
        <p>FYGS Learning Platform - Communauté</p>
        <p><a href="${siteUrl}/community/notifications">Gérer mes notifications</a></p>
      </div>
    `;

    return {
      subject: `📊 Votre semaine communautaire : ${pointsEarned} points gagnés`,
      html: createBaseTemplate(content, "Résumé hebdomadaire"),
    };
  }
}
