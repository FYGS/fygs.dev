import { javascriptTemplate } from './javascript';
import { typescriptTemplate } from './typescript';
import { htmlTemplate } from './html';
import { cssTemplate } from './css';
import { reactTemplate } from './react';

// Template interface
export interface Template {
  name: string;
  files: {
    name: string;
    language: string;
    content: string;
  }[];
}

// Export all templates
export const templates: Record<string, Template> = {
  javascript: javascriptTemplate,
  typescript: typescriptTemplate,
  html: htmlTemplate,
  css: cssTemplate,
  react: reactTemplate,
};

// Get template by name
export function getTemplate(name: string): Template | undefined {
  return templates[name.toLowerCase()];
}

// Get all template names
export function getTemplateNames(): string[] {
  return Object.keys(templates).map(key => templates[key].name);
}

// Default template
export const defaultTemplate = javascriptTemplate;
