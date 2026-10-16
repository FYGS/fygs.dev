import type { Project } from "../../types";

export const ideesKdo: Project = {
  id: "idees-kdo",
  title: "Idées KDO",
  description:
    "An innovative AI-powered application that generates fantastic gift ideas tailored to age and specific keywords. The app uses advanced natural language processing to understand user preferences and provide personalized gift suggestions.",
  image: "/projects/idees-kdo.png",
  detailImages: [
    {
      url: "/projects/idees-kdo.png",
      alt: "Idées KDO Homepage",
    },
  ],
  technologies: ["Next.js", "OpenAI API", "TailwindCSS", "Vercel AI SDK"],
  link: "https://nextjs-projects-chat-gpt-idee-kdo-nextjs.vercel.app",
  githubUrl: "https://github.com/fygs/idees-kdo",
  stats: {
    stars: 0,
    forks: 0,
    contributors: 1,
    linesOfCode: 500,
  },
  features: [
    "🎁 AI-powered gift suggestions",
    "👶 Age-based recommendations",
    "🔍 Keyword filtering",
    "🤖 OpenAI integration",
  ],
  technicalDetails:
    "Integrated with OpenAI's GPT model using the Vercel AI SDK for real-time gift suggestions. Implements streaming responses for better user experience.",
  challenges:
    "Fine-tuning the AI prompts to generate relevant and appropriate gift suggestions while maintaining response speed and accuracy.",
};
