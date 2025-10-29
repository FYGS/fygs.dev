"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";

interface MDXContentProps {
  content: string;
  className?: string;
}

export function MDXContent({ content, className = "" }: MDXContentProps) {
  if (!content) return null;

  return (
    <div className={`mdx-content prose prose-sm dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            
            if (!inline && language) {
              return (
                <SyntaxHighlighter
                  style={tomorrow}
                  language={language}
                  PreTag="div"
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              );
            }
            
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          // Add other custom components if needed
          h1: ({ children, ...props }) => (
            <h1 className="scroll-m-20 text-2xl font-bold tracking-tight" {...props}>
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 className="scroll-m-20 text-xl font-semibold tracking-tight" {...props}>
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 className="scroll-m-20 text-lg font-semibold tracking-tight" {...props}>
              {children}
            </h3>
          ),
          blockquote: ({ children, ...props }) => (
            <blockquote className="border-l-4 border-muted-foreground/40 pl-4 italic" {...props}>
              {children}
            </blockquote>
          ),
          ul: ({ children, ...props }) => (
            <ul className="list-disc list-inside space-y-1" {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol className="list-decimal list-inside space-y-1" {...props}>
              {children}
            </ol>
          ),
          table: ({ children, ...props }) => (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-border" {...props}>
                {children}
              </table>
            </div>
          ),
          th: ({ children, ...props }) => (
            <th className="border border-border bg-muted/50 px-4 py-2 text-left font-semibold" {...props}>
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td className="border border-border px-4 py-2" {...props}>
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