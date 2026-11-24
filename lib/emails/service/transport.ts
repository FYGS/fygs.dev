import { createTransport, type Transporter } from "nodemailer";

import { singleLine } from "@/lib/html-escape";

import { captureEmail, isCaptureRequested } from "./capture";
import type { EmailOptions } from "./types";

/** Hosts where an SMTP server without TLS is acceptable (a local mail catcher in development). */
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

/** One address, nothing else: no list, no display name, no line break that would add a header. */
const SINGLE_ADDRESS = /^[^\s<>,;"'\\()[\]@]+@[^\s<>,;"'\\()[\]@]+\.[^\s<>,;"'\\()[\]@]+$/;

export function isSingleAddress(value: string): boolean {
  return value.length <= 254 && SINGLE_ADDRESS.test(value);
}

/** Transport options: TLS is mandatory unless the server is on this machine. */
export function smtpOptions(env: NodeJS.ProcessEnv = process.env) {
  const host = env.EMAIL_SERVER_HOST;
  const port = parseInt(env.EMAIL_SERVER_PORT || "587");
  const secure = port === 465;
  const local = !host || LOCAL_HOSTS.has(host);
  return {
    host,
    port,
    secure,
    // STARTTLS is not optional: a network attacker cannot strip it and read or alter the mail
    requireTLS: !secure && !local,
    tls: { minVersion: "TLSv1.2" as const },
    auth: {
      user: env.EMAIL_SERVER_USER,
      pass: env.EMAIL_SERVER_PASSWORD,
    },
  };
}

/** Plain-text version of an HTML mail: styles and head dropped, tags removed. */
export function htmlToText(html: string): string {
  return html
    .replace(/<(style|head|title)[\s\S]*?<\/\1>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** SMTP transport: lazily creates the nodemailer transporter and sends mail. */
export class EmailTransport {
  private transporter: Transporter | null = null;

  private getTransporter() {
    if (!this.transporter) {
      this.transporter = createTransport(smtpOptions());
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
      if (!isSingleAddress(to)) throw new Error("Email recipient is not a single address");
      const transporter = this.getTransporter();

      if (!transporter) {
        throw new Error("Email transporter not configured");
      }

      await transporter.sendMail({
        from: `${singleLine(process.env.EMAIL_FROM_NAME, 80)} <${singleLine(process.env.EMAIL_FROM, 254)}>`,
        to,
        // A subject is a header: one line, whatever a template put in it
        subject: singleLine(subject, 200),
        html,
        text: text || htmlToText(html),
      });

      return true;
    } catch (error) {
      console.error("Email sending failed:", error);
      return false;
    }
  }
}
