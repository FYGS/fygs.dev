"use client";

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  if (!content) return null;

  return (
    <div className={cn("prose prose-sm max-w-none prose-invert", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          // Headers
          // The page embedding this markdown already has its <h1>: "# Title" becomes an <h2>
          h1: ({ children, ...props }) => (
            <h2 
              className="text-2xl font-bold mt-8 mb-6 scroll-mt-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent"
              {...props}
            >
              {children}
            </h2>
          ),
          h2: ({ children, ...props }) => (
            <h2 
              className="text-xl font-bold text-white mt-10 mb-5 pb-3 border-b-2 border-gradient-to-r from-blue-500 to-purple-500 scroll-mt-4"
              {...props}
            >
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {children}
              </div>
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 
              className="text-lg font-bold text-white mt-8 mb-4 flex items-center gap-3 scroll-mt-4"
              {...props}
            >
              <div className="w-1.5 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full flex-shrink-0"></div>
              <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                {children}
              </span>
            </h3>
          ),
          h4: ({ children, ...props }) => (
            <h4 
              className="text-base font-semibold text-white mt-6 mb-3"
              {...props}
            >
              {children}
            </h4>
          ),
          h5: ({ children, ...props }) => (
            <h5 
              className="text-sm font-medium text-slate-200 mt-4 mb-2"
              {...props}
            >
              {children}
            </h5>
          ),
          h6: ({ children, ...props }) => (
            <h6 
              className="text-sm font-medium text-slate-300 mt-3 mb-2"
              {...props}
            >
              {children}
            </h6>
          ),
          // Paragraphs
          p: ({ children, ...props }) => (
            <p 
              className="text-sm text-slate-300 leading-relaxed my-3 max-w-none"
              {...props}
            >
              {children}
            </p>
          ),
          // Lists
          ul: ({ children, ...props }) => (
            <ul className="space-y-2 my-4" {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol className="space-y-2 my-4 list-decimal list-inside" {...props}>
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li className="flex items-start gap-3 my-2" {...props}>
              <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mt-2.5 flex-shrink-0"></div>
              <span className="text-sm text-slate-300 leading-relaxed flex-1">
                {children}
              </span>
            </li>
          ),
          // Emphasis
          strong: ({ children, ...props }) => (
            <strong className="font-semibold text-white" {...props}>
              {children}
            </strong>
          ),
          em: ({ children, ...props }) => (
            <em className="italic text-slate-400" {...props}>
              {children}
            </em>
          ),
          // Code
          code: ({ children, ...props }) => {
            const isInline = !props.className?.includes('language-');
            if (isInline) {
              return (
                <code 
                  className="px-2 py-1 rounded-md bg-slate-800 text-sm font-mono text-slate-200 border border-slate-700"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <Card className="my-4 bg-slate-900 border border-slate-800">
                <CardContent className="p-4">
                  <pre className="text-sm font-mono text-slate-200 whitespace-pre-wrap overflow-x-auto">
                    <code {...props}>{children}</code>
                  </pre>
                </CardContent>
              </Card>
            );
          },
          pre: ({ children }) => (
            <div className="my-4">
              {children}
            </div>
          ),
          // Links
          a: ({ children, href, ...props }) => (
            <a 
              href={href}
              className="text-blue-400 hover:text-blue-300 underline decoration-2 underline-offset-2 transition-colors"
              target={href?.startsWith('http') ? '_blank' : undefined}
              rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
              {...props}
            >
              {children}
            </a>
          ),
          // Block quotes
          blockquote: ({ children, ...props }) => (
            <Card className="my-4 border-l-4 border-blue-500 bg-blue-950/30">
              <CardContent className="p-4">
                <blockquote 
                  className="text-slate-300 italic"
                  {...props}
                >
                  {children}
                </blockquote>
              </CardContent>
            </Card>
          ),
          // Horizontal rule
          hr: ({ ...props }) => (
            <Separator className="my-8 bg-gradient-to-r from-transparent via-slate-600 to-transparent" {...props} />
          ),
          // Tables
          table: ({ children, ...props }) => (
            <Card className="my-4 overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm" {...props}>
                    {children}
                  </table>
                </div>
              </CardContent>
            </Card>
          ),
          thead: ({ children, ...props }) => (
            <thead className="bg-slate-800" {...props}>
              {children}
            </thead>
          ),
          tbody: ({ children, ...props }) => (
            <tbody className="divide-y divide-slate-700" {...props}>
              {children}
            </tbody>
          ),
          tr: ({ children, ...props }) => (
            <tr className="hover:bg-slate-800/50" {...props}>
              {children}
            </tr>
          ),
          th: ({ children, ...props }) => (
            <th 
              className="px-4 py-3 text-left font-semibold text-white"
              {...props}
            >
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td 
              className="px-4 py-3 text-slate-300"
              {...props}
            >
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
