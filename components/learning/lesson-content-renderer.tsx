import { EnhancedCodeViewer } from "@/components/mdx/enhanced-code-viewer";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

interface LessonContentRendererProps {
  content: string;
}

type CodeBlockData = {
  code: string;
  language: string;
  filename?: string;
};

function normalizeCodeText(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((part) => normalizeCodeText(part)).join("");
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "props" in value &&
    typeof (value as { props?: unknown }).props === "object"
  ) {
    return normalizeCodeText(
      ((value as { props?: { children?: unknown } }).props?.children ?? "") as
        | unknown
        | string,
    );
  }

  return "";
}

function extractCodeBlock(children: React.ReactNode): CodeBlockData | null {
  const childArray = React.Children.toArray(children);

  const codeElement = childArray.find((child) => {
    if (!React.isValidElement(child)) {
      return false;
    }

    const childProps = child.props as { className?: string };
    return (
      child.type === "code" ||
      Boolean(childProps.className?.includes("language-"))
    );
  }) as React.ReactElement<{
    className?: string;
    children?: React.ReactNode;
    [key: string]: unknown;
  }> | null;

  if (!codeElement) {
    return null;
  }

  const className = codeElement.props.className || "";
  const languageMatch = className.match(/language-([\w-]+)/);
  const language = languageMatch?.[1] || "text";
  const code = normalizeCodeText(codeElement.props.children);
  const filename =
    typeof codeElement.props["data-filename"] === "string"
      ? (codeElement.props["data-filename"] as string)
      : undefined;

  return {
    code,
    language,
    filename,
  };
}

export function LessonContentRenderer({
  content,
}: LessonContentRendererProps): React.ReactElement {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, rehypeSlug]}
      components={{
        script: () => null,
        style: () => null,
        pre: ({ children }) => {
          const block = extractCodeBlock(children);

          if (!block) {
            return (
              <pre className="rounded-lg bg-muted/50 p-4 overflow-x-auto">
                {children}
              </pre>
            );
          }

          return (
            <EnhancedCodeViewer
              code={block.code}
              language={block.language}
              filename={block.filename}
              theme="dark"
            />
          );
        },
        code: ({ className, children, ...props }) => {
          const isCodeBlock = Boolean(className?.includes("language-"));

          if (isCodeBlock) {
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }

          return (
            <code
              className={cn(
                "relative rounded bg-secondary/50 px-1.5 py-0.5 font-mono text-sm text-emerald-400",
                className,
              )}
              {...props}
            >
              {children}
            </code>
          );
        },
        a: ({ href = "", children, className, ...props }) => {
          const safeHref = /^(https?:|mailto:|tel:|\/|#)/i.test(href)
            ? href
            : "#";
          const isExternal = /^https?:/i.test(safeHref);

          if (isExternal) {
            return (
              <a
                href={safeHref}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "text-primary no-underline hover:text-primary/80",
                  className,
                )}
                {...props}
              >
                {children}
              </a>
            );
          }

          return (
            <Link
              href={safeHref}
              className={cn(
                "text-primary no-underline hover:text-primary/80",
                className,
              )}
              {...props}
            >
              {children}
            </Link>
          );
        },
        img: ({ src = "", alt = "", className, ...props }) => {
          const safeSrc = typeof src === "string" ? src : "";
          const width =
            typeof props.width === "number"
              ? props.width
              : Number.parseInt(String(props.width ?? ""), 10) || 1200;
          const height =
            typeof props.height === "number"
              ? props.height
              : Number.parseInt(String(props.height ?? ""), 10) || 675;

          return (
            <Image
              src={safeSrc}
              alt={alt}
              width={width}
              height={height}
              className={cn("h-auto w-full rounded-lg shadow-lg", className)}
              loading="lazy"
            />
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
