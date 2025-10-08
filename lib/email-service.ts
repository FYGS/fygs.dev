import { SITE_BASE_URL } from "@/app/_lib/constants";
import nodemailer from "nodemailer";

export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

export interface EmailTemplate {
    subject: string;
    html: string;
    text?: string;
}

export interface ContactFormData {
    name: string;
    email: string;
    subject: string;
    message: string;
    type?: 'recruitment' | 'collaboration' | 'training' | 'general';
    company?: string;
    position?: string;
}

export interface CourseData {
    title: string;
    slug: string;
    price?: number;
}

export interface SubscriptionData {
    planName: string;
    price: number;
    features: string[];
}

// Import modern templates
import { ModernEmailTemplates } from './email-templates';

class EmailService {
    private static instance: EmailService;
    private transporter: nodemailer.Transporter | null = null;

    static getInstance(): EmailService {
        if (!EmailService.instance) {
            EmailService.instance = new EmailService();
        }
        return EmailService.instance;
    }

    private getTransporter() {
        if (!this.transporter) {
            this.transporter = nodemailer.createTransport({
                host: process.env.EMAIL_SERVER_HOST,
                port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
                secure: process.env.EMAIL_SERVER_PORT === "465",
                auth: {
                    user: process.env.EMAIL_SERVER_USER,
                    pass: process.env.EMAIL_SERVER_PASSWORD,
                },
            });
        }
        return this.transporter;
    }

    async sendEmail({ to, subject, html, text }: EmailOptions): Promise<boolean> {
        try {
            const transporter = this.getTransporter();

            if (!transporter) {
                throw new Error("Email transporter not configured");
            }

            await transporter.sendMail({
                from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
                to,
                subject,
                html,
                text: text || html.replace(/<[^>]*>/g, ""), // Strip HTML for text version
            });

            return true;
        } catch (error) {
            console.error("Email sending failed:", error);
            return false;
        }
    }

    // Email Templates
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
        const subject = "Réinitialisation de votre mot de passe - FYGS Learning Platform";
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

