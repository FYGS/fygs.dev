import { Award, Briefcase, Code2, Rocket, Target, Users, Workflow } from "lucide-react";
import type { CvData } from "./cv-types";

// Combine localized data with icons
export function buildExperienceItems(cvData: CvData) {
  return [
    {
      icon: Briefcase,
      company: cvData.description.experience.allianz.company,
      role: cvData.description.experience.allianz.role,
    },
    {
      icon: Briefcase,
      company: cvData.description.experience.ge.company,
      role: cvData.description.experience.ge.role,
    },
    {
      icon: Rocket,
      company: cvData.description.experience.ouestech.company,
      role: cvData.description.experience.ouestech.role,
    },
  ];
}

export function buildExpertiseItems(cvData: CvData) {
  return [
    {
      icon: Code2,
      title: cvData.description.expertise.react.title,
      description: cvData.description.expertise.react.description,
    },
    {
      icon: Workflow,
      title: cvData.description.expertise.nodejs.title,
      description: cvData.description.expertise.nodejs.description,
    },
    {
      icon: Code2,
      title: cvData.description.expertise.python.title,
      description: cvData.description.expertise.python.description,
    },
    {
      icon: Rocket,
      title: cvData.description.expertise.cloud.title,
      description: cvData.description.expertise.cloud.description,
    },
  ];
}

export function buildServicesItems(cvData: CvData) {
  return [
    cvData.description.services.items.webDev,
    cvData.description.services.items.modernization,
    cvData.description.services.items.optimization,
    cvData.description.services.items.cicd,
    cvData.description.services.items.api,
    cvData.description.services.items.training,
    cvData.description.services.items.workshops,
    cvData.description.services.items.support,
  ];
}

export function buildWhyMeItems(cvData: CvData) {
  return [
    {
      icon: Target,
      text: cvData.description.whyMe.items.expertise,
    },
    {
      icon: Users,
      text: cvData.description.whyMe.items.translation,
    },
    {
      icon: Award,
      text: cvData.description.whyMe.items.results,
    },
  ];
}
