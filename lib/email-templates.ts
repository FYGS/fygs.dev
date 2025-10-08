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
  billingPeriod: 'monthly' | 'yearly';
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
  static welcomeRegistration({ userName, siteUrl = SITE_URL }: EmailTemplateProps) {
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
  static coursePurchase({ userName, courseTitle, courseSlug, coursePrice, siteUrl = SITE_URL }: CourseTemplateProps) {
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

        ${coursePrice ? `<p><strong>Prix payé :</strong> ${coursePrice}€</p>` : ''}
        
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
  static premiumSubscription({ userName, planName, price, billingPeriod, siteUrl = SITE_URL }: SubscriptionTemplateProps) {
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

        <p><strong>Votre abonnement :</strong> ${price}€/${billingPeriod === 'monthly' ? 'mois' : 'an'}</p>
        
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
  static subscriptionUpdated({ userName, planName, price, billingPeriod, nextBillingDate, siteUrl = SITE_URL }: SubscriptionTemplateProps) {
    const content = `
      <div class="header">
        <h1>📋 Abonnement mis à jour</h1>
        <p>Vos modifications ont été enregistrées</p>
      </div>
      <div class="content">
        <h2>Bonjour ${userName},</h2>
        <p>Votre abonnement <strong>${planName}</strong> a été mis à jour avec succès.</p>
        
        <div class="highlight">
          <p><strong>Nouvel abonnement :</strong> ${price}€/${billingPeriod === 'monthly' ? 'mois' : 'an'}</p>
          ${nextBillingDate ? `<p><strong>Prochaine facturation :</strong> ${nextBillingDate}</p>` : ''}
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
  static passwordChanged({ userName, changeDate, ipAddress, siteUrl = SITE_URL }: PasswordChangeTemplateProps) {
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
          ${ipAddress ? `<p><strong>Adresse IP :</strong> ${ipAddress}</p>` : ''}
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
  static subscriptionCanceled({ userName, siteUrl = SITE_URL }: EmailTemplateProps) {
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
  static subscriptionCanceledImmediate({ userName, siteUrl = SITE_URL }: EmailTemplateProps) {
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
    return { subject: "❌ Résiliation immédiate de votre abonnement", html: createBaseTemplate(content, "Abonnement résilié") };
  }

  // Email de changement de formule (switch monthly/yearly)
  static subscriptionPlanSwitched({ userName, planName, price, billingPeriod, nextBillingDate, siteUrl = SITE_URL }: SubscriptionTemplateProps) {
    const content = `
      <div class="header" style="background: linear-gradient(135deg,#6366f1 0%,#7c3aed 100%);">
        <h1>🔄 Changement d'abonnement</h1>
        <p>Votre nouvelle formule est en place</p>
      </div>
      <div class="content">
        <h2>Bonjour ${userName},</h2>
        <p>Votre abonnement a été basculé vers la formule <strong>${planName}</strong> (${price}€ / ${billingPeriod === 'monthly' ? 'mois' : 'an'}).</p>
        <div class="highlight">
          <p><strong>Détails :</strong></p>
          ${nextBillingDate ? `<p>Nouvelle prochaine facturation : <strong>${nextBillingDate}</strong></p>` : ''}
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
    return { subject: "🔄 Votre abonnement a été modifié", html: createBaseTemplate(content, "Abonnement modifié") };
  }

  // Email de remboursement
  static refundIssued({ userName, courseTitle, amount, siteUrl = SITE_URL }: { userName: string; courseTitle?: string; amount?: number; siteUrl?: string }) {
    const content = `
      <div class="header" style="background: linear-gradient(135deg,#0ea5e9 0%,#0369a1 100%);">
        <h1>💸 Remboursement effectué</h1>
        <p>Votre demande a été traitée</p>
      </div>
      <div class="content">
        <h2>Bonjour ${userName},</h2>
        <p>Votre remboursement ${amount ? `de <strong>${amount}€</strong>` : ''} a été traité avec succès${courseTitle ? ` pour la formation <strong>${courseTitle}</strong>` : ''}.</p>
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
    return { subject: "💸 Confirmation de remboursement", html: createBaseTemplate(content, "Remboursement effectué") };
  }
}