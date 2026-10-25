import { authEmailTemplates } from "./auth-templates";
import { CommunityEmailSenders } from "./community-senders";
import { contactEmailTemplates } from "./contact-templates";
import type { ContactFormData, EmailTemplate } from "./types";

export type {
  ContactFormData,
  CourseData,
  EmailOptions,
  EmailTemplate,
  SubscriptionData,
} from "./types";

/**
 * Email service singleton. The behaviour is layered through a class chain
 * (transport -> transactional -> review -> community senders) so that every
 * sender keeps its original `this.sendEmail` call and a single instance.
 */
class EmailService extends CommunityEmailSenders {
  private static instance: EmailService;

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }


  // Email Templates (pure builders, implemented in dedicated modules)
  emailVerification(name: string, verificationUrl: string): EmailTemplate {
    return authEmailTemplates.emailVerification(name, verificationUrl);
  }

  passwordReset(name: string, resetUrl: string): EmailTemplate {
    return authEmailTemplates.passwordReset(name, resetUrl);
  }

  welcomeEmail(name: string): EmailTemplate {
    return authEmailTemplates.welcomeEmail(name);
  }

  enrollmentConfirmationEmail(
    name: string,
    formationTitle: string,
    formationUrl: string
  ): EmailTemplate {
    return authEmailTemplates.enrollmentConfirmationEmail(
      name,
      formationTitle,
      formationUrl
    );
  }

  certificateEarnedEmail(
    name: string,
    title: string,
    certificateUrl: string,
    kind: "course" | "path" = "course",
  ): EmailTemplate {
    return authEmailTemplates.certificateEarnedEmail(name, title, certificateUrl, kind);
  }

  contactFormAdminEmail(data: ContactFormData): EmailTemplate {
    return contactEmailTemplates.contactFormAdminEmail(data);
  }

  contactFormUserConfirmation(data: ContactFormData): EmailTemplate {
    return contactEmailTemplates.contactFormUserConfirmation(data);
  }

  // Convenience method to send contact form emails
  async sendContactFormEmails(
    data: ContactFormData
  ): Promise<{ adminSent: boolean; userSent: boolean }> {
    const adminTemplate = this.contactFormAdminEmail(data);
    const userTemplate = this.contactFormUserConfirmation(data);

    const [adminSent, userSent] = await Promise.all([
      this.sendEmail({
        to:
          process.env.CONTACT_EMAIL ||
          process.env.EMAIL_SERVER_USER ||
          "contact@fygs.dev",
        subject: adminTemplate.subject,
        html: adminTemplate.html,
      }),
      this.sendEmail({
        to: data.email,
        subject: userTemplate.subject,
        html: userTemplate.html,
      }),
    ]);

    return { adminSent, userSent };
  }
}

export const emailService = EmailService.getInstance();
