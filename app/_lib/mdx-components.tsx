import { EnhancedCodeViewer } from "@/components/mdx/enhanced-code-viewer";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MDXComponents, MDXImageProps } from "@/types/mdx";
import { ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Improved type safety for MDX props
type MDXPreProps = React.ComponentPropsWithRef<"pre"> & {
  children?: {
    props?: {
      children?: string;
      className?: string;
      ["data-filename"]?: string;
      ["data-language"]?: string;
      ["data-theme"]?: string;
    };
  };
};

export const mdxComponents: MDXComponents = {
  // Typography
  h1: ({ className, ...props }) => (
    <h1
      className={cn("scroll-m-20 text-4xl font-bold tracking-tight", className)}
      {...props}
    />
  ),
  h2: ({ className, ...props }) => (
    <h2
      className={cn(
        "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0",
        className
      )}
      {...props}
    />
  ),
  h3: ({ className, ...props }) => (
    <h3
      className={cn(
        "scroll-m-20 text-2xl font-semibold tracking-tight",
        className
      )}
      {...props}
    />
  ),
  h4: ({ className, ...props }) => (
    <h4
      className={cn(
        "scroll-m-20 text-xl font-semibold tracking-tight",
        className
      )}
      {...props}
    />
  ),
  p: ({ className, ...props }) => (
    <p
      className={cn("leading-7 [&:not(:first-child)]:mt-6", className)}
      {...props}
    />
  ),
  ul: ({ className, ...props }) => (
    <ul className={cn("my-6 ml-6 list-disc", className)} {...props} />
  ),
  ol: ({ className, ...props }) => (
    <ol className={cn("my-6 ml-6 list-decimal", className)} {...props} />
  ),
  li: ({ className, ...props }) => (
    <li className={cn("mt-2", className)} {...props} />
  ),
  blockquote: ({ className, ...props }) => (
    <blockquote
      className={cn(
        "mt-6 border-l-2 border-primary pl-6 italic [&>*]:text-muted-foreground",
        className
      )}
      {...props}
    />
  ),

  // Special elements
  img: ({ src, alt = "Image", className, ...props }: MDXImageProps) => {
    if (!src) {
      // Instead of returning null, return an empty div or error message
      return (
        <div className="p-4 border border-destructive rounded-lg bg-destructive/10 text-destructive">
          Missing image source
        </div>
      );
    }

    const imageProps = {
      src,
      alt,
      width: props.width || 1200,
      height: props.height || 630,
      className: cn("rounded-lg border", className),
      ...props,
    };

    const isExternal = typeof src === "string" && src.startsWith("http");

    return (
      // eslint-disable-next-line jsx-a11y/alt-text
      <Image
        {...imageProps}
        className={cn(
          "rounded-lg border",
          isExternal && "bg-muted/10",
          className
        )}
        loading={props.priority ? "eager" : "lazy"}
        quality={props.quality || 80}
        {...(isExternal
          ? {}
          : {
              placeholder: "blur",
              blurDataURL:
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
            })}
      />
    );
  },
  hr: ({ ...props }) => <hr className="my-4 border-muted md:my-8" {...props} />,
  table: ({ className, ...props }) => (
    <div className="my-6 w-full overflow-y-auto">
      <table className={cn("w-full", className)} {...props} />
    </div>
  ),
  tr: ({ className, ...props }) => (
    <tr
      className={cn("m-0 border-t p-0 even:bg-muted", className)}
      {...props}
    />
  ),
  th: ({ className, ...props }) => (
    <th
      className={cn(
        "border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right",
        className
      )}
      {...props}
    />
  ),
  td: ({ className, ...props }) => (
    <td
      className={cn(
        "border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right",
        className
      )}
      {...props}
    />
  ),

  // Code blocks
  pre: ({ children, ...props }: MDXPreProps) => {
    if (!children?.props) {
      return <pre {...props} />; // Return empty pre element instead of null
    }

    const code = children.props.children || "";
    const lang = children.props.className?.replace(/^language-/, "") || "";
    const filename = children.props["data-filename"];
    const theme = children.props["data-theme"] || "dark";

    return (
      <EnhancedCodeViewer
        code={code}
        language={lang}
        filename={filename}
        theme={theme}
      />
    );
  },
  code: ({ className, ...props }) => (
    <code
      className={cn(
        "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm",
        className
      )}
      {...props}
    />
  ),

  // Links
  a: ({ href = "", children, className, ...props }) => {
    const isExternal = href.startsWith("http");
    const Component = isExternal ? "a" : Link;

    const linkProps = isExternal
      ? {
          target: "_blank",
          rel: "noopener noreferrer",
          href,
        }
      : { href };

    return (
      <Component
        className={cn(
          buttonVariants({ variant: "link" }),
          "text-primary hover:text-primary/80 inline-flex items-center gap-1",
          className
        )}
        {...linkProps}
        {...props}
      >
        {children}
        {isExternal && <ExternalLink className="h-3 w-3" aria-hidden="true" />}
      </Component>
    );
  },
};
