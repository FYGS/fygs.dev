import { ModernEmailTemplates } from "../templates";

import { EmailTransport } from "./transport";

/** Account, course and subscription/billing senders. */
export class TransactionalEmailSenders extends EmailTransport {
  // Modern email templates methods
  async sendWelcomeEmail(
    userName: string,
    userEmail: string
  ): Promise<boolean> {
    const template = ModernEmailTemplates.welcomeRegistration({ userName });
    return this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
    });
  }

  async sendCoursePurchaseEmail(
    userName: string,
    userEmail: string,
    courseTitle: string,
    courseSlug: string,
    coursePrice?: number
  ): Promise<boolean> {
    const template = ModernEmailTemplates.coursePurchase({
      userName,
      courseTitle,
      courseSlug,
      coursePrice,
    });
    return this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
    });
  }

  async sendPremiumSubscriptionEmail(
    userName: string,
    userEmail: string,
    planName: string,
    price: number,
    billingPeriod: "monthly" | "yearly"
  ): Promise<boolean> {
    const template = ModernEmailTemplates.premiumSubscription({
      userName,
      planName,
      price,
      billingPeriod,
    });
    return this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
    });
  }

  async sendSubscriptionUpdatedEmail(
    userName: string,
    userEmail: string,
    planName: string,
    price: number,
    billingPeriod: "monthly" | "yearly",
    nextBillingDate: string
  ): Promise<boolean> {
    const template = ModernEmailTemplates.subscriptionUpdated({
      userName,
      planName,
      price,
      billingPeriod,
      nextBillingDate,
    });
    return this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
    });
  }

  async sendPasswordChangedEmail(
    userName: string,
    userEmail: string,
    changeDate: string,
    ipAddress?: string
  ): Promise<boolean> {
    const template = ModernEmailTemplates.passwordChanged({
      userName,
      changeDate,
      ipAddress,
    });
    return this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
    });
  }

  async sendPaymentFailedEmail(
    userName: string,
    userEmail: string
  ): Promise<boolean> {
    const template = ModernEmailTemplates.paymentFailed({ userName });
    return this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
    });
  }

  async sendSubscriptionCanceledEmail(
    userName: string,
    userEmail: string
  ): Promise<boolean> {
    const template = ModernEmailTemplates.subscriptionCanceled({ userName });
    return this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
    });
  }

  async sendSubscriptionCanceledImmediateEmail(
    userName: string,
    userEmail: string
  ): Promise<boolean> {
    const template = ModernEmailTemplates.subscriptionCanceledImmediate({
      userName,
    });
    return this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
    });
  }

  async sendSubscriptionPlanSwitchedEmail(
    userName: string,
    userEmail: string,
    planName: string,
    price: number,
    billingPeriod: "monthly" | "yearly",
    nextBillingDate?: string
  ): Promise<boolean> {
    const template = ModernEmailTemplates.subscriptionPlanSwitched({
      userName,
      planName,
      price,
      billingPeriod,
      nextBillingDate,
    });
    return this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
    });
  }

  async sendRefundIssuedEmail(
    userName: string,
    userEmail: string,
    courseTitle?: string,
    amount?: number
  ): Promise<boolean> {
    const template = ModernEmailTemplates.refundIssued({
      userName,
      courseTitle,
      amount,
    });
    return this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
    });
  }
}
