import { SITE_BASE_URL } from "@/app/_lib/constants";

import type { EmailTemplate } from "./types";

/** Account emails (verification, password reset, welcome). */
export class AuthEmailTemplates {
  emailVerification(name: string, verificationUrl: string): EmailTemplate {
    const subject = "Vérifiez votre email - FYGS Learning Platform";
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚀 Bienvenue sur FYGS Learning Platform</h1>
            </div>
            <div class="content">
              <h2>Salut ${name} !</h2>
              <p>Merci de vous être inscrit sur notre plateforme d'apprentissage premium. Pour commencer votre parcours d'apprentissage, veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous :</p>
              
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Vérifier mon email</a>
              </div>
              
              <p>Ce lien expirera dans 24 heures pour des raisons de sécurité.</p>
              
              <p>Si vous n'avez pas créé de compte, vous pouvez ignorer cet email en toute sécurité.</p>
              
              <p>À bientôt sur la plateforme !<br>L'équipe FYGS</p>
            </div>
            <div class="footer">
              <p>© 2025 FYGS Learning Platform. Tous droits réservés.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return { subject, html };
  }

  passwordReset(name: string, resetUrl: string): EmailTemplate {
    const subject =
      "Réinitialisation de votre mot de passe - FYGS Learning Platform";
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #f5576c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Réinitialisation de mot de passe</h1>
            </div>
            <div class="content">
              <h2>Salut ${name} !</h2>
              <p>Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte FYGS Learning Platform.</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
              </div>
              
              <div class="warning">
                <strong>⚠️ Important :</strong> Ce lien expirera dans 1 heure pour des raisons de sécurité.
              </div>
              
              <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité. Votre mot de passe actuel restera inchangé.</p>
              
              <p>Besoin d'aide ? Contactez notre support à support@fygs.dev</p>
              
              <p>L'équipe FYGS</p>
            </div>
            <div class="footer">
              <p>© 2025 FYGS Learning Platform. Tous droits réservés.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return { subject, html };
  }

  welcomeEmail(name: string): EmailTemplate {
    const subject = "🎉 Bienvenue sur FYGS Learning Platform !";
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .feature { background: white; padding: 20px; margin: 15px 0; border-radius: 6px; border-left: 4px solid #667eea; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚀 Bienvenue ${name} !</h1>
              <p>Votre parcours d'apprentissage commence maintenant</p>
            </div>
            <div class="content">
              <p>Félicitations ! Votre compte FYGS Learning Platform est maintenant actif. Vous avez accès à notre plateforme d'apprentissage premium avec :</p>
              
              <div class="feature">
                <h3>📚 Formations Premium</h3>
                <p>JavaScript, TypeScript, React, Next.js, Node.js, IA et Cloud</p>
              </div>
              
              <div class="feature">
                <h3>🎯 Parcours Personnalisés</h3>
                <p>Suivez votre progression et obtenez des certificats</p>
              </div>
              
              <div class="feature">
                <h3>💬 Communauté Active</h3>
                <p>Échangez avec d'autres développeurs passionnés</p>
              </div>
              
              <div style="text-align: center;">
                <a href="${SITE_BASE_URL}/dashboard" class="button">Accéder à mon dashboard</a>
              </div>
              
              <p>Prêt à commencer ? Explorez nos formations et lancez-vous dans votre premier cours !</p>
              
              <p>Bonne formation !<br>L'équipe FYGS</p>
            </div>
            <div class="footer">
              <p>© 2025 FYGS Learning Platform. Tous droits réservés.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return { subject, html };
  }

  enrollmentConfirmationEmail(
    name: string,
    formationTitle: string,
    formationUrl: string
  ): EmailTemplate {
    const subject = `Inscription confirmée: ${formationTitle}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Inscription confirmée!</h1>
        <p>Bonjour ${name},</p>
        <p>Votre inscription à la formation <strong>${formationTitle}</strong> a été confirmée.</p>
        <p>Vous pouvez maintenant commencer votre apprentissage:</p>
        <a href="${formationUrl}" 
           style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
          Accéder à la formation
        </a>
        <p>Bon apprentissage!</p>
        <p>L'équipe FYGS</p>
      </div>
    `;

    return { subject, html };
  }

  certificateEarnedEmail(
    name: string,
    formationTitle: string,
    formationUrl: string
  ): EmailTemplate {
    const subject = `Félicitations! Certificat obtenu pour ${formationTitle}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #16a34a;">🎉 Félicitations ${name}!</h1>
        <p>Vous avez terminé avec succès la formation <strong>${formationTitle}</strong>.</p>
        <p>Votre certificat de completion est maintenant disponible dans votre tableau de bord.</p>
        <a href="${formationUrl}" 
           style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
          Télécharger mon certificat
        </a>
        <p>Continuez votre apprentissage avec nos autres formations! <a href="${SITE_BASE_URL}/formations">Découvrir les formations</a></p>
        <p>L'équipe FYGS</p>
      </div>
    `;

    return { subject, html };
  }
}

export const authEmailTemplates = new AuthEmailTemplates();
