import type { Topic } from "../types";

export const securityDevopsTopics: Topic[] = [
  {
    route: "/tech-mastry/security-devops",
    title: "Sécurité & DevOps",
    description: "OWASP, CI/CD, conteneurs, cloud native",
    kind: "hub",
    level: "intermediate",
    minutes: 15,
    tags: [],
  },
  {
    route: "/tech-mastry/security-devops/owasp-top-10",
    title: "OWASP Top 10",
    description: "Vulnérabilités web critiques",
    kind: "guide",
    level: "intermediate",
    minutes: 10,
    tags: ["owasp", "xss", "sql injection", "csrf", "vulnérabilité"],
  },
  {
    route: "/tech-mastry/security-devops/cicd",
    title: "CI/CD",
    description: "Pipelines GitHub Actions",
    kind: "guide",
    level: "intermediate",
    minutes: 15,
    tags: ["ci/cd", "github actions", "pipeline", "déploiement", "deployment"],
  },
  {
    route: "/tech-mastry/security-devops/docker-kubernetes",
    title: "Docker & K8s",
    description: "Conteneurisation et orchestration",
    kind: "guide",
    level: "intermediate",
    minutes: 10,
    tags: ["docker", "kubernetes", "k8s", "conteneur", "container"],
  },
  {
    route: "/tech-mastry/security-devops/cloud-native",
    title: "Cloud Native",
    description: "12-Factor, Serverless",
    kind: "guide",
    level: "intermediate",
    minutes: 10,
    tags: ["cloud native", "12-factor", "serverless", "aws", "gcp"],
  },
];
