import type { StaticImageData } from "next/image";
import type { ComponentPropsWithoutRef } from "react";

type WithChildren<T = unknown> = T & { children?: React.ReactNode };

export type MDXProps = WithChildren;

// Create a custom image props type that merges Next.js Image props with MDX requirements
export type MDXImageProps = {
  src: string | StaticImageData;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  loading?: "lazy" | "eager";
};

export interface MDXComponents {
  h1?: (props: ComponentPropsWithoutRef<"h1">) => JSX.Element;
  h2?: (props: ComponentPropsWithoutRef<"h2">) => JSX.Element;
  h3?: (props: ComponentPropsWithoutRef<"h3">) => JSX.Element;
  h4?: (props: ComponentPropsWithoutRef<"h4">) => JSX.Element;
  h5?: (props: ComponentPropsWithoutRef<"h5">) => JSX.Element;
  h6?: (props: ComponentPropsWithoutRef<"h6">) => JSX.Element;
  p?: (props: ComponentPropsWithoutRef<"p">) => JSX.Element;
  a?: (props: ComponentPropsWithoutRef<"a">) => JSX.Element;
  ul?: (props: ComponentPropsWithoutRef<"ul">) => JSX.Element;
  ol?: (props: ComponentPropsWithoutRef<"ol">) => JSX.Element;
  li?: (props: ComponentPropsWithoutRef<"li">) => JSX.Element;
  blockquote?: (props: ComponentPropsWithoutRef<"blockquote">) => JSX.Element;
  // Use Next.js Image props instead of HTML img
  img: (props: MDXImageProps) => JSX.Element | null; // Allow null return type
  hr?: (props: ComponentPropsWithoutRef<"hr">) => JSX.Element;
  table?: (props: ComponentPropsWithoutRef<"table">) => JSX.Element;
  tr?: (props: ComponentPropsWithoutRef<"tr">) => JSX.Element;
  th?: (props: ComponentPropsWithoutRef<"th">) => JSX.Element;
  td?: (props: ComponentPropsWithoutRef<"td">) => JSX.Element;
  pre?: (
    props: ComponentPropsWithoutRef<"pre"> & {
      children?: {
        props?: {
          children?: string;
          className?: string;
          "data-filename"?: string;
          "data-theme"?: "dark" | "light"; // Restrict theme values
        };
      };
    }
  ) => JSX.Element;
  code?: (props: ComponentPropsWithoutRef<"code">) => JSX.Element;
  em?: (props: ComponentPropsWithoutRef<"em">) => JSX.Element;
  strong?: (props: ComponentPropsWithoutRef<"strong">) => JSX.Element;
  delete?: (props: ComponentPropsWithoutRef<"del">) => JSX.Element;
  inlineCode?: (props: ComponentPropsWithoutRef<"code">) => JSX.Element;
}
