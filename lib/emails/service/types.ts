import type { ContactFraming, ContactTimeline, ContactType } from "../../contact-qualification";

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
  type?: ContactType;
  company?: string;
  position?: string;
  timeline?: ContactTimeline;
  framing?: ContactFraming;
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
