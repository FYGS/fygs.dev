import { createTransport, type Transporter } from "nodemailer";

import { captureEmail, isCaptureRequested } from "./capture";
import type { EmailOptions } from "./types";

/** SMTP transport: lazily creates the nodemailer transporter and sends mail. */
export class EmailTransport {
  private transporter: Transporter | null = null;

  private getTransporter() {
    if (!this.transporter) {
      this.transporter = createTransport({
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
    // Test-only hook (see ./capture): fails closed, never reaches SMTP when requested.
    if (isCaptureRequested()) {
      captureEmail({ to, subject, html, text });
      return true;
    }
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
}
