import type { Project } from "../../types";

export const pdfAiChat: Project = {
  id: "pdf-ai-chat",
  title: "PDF AI Chat",
  description:
    "An intelligent AI-powered application that allows users to upload PDF documents and have natural conversations with their content. Leverages advanced language models to extract, analyze, and discuss document information in real-time.",
  image: "/projects/pdf-ai-chat.png",
  detailImages: [
    {
      url: "/projects/pdf-ai-chat.png",
      alt: "PDF AI Chat Homepage",
    },
  ],
  technologies: [
    "Next.js 15",
    "TypeScript",
    "OpenAI API",
    "LangChain",
    "Pinecone",
    "TailwindCSS",
    "Vercel AI SDK",
    "Uploadthing",
  ],
  link: "https://pdf-ai-chat-opal.vercel.app/",
  features: [
    "📄 PDF document upload & parsing",
    "🤖 AI-powered conversational interface",
    "🔍 Semantic search across document content",
    "💬 Context-aware Q&A with citations",
    "📊 Vector embeddings for accurate retrieval",
    "⚡ Real-time streaming responses",
    "🎨 Clean and intuitive dark UI",
    "📱 Fully responsive design",
  ],
  stats: {
    stars: 0,
    forks: 0,
    contributors: 1,
    linesOfCode: 4500,
  },
  technicalDetails:
    "Built with Next.js 15 App Router, integrating OpenAI's GPT model via LangChain for document comprehension. Uses Pinecone vector database for efficient semantic search across PDF content. Implements Vercel AI SDK for streaming responses and Uploadthing for secure file handling.",
  challenges:
    "Implementing efficient document chunking and embedding strategies to maintain context accuracy across large PDFs. Optimizing vector search latency while preserving response quality and relevance.",
};
