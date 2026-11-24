import { createElement, type ReactElement } from "react";

/**
 * Honeypot: a field no human sees or fills, that scripts which fill every input of a form do. Client-safe (no secret
 * and no Node API in this file), so a form component can render it and the route can test it.
 *
 *   <form> ... {honeypotFields()} ... </form>          // client or server component
 *   if (isHoneypotTripped(body)) return fakeSuccess();  // route: pretend it worked, tell the script nothing
 *
 * The timing trap ("submitted in under two seconds") is not a field here: it is the signed age of the proof-of-work
 * challenge (`MIN_AGE_MS` in pow.ts), which a script cannot forge, and which JSON clients do not need to carry.
 * The field name avoids the words browsers and password managers autofill (email, url, website, phone, company).
 */

export const HONEYPOT_FIELD = "fx_trap";

const ID = "fx-trap-field";

const OFFSCREEN = {
  position: "absolute",
  left: "-10000px",
  top: "auto",
  width: "1px",
  height: "1px",
  overflow: "hidden",
} as const;

/** The invisible input. Hidden from sight and from assistive technology, never focusable. */
export function honeypotFields(): ReactElement {
  return createElement(
    "div",
    { "aria-hidden": true, style: OFFSCREEN },
    createElement("label", { htmlFor: ID }, "Laissez ce champ vide"),
    createElement("input", {
      id: ID,
      name: HONEYPOT_FIELD,
      type: "text",
      tabIndex: -1,
      autoComplete: "off",
      defaultValue: "",
    }),
  );
}

/** True when the trap was filled, in a FormData or in a parsed JSON body. */
export function isHoneypotTripped(data: FormData | Record<string, unknown> | null | undefined): boolean {
  if (!data) return false;
  const value = data instanceof FormData ? data.get(HONEYPOT_FIELD) : data[HONEYPOT_FIELD];
  if (value === null || value === undefined) return false;
  return typeof value !== "string" || value.trim().length > 0;
}
