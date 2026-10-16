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
  type?: "recruitment" | "collaboration" | "training" | "general";
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
