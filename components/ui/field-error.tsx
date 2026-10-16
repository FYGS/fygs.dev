import type { AriaAttributes } from "react";

import { cn } from "@/lib/utils";

/**
 * Accessible inline form error: announced when it appears (role="alert") and referenced
 * by the field through `aria-describedby` (see `fieldErrorProps`). WCAG 3.3.1 / 4.1.3.
 */
export function FieldError({
  id,
  message,
  className,
}: {
  /** The id of the field this error belongs to; the error element is `${id}-error`. */
  id: string;
  message?: string;
  className?: string;
}) {
  if (!message) return null;
  return (
    <p
      id={`${id}-error`}
      role="alert"
      className={cn("text-sm text-destructive", className)}
    >
      {message}
    </p>
  );
}

/** `aria-invalid` + `aria-describedby` props to spread on a field that renders a `FieldError`. */
export function fieldErrorProps(
  id: string,
  error?: unknown,
): Pick<AriaAttributes, "aria-invalid" | "aria-describedby"> {
  return error
    ? { "aria-invalid": true, "aria-describedby": `${id}-error` }
    : { "aria-invalid": false };
}