    enrollmentConfirmationEmail(name: string, formationTitle: string, formationUrl: string): EmailTemplate {
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

    certificateEarnedEmail(name: string, formationTitle: string, formationUrl: string): EmailTemplate {
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

    // Contact Form Templates - Intelligent templates based on contact type
    contactFormAdminEmail(data: ContactFormData): EmailTemplate {
        const { name, email, subject, message, type = 'general', company, position } = data;
        
        const getTypeIcon = (type: string) => {
            switch (type) {
                case 'recruitment': return '💼';
                case 'collaboration': return '🤝';
                case 'training': return '📚';
                default: return '📧';
            }
        };

        const getTypeLabel = (type: string) => {
            switch (type) {
                case 'recruitment': return 'Opportunité de Recrutement';
                case 'collaboration': return 'Proposition de Collaboration';
                case 'training': return 'Demande de Formation';
                default: return 'Contact Général';
            }
        };

        const getTypeColor = (type: string) => {
            switch (type) {
                case 'recruitment': return '#10b981';
                case 'collaboration': return '#3b82f6';
                case 'training': return '#8b5cf6';
                default: return '#6b7280';
            }
        };

        const adminSubject = `${getTypeIcon(type)} [FYGS.dev] ${getTypeLabel(type)} - ${subject}`;
        
        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${adminSubject}</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f9fafb; }
                .container { max-width: 700px; margin: 0 auto; background: white; }
                .header { background: linear-gradient(135deg, ${getTypeColor(type)} 0%, ${getTypeColor(type)}dd 100%); color: white; padding: 40px 30px; text-align: center; }
                .content { padding: 40px 30px; }
                .contact-info { background: #f8fafc; border-left: 4px solid ${getTypeColor(type)}; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0; }
                .message-box { background: #ffffff; border: 1px solid #e5e7eb; padding: 25px; margin: 25px 0; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
                .priority-badge { display: inline-block; background: ${getTypeColor(type)}; color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
                .footer { background: #f8fafc; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; }
                .quick-actions { display: flex; gap: 15px; margin: 25px 0; flex-wrap: wrap; }
                .action-btn { display: inline-block; padding: 12px 20px; background: ${getTypeColor(type)}; color: white; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 14px; }
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
                        <span class="priority-badge">${getTypeLabel(type)}</span>
                    </div>

                    <div class="contact-info">
                        <h3 style="margin: 0 0 15px 0; color: #1f2937;">📋 Informations du contact</h3>
                        <div class="metadata">
                            <div class="metadata-item">
                                <div class="metadata-label">Nom</div>
                                <div class="metadata-value">${name}</div>
                            </div>
                            <div class="metadata-item">
                                <div class="metadata-label">Email</div>
                                <div class="metadata-value"><a href="mailto:${email}" style="color: ${getTypeColor(type)};">${email}</a></div>
                            </div>
                            ${company ? `
                            <div class="metadata-item">
                                <div class="metadata-label">Entreprise</div>
                                <div class="metadata-value">${company}</div>
                            </div>
                            ` : ''}
                            ${position ? `
                            <div class="metadata-item">
                                <div class="metadata-label">Poste</div>
                                <div class="metadata-value">${position}</div>
                            </div>
                            ` : ''}
                        </div>
                    </div>

                    <div class="message-box">
                        <h3 style="margin: 0 0 15px 0; color: #1f2937;">💬 Sujet: ${subject}</h3>
                        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid ${getTypeColor(type)};">
                            <p style="margin: 0; white-space: pre-wrap; line-height: 1.7;">${message}</p>
                        </div>
                    </div>

                    <div class="quick-actions">
                        <a href="mailto:${email}?subject=Re: ${subject}" class="action-btn">
                            📧 Répondre par email
                        </a>
                        ${type === 'recruitment' ? `
                        <a href="mailto:${email}?subject=Re: ${subject}&body=Bonjour ${name},%0D%0A%0D%0AMerci pour votre intérêt concernant mes services. Je serais ravi de discuter de cette opportunité avec vous.%0D%0A%0D%0APouvons-nous planifier un appel cette semaine ?%0D%0A%0D%0ACordialement,%0D%0AFernand" class="action-btn">
                            💼 Réponse recrutement
                        </a>
                        ` : ''}
                        ${type === 'collaboration' ? `
                        <a href="mailto:${email}?subject=Re: ${subject}&body=Bonjour ${name},%0D%0A%0D%0AMerci pour votre proposition de collaboration. Votre projet m'intéresse.%0D%0A%0D%0APouvons-nous organiser une visioconférence pour en discuter plus en détail ?%0D%0A%0D%0ACordialement,%0D%0AFernand" class="action-btn">
                            🤝 Réponse collaboration
                        </a>
                        ` : ''}
                        ${type === 'training' ? `
                        <a href="mailto:${email}?subject=Re: ${subject}&body=Bonjour ${name},%0D%0A%0D%0AMerci pour votre intérêt pour nos formations. Je serais ravi de vous accompagner dans votre apprentissage.%0D%0A%0D%0AConsultez notre catalogue: ${SITE_BASE_URL}/formations%0D%0A%0D%0ACordialement,%0D%0AFernand" class="action-btn">
                            📚 Réponse formation
                        </a>
                        ` : ''}
                    </div>
                </div>

                <div class="footer">
                    <p style="margin: 0 0 10px 0;">
                        <strong>FYGS Learning Platform</strong> - Plateforme d'apprentissage premium
                    </p>
                    <p style="margin: 0; font-size: 12px;">
                        Message reçu le ${new Date().toLocaleDateString('fr-FR', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </p>
                </div>
            </div>
        </body>
        </html>
        `;

        return { subject: adminSubject, html };
    }

    contactFormUserConfirmation(data: ContactFormData): EmailTemplate {
        const { name, type = 'general' } = data;
        
        const getTypeResponse = (type: string) => {
            switch (type) {
                case 'recruitment':
                    return {
                        title: '💼 Opportunité de Recrutement Reçue',
                        message: 'Merci pour votre intérêt concernant mes services de développement. Je reviendrai vers vous rapidement pour discuter de cette opportunité.',
                        nextSteps: [
                            'Analyse de votre demande et du profil recherché',
                            'Évaluation de la compatibilité avec mes disponibilités',
                            'Retour sous 24-48h avec une proposition de rendez-vous'
                        ],
                        cta: 'Voir mon profil',
                        ctaUrl: `${SITE_BASE_URL}/resume`
                    };
                case 'collaboration':
                    return {
                        title: '🤝 Proposition de Collaboration Reçue',
                        message: 'Votre projet m\'intéresse ! Je vais étudier votre proposition et vous contacter pour organiser une discussion approfondie.',
                        nextSteps: [
                            'Analyse détaillée de votre projet',
                            'Évaluation de la faisabilité technique',
                            'Proposition de collaboration personnalisée'
                        ],
                        cta: 'Découvrir mes projets',
                        ctaUrl: `${SITE_BASE_URL}/projects`
                    };
                case 'training':
                    return {
                        title: '📚 Demande de Formation Reçue',
                        message: 'Merci pour votre intérêt pour nos formations ! Je vais vous contacter pour comprendre vos besoins spécifiques et vous proposer un parcours adapté.',
                        nextSteps: [
                            'Analyse de vos objectifs d\'apprentissage',
                            'Recommandation de formations personnalisées',
                            'Proposition de suivi et d\'accompagnement'
                        ],
                        cta: 'Explorer les formations',
                        ctaUrl: `${SITE_BASE_URL}/formations`
                    };
                default:
                    return {
                        title: '📧 Message Reçu avec Succès',
                        message: 'Merci de m\'avoir contacté ! Je reviendrai vers vous dans les plus brefs délais.',
                        nextSteps: [
                            'Analyse de votre demande',
                            'Préparation d\'une réponse personnalisée',
                            'Retour sous 24-48h maximum'
                        ],
                        cta: 'Découvrir FYGS.dev',
                        ctaUrl: SITE_BASE_URL
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
            <title>${subject}</title>
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
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">Merci ${name} pour votre confiance</p>
                </div>
                
                <div class="content">
                    <div class="success-badge">
                        ${response.title}
                    </div>

                    <p style="font-size: 16px; line-height: 1.7; margin-bottom: 25px;">
                        Bonjour <strong>${name}</strong>,
                    </p>

                    <p style="font-size: 16px; line-height: 1.7; margin-bottom: 25px;">
                        ${response.message}
                    </p>

                    <div class="next-steps">
                        <h3 style="margin: 0 0 20px 0; color: #0ea5e9;">🚀 Prochaines étapes</h3>
                        ${response.nextSteps.map((step, index) => `
                            <div class="step">
                                <div class="step-number">${index + 1}</div>
                                <div>${step}</div>
                            </div>
                        `).join('')}
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

    // Modern email templates methods
    async sendWelcomeEmail(userName: string, userEmail: string): Promise<boolean> {
        const template = ModernEmailTemplates.welcomeRegistration({ userName });
        return this.sendEmail({
            to: userEmail,
            subject: template.subject,
            html: template.html
        });
    }

    async sendCoursePurchaseEmail(userName: string, userEmail: string, courseTitle: string, courseSlug: string, coursePrice?: number): Promise<boolean> {
        const template = ModernEmailTemplates.coursePurchase({
            userName,
            courseTitle,
            courseSlug,
            coursePrice
        });
        return this.sendEmail({
            to: userEmail,
            subject: template.subject,
            html: template.html
        });
    }

    async sendPremiumSubscriptionEmail(userName: string, userEmail: string, planName: string, price: number, billingPeriod: 'monthly' | 'yearly'): Promise<boolean> {
        const template = ModernEmailTemplates.premiumSubscription({
            userName,
            planName,
            price,
            billingPeriod
        });
        return this.sendEmail({
            to: userEmail,
            subject: template.subject,
            html: template.html
        });
    }

    async sendSubscriptionUpdatedEmail(userName: string, userEmail: string, planName: string, price: number, billingPeriod: 'monthly' | 'yearly', nextBillingDate: string): Promise<boolean> {
        const template = ModernEmailTemplates.subscriptionUpdated({
            userName,
            planName,
            price,
            billingPeriod,
            nextBillingDate
        });
        return this.sendEmail({
            to: userEmail,
            subject: template.subject,
            html: template.html
        });
    }

    async sendPasswordChangedEmail(userName: string, userEmail: string, changeDate: string, ipAddress?: string): Promise<boolean> {
        const template = ModernEmailTemplates.passwordChanged({
            userName,
            changeDate,
            ipAddress
        });
        return this.sendEmail({
            to: userEmail,
            subject: template.subject,
            html: template.html
        });
    }

    async sendPaymentFailedEmail(userName: string, userEmail: string): Promise<boolean> {
        const template = ModernEmailTemplates.paymentFailed({ userName });
        return this.sendEmail({
            to: userEmail,
            subject: template.subject,
            html: template.html
        });
    }

    async sendSubscriptionCanceledEmail(userName: string, userEmail: string): Promise<boolean> {
        const template = ModernEmailTemplates.subscriptionCanceled({ userName });
        return this.sendEmail({
            to: userEmail,
            subject: template.subject,
            html: template.html
        });
    }

    async sendSubscriptionCanceledImmediateEmail(userName: string, userEmail: string): Promise<boolean> {
        const template = ModernEmailTemplates.subscriptionCanceledImmediate({ userName });
        return this.sendEmail({
            to: userEmail,
            subject: template.subject,
            html: template.html
        });
    }

    async sendSubscriptionPlanSwitchedEmail(userName: string, userEmail: string, planName: string, price: number, billingPeriod: 'monthly' | 'yearly', nextBillingDate?: string): Promise<boolean> {
        const template = ModernEmailTemplates.subscriptionPlanSwitched({
            userName,
            planName,
            price,
            billingPeriod,
            nextBillingDate
        });
        return this.sendEmail({
            to: userEmail,
            subject: template.subject,
            html: template.html
        });
    }

    async sendRefundIssuedEmail(userName: string, userEmail: string, courseTitle?: string, amount?: number): Promise<boolean> {
        const template = ModernEmailTemplates.refundIssued({ userName, courseTitle, amount });
        return this.sendEmail({
            to: userEmail,
            subject: template.subject,
            html: template.html
        });
    }

    // Convenience method to send contact form emails
    async sendContactFormEmails(data: ContactFormData): Promise<{ adminSent: boolean; userSent: boolean }> {
        const adminTemplate = this.contactFormAdminEmail(data);
        const userTemplate = this.contactFormUserConfirmation(data);

        const [adminSent, userSent] = await Promise.all([
            this.sendEmail({
                to: process.env.CONTACT_EMAIL || process.env.EMAIL_SERVER_USER || 'contact@fygs.dev',
                subject: adminTemplate.subject,
                html: adminTemplate.html
            }),
            this.sendEmail({
                to: data.email,
                subject: userTemplate.subject,
                html: userTemplate.html
            })
        ]);

        return { adminSent, userSent };
    }
}

export const emailService = EmailService.getInstance();
