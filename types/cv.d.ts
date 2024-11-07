import { ForwardRefExoticComponent } from "react";

export interface Description {
  intro: {
    title: string;
    subtitle: string;
    mainText: string;
    description: string;
  };
  experience: {
    title: string;
    items: Array<{
      company: string;
      role: string;
      icon?: ForwardRefExoticComponent<
        Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
      >;
    }>;
  };
  services: {
    title: string;
    items: string[];
  };
  expertise: {
    title: string;
    items: Array<{
      title: string;
      description: string;
      icon?: ForwardRefExoticComponent<
        Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
      >;
    }>;
  };
  whyMe: {
    title: string;
    items: Array<{
      text: string;
      icon?: ForwardRefExoticComponent<
        Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
      >;
    }>;
  };
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  date: string;
  type?: string;
  description: string[];
  achievements?: string[];
  technologies?: string[];
  current?: boolean;
  context?: string;
}

export interface Education {
  title: string;
  institution: string;
  location: string;
  date: string;
  description: string[];
  gpa?: string;
}

export interface Certification {
  title: string;
  issuer: string;
  date: string;
  validUntil: string;
  credentialId: string;
  link: string;
}

export interface Skill {
  category: string;
  skills: string[];
}

export interface Language {
  language: string;
  level: string;
  proficiency?: string;
}

export interface Preference {
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  title: string;
  options: string[];
  current: string;
  details: Record<string, unknown>;
}

export interface Skills {
  technical: Skill[];
  languages: Language[];
  soft: string[];
}
